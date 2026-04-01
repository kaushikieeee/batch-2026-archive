import { useState, useEffect, memo } from 'react';
import { supabase, uploadFile } from '../lib/supabase';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import SignaturePad from '../components/SignaturePad';

const InputRow = memo(({ label, field, placeholder, type = "text", profile, toggleVisibility, handleChange }) => (
  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-4">
    <div className="w-full md:w-1/3 text-xs font-mono uppercase text-muted tracking-wider flex justify-between items-center">
      <span>{label}</span>
      {field !== 'name' && (
        <button
          type="button"
          onClick={() => toggleVisibility(field)}
          className={"text-[9px] px-2 py-0.5 rounded border transition-colors " + (profile.visibility_preferences[field] ? "border-accent-yellow/30 text-accent-yellow/80 hover:bg-accent-yellow/10" : "border-red-500/30 text-red-500/80 hover:bg-red-500/10")}
        >
          {profile.visibility_preferences[field] ? 'VISIBLE' : 'HIDDEN'}
        </button>
      )}
    </div>
    {type === "textarea" ? (
      <textarea
        value={profile[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full md:w-2/3 bg-black flex-1 border border-white/10 rounded px-3 py-2 text-sm text-primary font-mono focus:border-accent-yellow/50 focus:outline-none transition-colors min-h-[80px]"
      />
    ) : (
      <input
        type={type}
        value={profile[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full md:w-2/3 bg-black flex-1 border border-white/10 rounded px-3 py-2 text-sm text-primary font-mono focus:border-accent-yellow/50 focus:outline-none transition-colors"
      />
    )}
  </div>
));

export default function MyProfile({ user }) {
  const [loading, setLoading] = useState(true);
  const [customLinks, setCustomLinks] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imgRef = useRef(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    instagram: '',
    snapchat: '',
    website: '',
    signature_url: '',
    section: '',
    role: '',
    quote: '',
    bio: '',
    image: null,
    visibility_preferences: {
      email: true,
      phone: true,
      dob: true,
      instagram: true,
      snapchat: true,
      website: true
    }
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      if (data) {
        let visPref = data.visibility_preferences;
        if (typeof visPref === 'string') visPref = JSON.parse(visPref);
        visPref = visPref || {};
        
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dob: data.dob || '',
          instagram: data.instagram || '',
          snapchat: data.snapchat || '',
          website: data.website || '',
          signature_url: data.signature_url || '',
          section: data.section || '',
          role: data.role || '',
          quote: data.quote || '',
          bio: data.bio || '',
          image: data.image || null,
          visibility_preferences: {
            email: visPref.email ?? true,
            phone: visPref.phone ?? true,
            dob: visPref.dob ?? true,
            instagram: visPref.instagram ?? true,
            snapchat: visPref.snapchat ?? true,
            website: visPref.website ?? true
          }
        });
        
        try {
          if (data.website) {
            const parsed = JSON.parse(data.website);
            if (Array.isArray(parsed)) setCustomLinks(parsed);
          }
        } catch(e) {}
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updates = {
        name: profile.name,
        section: profile.section,
        role: profile.role,
        quote: profile.quote,
        bio: profile.bio,
        phone: profile.phone,
        dob: profile.dob || null,
        instagram: profile.instagram,
        snapchat: profile.snapchat,
        website: JSON.stringify(customLinks.filter(l => l.title && l.url)),
        signature_url: profile.signature_url || null,
        visibility_preferences: profile.visibility_preferences,
        updated_at: new Date().toISOString()
      };

      if (imageFile) {
        const { data: uploadData, error: uploadErr } = await uploadFile(imageFile);
        if (uploadErr) throw uploadErr;
        if (uploadData) updates.image = uploadData.publicUrl;
      } else if (profile.image === null) {
        updates.image = null;
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleVisibility = (field) => {
    setProfile(prev => ({
      ...prev,
      visibility_preferences: {
        ...prev.visibility_preferences,
        [field]: !prev.visibility_preferences[field]
      }
    }));
  };

  if (loading && !profile.name) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex justify-center items-center font-mono text-muted text-sm">
        [ LOADING_PROFILE... ]
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 pb-20 px-6 min-h-screen flex justify-center items-center font-mono text-muted text-sm">
        [ UNAUTHORIZED_ACCESS ]
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-5xl font-archive tracking-tighter text-primary mb-2">My Profile</h1>
        <p className="text-sm font-mono text-muted">Update your details and manage privacy settings.</p>
      </motion.div>

      <form onSubmit={handleUpdate} className="space-y-8 bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <svg className="w-64 h-64" viewBox="0 0 100 100" fill="currentColor"><path d="M50 0L100 50L50 100L0 50Z"/></svg>
        </div>

        <div className="relative z-10">
          <h2 className="text-lg font-archive text-accent-yellow mb-4 border-b border-white/10 pb-2">Basics</h2>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-6">
            <div className="w-full md:w-1/3 text-xs font-mono uppercase text-muted tracking-wider">
              Profile Photo
            </div>
            <div className="w-full md:w-2/3 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden cursor-pointer border-2 border-dashed border-white/10 hover:border-white/20 flex items-center justify-center transition-colors group bg-white/[0.03]" onClick={() => imgRef.current?.click()}>
                {imagePreview || profile.image ? (
                  <img src={imagePreview || profile.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity mb-0.5">📷</div>
                  </div>
                )}
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setImageFile(f);
                  const r = new FileReader();
                  r.onload = ev => setImagePreview(ev.target.result);
                  r.readAsDataURL(f);
                }} />
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => imgRef.current?.click()} className="text-xs font-mono bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors">Change Photo</button>
                {(imagePreview || profile.image) && (
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setProfile(p => ({...p, image: null})); }} className="text-xs font-mono text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded transition-colors">Remove Photo</button>
                )}
              </div>
            </div>
          </div>

          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-6">
            <div className="w-full md:w-1/3 text-xs font-mono uppercase text-muted tracking-wider">
              Profile Photo
            </div>
            <div className="w-full md:w-2/3 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden cursor-pointer border-2 border-dashed border-white/10 hover:border-white/20 flex items-center justify-center transition-colors group bg-white/[0.03]" onClick={() => imgRef.current?.click()}>
                {imagePreview || profile.image ? (
                  <img src={imagePreview || profile.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity mb-0.5">📷</div>
                  </div>
                )}
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setImageFile(f);
                  const r = new FileReader();
                  r.onload = ev => setImagePreview(ev.target.result);
                  r.readAsDataURL(f);
                }} />
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => imgRef.current?.click()} className="text-xs font-mono bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors">Change Photo</button>
                {(imagePreview || profile.image) && (
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setProfile(p => ({...p, image: null})); }} className="text-xs font-mono text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded transition-colors">Remove Photo</button>
                )}
              </div>
            </div>
          </div>

          <InputRow profile={profile} toggleVisibility={toggleVisibility} handleChange={handleChange} label="Full Name" field="name" placeholder="John Doe" />
          <InputRow profile={profile} toggleVisibility={toggleVisibility} handleChange={handleChange} label="Section" field="section" placeholder="CSE-A" />
          <InputRow profile={profile} toggleVisibility={toggleVisibility} handleChange={handleChange} label="Class Role" field="role" placeholder="Student" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mb-4 opacity-70 cursor-not-allowed">
            <div className="w-full md:w-1/3 text-xs font-mono uppercase text-muted tracking-wider flex justify-between items-center">
              <span>Email (Read Only)</span>
              <button
                type="button"
                onClick={() => toggleVisibility('email')}
                className={"text-[9px] px-2 py-0.5 rounded border transition-colors " + (profile.visibility_preferences['email'] ? "border-accent-yellow/30 text-accent-yellow/80 hover:bg-accent-yellow/10" : "border-red-500/30 text-red-500/80 hover:bg-red-500/10")}
              >
                {profile.visibility_preferences['email'] ? 'VISIBLE' : 'HIDDEN'}
              </button>
            </div>
            <input
              type="email"
              value={profile.email || ''}
              disabled
              className="w-full md:w-2/3 bg-black/50 flex-1 border border-white/10 rounded px-3 py-2 text-sm text-primary font-mono cursor-not-allowed"
            />
          </div>
          <InputRow profile={profile} toggleVisibility={toggleVisibility} handleChange={handleChange} label="Phone" field="phone" placeholder="+1 234 567 8900" />
          <InputRow profile={profile} toggleVisibility={toggleVisibility} handleChange={handleChange} label="Date of Birth" field="dob" type="date" placeholder="YYYY-MM-DD" />
        </div>

        <div className="relative z-10">
          <h2 className="text-lg font-archive text-accent-yellow mb-4 border-b border-white/10 pb-2 mt-8">About Me</h2>
          <InputRow profile={profile} toggleVisibility={toggleVisibility} handleChange={handleChange} label="Yearbook Quote" field="quote" placeholder="Your iconic quote here..." />
          <InputRow profile={profile} toggleVisibility={toggleVisibility} handleChange={handleChange} label="Bio" field="bio" type="textarea" placeholder="Tell everyone your story..." />
          
          <h2 className="text-lg font-archive text-accent-yellow mb-4 border-b border-white/10 pb-2 mt-8">Social Hub</h2>
          <InputRow profile={profile} toggleVisibility={toggleVisibility} handleChange={handleChange} label="Instagram" field="instagram" placeholder="username" />
          <InputRow profile={profile} toggleVisibility={toggleVisibility} handleChange={handleChange} label="Snapchat" field="snapchat" placeholder="username" />

          <div className="mt-6 mb-2 flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-muted tracking-wider">Custom Links</label>
            <button
                type="button"
                onClick={() => toggleVisibility('website')}
                className={"text-[9px] px-2 py-0.5 rounded border transition-colors " + (profile.visibility_preferences['website'] ? "border-accent-yellow/30 text-accent-yellow/80 hover:bg-accent-yellow/10" : "border-red-500/30 text-red-500/80 hover:bg-red-500/10")}
              >
                {profile.visibility_preferences['website'] ? 'VISIBLE' : 'HIDDEN'}
              </button>
          </div>
          
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
            {customLinks.map((link, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-white/[0.02] p-3 md:p-2 rounded-xl border border-white/5">
                <input type="text" placeholder="Platform (e.g. LinkedIn, Twitch)" value={link.title} onChange={e => {
                  const newLinks = [...customLinks]
                  newLinks[i].title = e.target.value
                  setCustomLinks(newLinks)
                }} className="w-full md:w-1/3 bg-black/40 border border-white/10 px-3 py-2 rounded text-sm text-primary font-mono focus:border-accent-yellow/40 outline-none" />
                <input type="url" placeholder="https://" value={link.url} onChange={e => {
                  const newLinks = [...customLinks]
                  newLinks[i].url = e.target.value
                  setCustomLinks(newLinks)
                }} className="w-full flex-1 bg-black/40 border border-white/10 px-3 py-2 rounded text-sm text-primary font-mono focus:border-accent-yellow/40 outline-none" />
                <button type="button" title="Remove" onClick={() => setCustomLinks(customLinks.filter((_, idx) => idx !== i))} className="md:w-10 w-full py-1 h-8 md:h-10 flex items-center justify-center text-red-500 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors text-xs font-mono uppercase tracking-widest">
                  <span className="md:hidden mr-2">Remove</span>✕
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setCustomLinks([...customLinks, {title: '', url: ''}])} className="w-full py-3 glass border border-dashed border-white/20 hover:border-accent-yellow/40 hover:text-accent-yellow transition-colors rounded-xl font-mono text-[10px] tracking-widest uppercase">
              + Add New Link
            </button>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-lg font-archive text-accent-yellow mb-4 border-b border-white/10 pb-2">Digital Signature</h2>
          <div className="mb-4">
            <p className="font-mono text-[9px] tracking-[0.3em] text-muted uppercase block mb-3">Draw Your Signature (Click 'Lock In' to save canvas)</p>
            <SignaturePad onSave={(data) => setProfile(p => ({...p, signature_url: data}))} />
            {profile.signature_url && (
              <div className="mt-3 flex items-center justify-between px-3 py-2 bg-[#F4C430]/10 rounded-lg border border-[#F4C430]/20">
                <span className="font-mono text-[9px] text-[#F4C430] uppercase tracking-widest">Signature Image Captured</span>
                <img src={profile.signature_url} className="h-6 opacity-60" alt="Saved sig preview" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-between pt-4 mt-8 border-t border-white/10 relative z-10 gap-4">
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="w-full md:w-auto border border-red-500/30 text-red-500/80 bg-red-500/10 font-bold px-8 py-3 rounded-xl hover:bg-red-500/20 transition-colors uppercase tracking-widest font-mono text-sm"
          >
            Logout
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-accent-yellow text-bg-primary font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(244,196,48,0.4)]"
          >
            {loading ? 'Committing...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}