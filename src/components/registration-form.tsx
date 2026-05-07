'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface RegistrationFormProps {
  bootcampId: string;
  price: number;
}

export function RegistrationForm({ bootcampId, price }: RegistrationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    district: '',
    state: '',
    country: '',
    studentType: 'college', // Default to college
    institutionName: '',
    educationDetails: '',
    yearOfStudy: '',
    department: '',
    fieldOfStudy: '',
    futureInterests: '',
    paymentProofUrl: '',
  });

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPaymentFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      handleNext();
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalPaymentUrl = formData.paymentProofUrl;

      // 0. Upload image if exists
      if (paymentFile) {
        const fileExt = paymentFile.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `proofs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(filePath, paymentFile);

        if (uploadError) throw new Error('Failed to upload screenshot. Please try again.');

        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(filePath);
        
        finalPaymentUrl = publicUrl;
      } else if (step === 4 && !formData.paymentProofUrl) {
        throw new Error('Please upload a payment screenshot.');
      }

      // 1. Create or get user
      let { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email);

      let userId;

      if (userError) throw userError;

      if (!users || users.length === 0) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: `${formData.countryCode} ${formData.phone}`,
            district: formData.district,
            state: formData.state,
            country: formData.country
          })
          .select('id')
          .single();

        if (createError) throw createError;
        userId = newUser.id;
      } else {
        userId = users[0].id;
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: formData.name,
            phone: `${formData.countryCode} ${formData.phone}`,
            district: formData.district,
            state: formData.state,
            country: formData.country
          })
          .eq('id', userId);

        if (updateError) throw updateError;
      }

      // 2. Create registration
      const { error: regError } = await supabase
        .from('registrations')
        .insert({
          user_id: userId,
          bootcamp_id: bootcampId,
          student_type: formData.studentType,
          institution_name: formData.institutionName,
          education_details: formData.educationDetails,
          year_of_study: formData.yearOfStudy,
          department: formData.department,
          field_of_study: formData.fieldOfStudy,
          future_interests: formData.futureInterests,
          payment_status: 'pending',
          payment_proof_url: finalPaymentUrl,
        });

      if (regError) throw regError;

      // Redirect to success
      router.push(`/success?bootcampId=${bootcampId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const baseInputClass = "bg-[#111] border border-[#222] rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-all font-medium text-sm shadow-inner";
  const inputClass = `w-full ${baseInputClass}`;
  const labelClass = "block text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold";

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-8 relative shadow-2xl overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 ${step >= i ? 'bg-accent' : 'bg-[#333]'}`}></div>
        ))}
      </div>

      {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 mb-6 text-sm font-mono">{error}</div>}

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold uppercase mb-6">1. Personal Info</h2>
            <div>
              <label className={labelClass}>Full Name <span className="text-red-500 ml-1">*</span></label>
              <input required type="text" className={inputClass} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Email Address <span className="text-red-500 ml-1">*</span></label>
              <input required type="email" className={inputClass} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Phone Number <span className="text-red-500 ml-1">*</span></label>
              <div className="flex gap-2">
                <select
                  className={`${baseInputClass} w-[100px] shrink-0`}
                  value={formData.countryCode}
                  onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+971">+971 (AE)</option>
                  <option value="+65">+65 (SG)</option>
                </select>
                <input required type="tel" className={`${baseInputClass} flex-1 min-w-0`} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone number" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>District <span className="text-red-500 ml-1">*</span></label>
                <input required type="text" className={inputClass} value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} placeholder="e.g. Salem" />
              </div>
              <div>
                <label className={labelClass}>State <span className="text-red-500 ml-1">*</span></label>
                <input required type="text" className={inputClass} value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="e.g. Tamil Nadu" />
              </div>
              <div>
                <label className={labelClass}>Country <span className="text-red-500 ml-1">*</span></label>
                <input required type="text" className={inputClass} value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} placeholder="e.g. India" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold uppercase mb-6">2. Academic Background</h2>

            <div>
              <label className={labelClass}>Institution Name <span className="text-red-500 ml-1">*</span></label>
              <input required type="text" className={inputClass} value={formData.institutionName} onChange={e => setFormData({ ...formData, institutionName: e.target.value })} placeholder="Name of your college" />
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>Field of Study <span className="text-red-500 ml-1">*</span></label>
                <select required className={inputClass} value={formData.fieldOfStudy} onChange={e => setFormData({ ...formData, fieldOfStudy: e.target.value })}>
                  <option value="">Select Field</option>
                  <option value="Arts">Arts</option>
                  <option value="Science">Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Degree / Course <span className="text-red-500 ml-1">*</span></label>
                <input required type="text" className={inputClass} value={formData.educationDetails} onChange={e => setFormData({ ...formData, educationDetails: e.target.value })} placeholder="e.g., B.Tech, B.Sc" />
              </div>
              <div>
                <label className={labelClass}>Department / Branch <span className="text-red-500 ml-1">*</span></label>
                <input required type="text" className={inputClass} value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="e.g., Computer Science, Mechanical" />
              </div>
              <div>
                <label className={labelClass}>Year of Study <span className="text-red-500 ml-1">*</span></label>
                <input required type="text" className={inputClass} value={formData.yearOfStudy} onChange={e => setFormData({ ...formData, yearOfStudy: e.target.value })} placeholder="e.g., 2nd Year, Final Year" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold uppercase mb-6">3. Future Interests</h2>
            <div>
              <label className={labelClass}>What topics are you interested in for future bootcamps? <span className="text-red-500 ml-1">*</span></label>
              <textarea
                required
                rows={4}
                className={inputClass}
                value={formData.futureInterests}
                onChange={e => setFormData({ ...formData, futureInterests: e.target.value })}
                placeholder="e.g., AI, Web Development, Cybersecurity..."
              ></textarea>
              <p className="text-gray-500 text-xs mt-2 font-mono">This helps us design future curriculum tailored for you.</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold uppercase mb-6">4. Payment Verification</h2>
            <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 mb-6">
              <h3 className="text-primary font-bold text-lg mb-2">Total Amount: ₹{price.toLocaleString('en-IN')}</h3>
              <p className="text-gray-400 text-sm mb-6">Complete your payment securely via UPI. Once done, paste the transaction/screenshot link below for verification.</p>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                  {/* In a real app, this would be a dynamic QR code */}
                  <div className="text-black text-center">
                    <div className="font-black text-xs mb-2 uppercase tracking-tighter">Scan to Pay</div>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=7010396731@superyes%26pn=InnoAivators%20Tech%26mc=0000%26tn=Bootcamp%20Registration%26am=${price}.00%26cu=INR`}
                      alt="UPI QR Code"
                      className="w-32 h-32 mx-auto"
                    />
                    <div className="font-mono text-[10px] mt-2 font-bold opacity-50 uppercase">UPI ID: 7010396731@superyes</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <a
                    href={`upi://pay?pa=7010396731@superyes&pn=InnoAivators%20Tech&mc=0000&tn=Bootcamp%20Registration&am=${price}.00&cu=INR`}
                    className="flex items-center justify-center gap-3 w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all text-sm"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4" />
                    Pay via UPI App
                  </a>
                  <p className="text-[10px] text-gray-500 font-mono text-center uppercase tracking-widest leading-relaxed">
                    Supported: GPay, PhonePe, Paytm, etc.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className={labelClass}>Upload Payment Screenshot <span className="text-red-500 ml-1">*</span></label>
              
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${
                  paymentPreview ? 'border-accent bg-accent/5' : 'border-[#333] hover:border-accent/50 bg-[#0a0a0a]'
                }`}
              >
                {paymentPreview ? (
                  <div className="relative w-full aspect-video md:aspect-square max-h-[300px] rounded-lg overflow-hidden group">
                    <img src={paymentPreview} alt="Payment Preview" className="w-full h-full object-contain" />
                    <button 
                      type="button"
                      onClick={() => { setPaymentFile(null); setPaymentPreview(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Tap to Select Screenshot</p>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Supports: JPG, PNG (Max 5MB)</p>
                    </div>
                  </>
                )}
                
                <input
                  required={!paymentPreview}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <p className="text-gray-500 text-[10px] mt-2 font-mono uppercase tracking-widest text-center">
                Our team will verify the screenshot and notify you.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-12">
          {step > 1 ? (
            <button type="button" onClick={handlePrev} className="px-6 py-3 border border-[#333] rounded-xl text-gray-400 hover:text-white hover:border-white transition-colors uppercase text-sm font-bold tracking-widest">
              Back
            </button>
          ) : <div></div>}

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-white text-black rounded-xl hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all uppercase text-sm font-bold tracking-widest disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Processing...' : step === 4 ? 'Submit Registration' : 'Next Step'}
            {!loading && step < 4 && <span>→</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
