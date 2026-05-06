'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function loginAdmin(formData: FormData) {
  const password = formData.get('password') as string;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Default fallback for development

  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set('admin_auth', 'true', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 // 1 day
    });
    redirect('/admin');
  } else {
    return { error: 'Invalid password' };
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_auth');
  redirect('/admin/login');
}

export async function deleteBootcamp(id: string) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_auth')) {
    throw new Error('Unauthorized');
  }

  // Need supabase client here. Since it's a server action, we can import the standard one
  // Note: in a real app, use @supabase/ssr for server actions
  const { supabase } = await import('@/lib/supabase');
  
  const { error } = await supabase
    .from('bootcamps')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting bootcamp:', error);
    throw new Error('Failed to delete bootcamp');
  }

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function createBootcamp(formData: FormData) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_auth')) {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priceStr = formData.get('price') as string;
  const durationStr = formData.get('duration_days') as string;
  const topics_covered = formData.get('topics_covered') as string;
  const final_task = formData.get('final_task') as string;
  
  if (!title || !description || !priceStr) {
    return { error: 'Required fields are missing' };
  }

  const price = parseInt(priceStr, 10);
  if (isNaN(price) || price < 0) {
    return { error: 'Invalid price' };
  }

  const duration_days = durationStr ? parseInt(durationStr, 10) : null;

  const { supabase } = await import('@/lib/supabase');
  
  const { error } = await supabase
    .from('bootcamps')
    .insert({ 
      title, 
      description, 
      price,
      duration_days,
      topics_covered,
      final_task
    });

  if (error) {
    console.error('Error creating bootcamp:', error);
    return { error: 'Failed to create bootcamp' };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}

export async function deleteRegistration(id: string) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_auth')) {
    throw new Error('Unauthorized');
  }

  const { supabase } = await import('@/lib/supabase');
  
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting registration:', error);
    throw new Error('Failed to delete registration');
  }
}

export async function updateRegistrationPaymentStatus(id: string, status: string) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_auth')) {
    throw new Error('Unauthorized');
  }

  const { supabase } = await import('@/lib/supabase');
  
  const { error } = await supabase
    .from('registrations')
    .update({ payment_status: status })
    .eq('id', id);

  if (error) {
    console.error('Error updating registration status:', error);
    throw new Error('Failed to update registration status');
  }
}

export async function createBatch(bootcampId: string, name: string) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_auth')) throw new Error('Unauthorized');

  const { supabase } = await import('@/lib/supabase');
  const { error } = await supabase
    .from('batches')
    .insert({ bootcamp_id: bootcampId, name });

  if (error) throw new Error('Failed to create batch');
}

export async function assignBatch(registrationId: string, batchId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_auth')) throw new Error('Unauthorized');

  const { supabase } = await import('@/lib/supabase');
  const { error } = await supabase
    .from('registrations')
    .update({ batch_id: batchId || null })
    .eq('id', registrationId);

  if (error) throw new Error('Failed to assign batch');
}

export async function triggerMeetingLinkEmail(batchId: string, timing: string, meetingLink: string) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_auth')) throw new Error('Unauthorized');

  const { supabase } = await import('@/lib/supabase');
  
  // Update the batch with timing and link
  await supabase
    .from('batches')
    .update({ timing, meeting_link: meetingLink })
    .eq('id', batchId);

  // Get all verified users in this batch
  const { data: regs, error } = await supabase
    .from('registrations')
    .select(`
      users (name, email),
      bootcamps (title),
      batches (name)
    `)
    .eq('batch_id', batchId)
    .eq('payment_status', 'verified');

  if (error) throw new Error('Failed to fetch batch users');

  if (!regs || regs.length === 0) return { count: 0 };

  const { sendMeetingLinkEmail } = await import('@/lib/email');
  let successCount = 0;

  for (const _reg of regs) {
    const reg = _reg as any;
    if (reg.users?.email && reg.batches?.name && reg.bootcamps?.title) {
      try {
        await sendMeetingLinkEmail(
          reg.users.email,
          reg.users.name,
          reg.bootcamps.title,
          reg.batches.name,
          timing,
          meetingLink
        );
        successCount++;
      } catch (err) {
        console.error(`Failed to send to ${reg.users.email}`);
      }
    }
  }
  
  return { count: successCount };
}

export async function bulkSendStatusEmails(bootcampId?: string) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_auth')) throw new Error('Unauthorized');

  const { supabase } = await import('@/lib/supabase');
  const { sendVerificationEmail, sendFailedEmail } = await import('@/lib/email');

  let verifiedCount = 0;
  let failedCount = 0;

  // --- Send Verified Emails ---
  const verifiedQuery = supabase
    .from('registrations')
    .select('id, users(name, email), bootcamps(title), batches(name)')
    .eq('payment_status', 'verified')
    .eq('verified_email_sent', false);

  if (bootcampId) verifiedQuery.eq('bootcamp_id', bootcampId);

  const { data: verifiedRegs } = await verifiedQuery;

  for (const _reg of (verifiedRegs || [])) {
    const reg = _reg as any;
    if (reg.users?.email) {
      try {
        await sendVerificationEmail(
          reg.users.email,
          reg.users.name,
          reg.bootcamps?.title || 'Course',
          reg.batches?.name || 'Your assigned batch'
        );
        await supabase.from('registrations').update({ verified_email_sent: true }).eq('id', reg.id);
        verifiedCount++;
      } catch (err) {
        console.error(`Failed to send verified email to ${reg.users.email}`);
      }
    }
  }

  // --- Send Failed Emails ---
  const failedQuery = supabase
    .from('registrations')
    .select('id, users(name, email), bootcamps(title)')
    .eq('payment_status', 'failed')
    .eq('failed_email_sent', false);

  if (bootcampId) failedQuery.eq('bootcamp_id', bootcampId);

  const { data: failedRegs } = await failedQuery;

  for (const _reg of (failedRegs || [])) {
    const reg = _reg as any;
    if (reg.users?.email) {
      try {
        await sendFailedEmail(
          reg.users.email,
          reg.users.name,
          reg.bootcamps?.title || 'Course'
        );
        await supabase.from('registrations').update({ failed_email_sent: true }).eq('id', reg.id);
        failedCount++;
      } catch (err) {
        console.error(`Failed to send failed email to ${reg.users.email}`);
      }
    }
  }

  return { verifiedCount, failedCount };
}

export async function autoAssignBatches(bootcampId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_auth')) throw new Error('Unauthorized');

  const { supabase } = await import('@/lib/supabase');

  // Get all batches for this course
  const { data: batches } = await supabase
    .from('batches')
    .select('id')
    .eq('bootcamp_id', bootcampId)
    .order('created_at', { ascending: true });

  if (!batches || batches.length === 0) throw new Error('No batches found for this course. Create batches first.');

  // Get all unassigned registrations for this course
  const { data: unassigned } = await supabase
    .from('registrations')
    .select('id')
    .eq('bootcamp_id', bootcampId)
    .is('batch_id', null);

  if (!unassigned || unassigned.length === 0) return { count: 0 };

  // Round-robin assign
  const updates = unassigned.map((reg, index) => ({
    id: reg.id,
    batch_id: batches[index % batches.length].id,
  }));

  let assignedCount = 0;
  for (const update of updates) {
    const { error } = await supabase
      .from('registrations')
      .update({ batch_id: update.batch_id })
      .eq('id', update.id);
    if (!error) assignedCount++;
  }

  return { count: assignedCount };
}
