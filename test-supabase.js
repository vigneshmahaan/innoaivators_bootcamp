const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log('Connecting to:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  const { data, error } = await supabase.from('bootcamps').select('*');
  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Fetched bootcamps count:', data.length);
    console.log(data);
  }
}

test();
