const { useState, useEffect, useRef } = React;

// --- DYNAMIC REF-BASED QUILL RICH TEXT EDITOR COMPONENT ---
function RichTextEditor({ value, onChange, placeholder }) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (containerRef.current && !quillRef.current) {
      quillRef.current = new Quill(containerRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Write description here...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean']
          ]
        }
      });

      // Listen for text edits
      quillRef.current.on('text-change', () => {
        if (isUpdatingRef.current) return;
        const html = quillRef.current.root.innerHTML;
        // Strip blank paragraph tags representing empty values
        if (html === '<p><br></p>' || html === '<p></p>') {
          onChange('');
        } else {
          onChange(html);
        }
      });
    }
  }, []);

  // Sync value from parent React state defensively
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentHtml = quillRef.current.root.innerHTML;
      if (value !== currentHtml && !(value === '' && currentHtml === '<p><br></p>')) {
        isUpdatingRef.current = true;
        quillRef.current.root.innerHTML = value || '';
        isUpdatingRef.current = false;
      }
    }
  }, [value]);

  return (
    <div className="bg-dark rounded-lg overflow-hidden border border-gray-800 text-cream select-text">
      <div ref={containerRef} style={{ minHeight: '140px' }} className="text-sm"></div>
    </div>
  );
}

// --- REUSABLE TOAST NOTIFICATION ---
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass = type === 'error' ? 'bg-red-950 border-red-500 text-red-100' : 'bg-green-950 border-gold text-cream';
  const iconClass = type === 'error' ? 'fa-triangle-exclamation text-red-400' : 'fa-circle-check text-gold';

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 border rounded-lg shadow-xl animate-fade-in ${bgClass}`}>
      <i className={`fa-solid ${iconClass} text-lg`}></i>
      <span className="text-sm font-semibold tracking-wide">{message}</span>
      <button onClick={onClose} className="hover:text-white ml-2 text-xs opacity-60 hover:opacity-100">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
}

// --- REUSABLE DELETE CONFIRMATION MODAL ---
function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
      <div className="w-11/12 max-w-md p-6 bg-dark-secondary border border-gold-border rounded-xl shadow-2xl">
        <h3 className="text-xl font-bold text-gold mb-3 flex items-center gap-2">
          <i className="fa-solid fa-triangle-exclamation"></i> {title}
        </h3>
        <p className="text-mutedText text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-mutedText hover:text-white rounded border border-gray-800 hover:border-gray-600 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-dark bg-gold hover:bg-gold-hover rounded transition">
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ADMIN LOGIN ---
function Login({ onLoginSuccess, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await AdminAPI.login(email, password);
      showToast('Welcome back, Sarah!', 'success');
      onLoginSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark bg-opacity-95">
      <div className="w-full max-w-md p-8 bg-dark-secondary border border-gold-border rounded-2xl shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-2xl font-extrabold uppercase tracking-widest text-cream">
            Sarah<span className="text-gold">.Yaseen</span>
          </div>
          <p className="text-xs uppercase text-gold font-bold tracking-widest mt-2">Portfolio Management CMS</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-6 bg-red-950 border border-red-500 rounded-lg text-red-205 text-xs font-semibold flex items-start gap-2">
            <i className="fa-solid fa-triangle-exclamation text-red-400 mt-0.5"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-gold tracking-wider mb-2">Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm text-cream focus:outline-none focus:border-gold transition form-input-focus"
              placeholder="sarahyaseen2056@gmail.com"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gold tracking-wider mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm text-cream pr-10 focus:outline-none focus:border-gold transition form-input-focus"
                placeholder="••••••••"
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-mutedText hover:text-gold"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gold hover:bg-gold-hover text-dark font-bold uppercase tracking-widest text-xs rounded-lg transition shadow-lg hover:shadow-gold-glow flex items-center justify-center gap-2"
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : (
              <>
                <i className="fa-solid fa-lock-open"></i> Login to Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- SUB-PANEL: DASHBOARD HOME OVERVIEW ---
function DashboardOverview({ stats, setSection, messages }) {
  const unreadMessages = messages.filter(m => !m.is_read);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">CMS Overview</h1>
          <p className="text-xs text-mutedText mt-1">Quick statistics and system diagnostics</p>
        </div>
        <a href="/" target="_blank" className="px-4 py-2 bg-dark-secondary hover:bg-gold hover:text-dark text-gold border border-gold-border rounded-lg text-xs font-bold uppercase tracking-widest transition flex items-center gap-2">
          <i className="fa-solid fa-arrow-up-right-from-square"></i> Live Website
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div onClick={() => setSection('wordpress')} className="glass-panel p-5 rounded-xl cursor-pointer hover:border-gold transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-mutedText uppercase tracking-wider">WordPress Sites</span>
            <i className="fa-brands fa-wordpress text-2xl text-gold"></i>
          </div>
          <h2 className="text-3xl font-bold mt-4">{stats.wordpress || 0}</h2>
        </div>

        <div onClick={() => setSection('uiux')} className="glass-panel p-5 rounded-xl cursor-pointer hover:border-gold transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-mutedText uppercase tracking-wider">UI/UX Designs</span>
            <i className="fa-brands fa-figma text-2xl text-gold"></i>
          </div>
          <h2 className="text-3xl font-bold mt-4">{stats.uiux || 0}</h2>
        </div>

        <div onClick={() => setSection('graphic')} className="glass-panel p-5 rounded-xl cursor-pointer hover:border-gold transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-mutedText uppercase tracking-wider">Graphic Assets</span>
            <i className="fa-solid fa-palette text-2xl text-gold"></i>
          </div>
          <h2 className="text-3xl font-bold mt-4">{stats.graphic || 0}</h2>
        </div>

        <div onClick={() => setSection('etsy')} className="glass-panel p-5 rounded-xl cursor-pointer hover:border-gold transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-mutedText uppercase tracking-wider">Etsy Templates</span>
            <i className="fa-brands fa-etsy text-2xl text-gold"></i>
          </div>
          <h2 className="text-3xl font-bold mt-4">{stats.etsy || 0}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Card */}
        <div className="glass-panel p-6 rounded-xl lg:col-span-2">
          <div className="flex justify-between items-center mb-6 border-b border-gray-900 pb-3">
            <h3 className="font-bold text-gold uppercase tracking-wider text-xs">Recent Messages</h3>
            <button onClick={() => setSection('messages')} className="text-xs text-mutedText hover:text-gold uppercase tracking-widest font-semibold flex items-center gap-1">
              Inbox <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
          
          {unreadMessages.length === 0 ? (
            <p className="text-center py-6 text-xs text-mutedText">No unread messages</p>
          ) : (
            <div className="space-y-4">
              {unreadMessages.slice(0, 3).map(msg => (
                <div key={msg._id} onClick={() => setSection('messages')} className="p-4 bg-dark rounded-lg hover:border-gold border border-transparent cursor-pointer transition">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-cream">{msg.name}</span>
                    <span className="text-xxs text-mutedText">{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs text-gold font-medium mt-1 mb-2">{msg.subject}</div>
                  <p className="text-xs text-mutedText truncate">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Diagnostics */}
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gold uppercase tracking-wider text-xs mb-6 border-b border-gray-900 pb-3">System Diagnostics</h3>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between">
                <span className="text-mutedText">Database Mode:</span>
                <span className="font-semibold text-green-400"><i className="fa-solid fa-circle-check"></i> JSON document store</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">File Storage:</span>
                <span className="font-semibold text-green-400"><i className="fa-solid fa-circle-check"></i> Local disk folder</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">Server Port:</span>
                <span className="font-semibold text-gold">8080</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">Session Lifetime:</span>
                <span className="font-semibold">2 hours (JWT)</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-900 text-center">
            <span className="text-xxs uppercase tracking-widest text-mutedText">Developer Suite Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-PANEL: HOME PAGE EDITOR (EXTENDED FOR FULL FUNCTIONALITY) ---
function HomeEditor({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Entire Home page content state
  const [data, setData] = useState({
    hero: { heading: '', subheading_phrases: [], intro: '', cta_primary_label: '', cta_primary_link: '', cta_secondary_label: '', cta_secondary_link: '', email: '', phone: '' },
    about: { portrait_image_url: '', content: '' },
    expertise: [],
    stats: [],
    cta: { heading: '', description: '', button_label: '', button_link: '' }
  });

  const [phraseInput, setPhraseInput] = useState('');
  
  // Sub-forms for repeatable skills/expertise list
  const [editingExpIndex, setEditingExpIndex] = useState(null);
  const [expFormData, setExpFormData] = useState({ title: '', description: '', icon: 'fa-solid fa-code', link: '' });
  
  // Sub-forms for repeatable stats list
  const [editingStatIndex, setEditingStatIndex] = useState(null);
  const [statFormData, setStatFormData] = useState({ number: '', label: '' });

  // List of pre-defined icons for selector
  const availableIcons = [
    'fa-brands fa-wordpress', 'fa-brands fa-figma', 'fa-brands fa-etsy',
    'fa-solid fa-palette', 'fa-solid fa-code', 'fa-solid fa-laptop-code',
    'fa-solid fa-wand-magic-sparkles', 'fa-solid fa-bezier-curve',
    'fa-solid fa-mobile-screen-button', 'fa-solid fa-chart-line'
  ];

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const res = await AdminAPI.getHomeContent();
      setData(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Rotating phrases helper
  const addPhrase = () => {
    if (!phraseInput.trim()) return;
    const phrases = [...(data.hero.subheading_phrases || [])];
    if (!phrases.includes(phraseInput.trim())) {
      phrases.push(phraseInput.trim());
      handleTextChange('hero', 'subheading_phrases', phrases);
    }
    setPhraseInput('');
  };

  const removePhrase = (index) => {
    const phrases = (data.hero.subheading_phrases || []).filter((_, i) => i !== index);
    handleTextChange('hero', 'subheading_phrases', phrases);
  };

  const handleImageUpload = async (e, section, field) => {
    const file = e.target.files[0];
    if (!file) return;

    showToast('Uploading photo...', 'success');
    try {
      const result = await AdminAPI.uploadImage(file);
      handleTextChange(section, field, result.url);
      showToast('Photo uploaded successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Expertise Card Sub-editor logic
  const handleEditExp = (index) => {
    if (index === 'new') {
      setEditingExpIndex('new');
      setExpFormData({ title: '', description: '', icon: 'fa-solid fa-code', link: '' });
    } else {
      setEditingExpIndex(index);
      setExpFormData({ ...data.expertise[index] });
    }
  };

  const handleSaveExp = () => {
    if (!expFormData.title || !expFormData.description) {
      showToast('Title and Description are required', 'error');
      return;
    }
    const newList = [...(data.expertise || [])];
    if (editingExpIndex === 'new') {
      newList.push({
        id: 'exp-' + Math.random().toString(36).substr(2, 9),
        ...expFormData
      });
    } else {
      newList[editingExpIndex] = expFormData;
    }
    setData(prev => ({ ...prev, expertise: newList }));
    setEditingExpIndex(null);
  };

  const handleDeleteExp = (index) => {
    const newList = (data.expertise || []).filter((_, i) => i !== index);
    setData(prev => ({ ...prev, expertise: newList }));
  };

  const handleMoveExp = (index, direction) => {
    const newList = [...(data.expertise || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newList.length) return;
    const temp = newList[index];
    newList[index] = newList[target];
    newList[target] = temp;
    setData(prev => ({ ...prev, expertise: newList }));
  };

  // Stats Sub-editor logic
  const handleEditStat = (index) => {
    if (index === 'new') {
      setEditingStatIndex('new');
      setStatFormData({ number: '', label: '' });
    } else {
      setEditingStatIndex(index);
      setStatFormData({ ...data.stats[index] });
    }
  };

  const handleSaveStat = () => {
    if (!statFormData.number || !statFormData.label) {
      showToast('Both metric number and label details are required', 'error');
      return;
    }
    const newList = [...(data.stats || [])];
    if (editingStatIndex === 'new') {
      newList.push({
        id: 'stat-' + Math.random().toString(36).substr(2, 9),
        ...statFormData
      });
    } else {
      newList[editingStatIndex] = statFormData;
    }
    setData(prev => ({ ...prev, stats: newList }));
    setEditingStatIndex(null);
  };

  const handleDeleteStat = (index) => {
    const newList = (data.stats || []).filter((_, i) => i !== index);
    setData(prev => ({ ...prev, stats: newList }));
  };

  const handleMoveStat = (index, direction) => {
    const newList = [...(data.stats || [])];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newList.length) return;
    const temp = newList[index];
    newList[index] = newList[target];
    newList[target] = temp;
    setData(prev => ({ ...prev, stats: newList }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await AdminAPI.updateHomeContent(data);
      showToast('Home page content saved successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gold"></i>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-fade-in pb-12">
      
      {/* Save bar */}
      <div className="flex justify-between items-center border-b border-gray-900 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">Home Page Editor</h1>
          <p className="text-xs text-mutedText mt-1">Manage landing hero copy, about fields, expertise, and stats metrics</p>
        </div>
        <button type="submit" disabled={saving} className="px-6 py-3 bg-gold hover:bg-gold-hover text-dark font-bold uppercase tracking-widest text-xs rounded-lg transition flex items-center gap-2">
          {saving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save Changes
        </button>
      </div>

      {/* Hero Section Card */}
      <div className="glass-panel p-6 rounded-xl space-y-6">
        <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-gray-900 pb-2"><i className="fa-solid fa-circle-play mr-2"></i> Hero Content</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Greeting Heading</label>
            <input 
              type="text" 
              value={data.hero.heading}
              onChange={(e) => handleTextChange('hero', 'heading', e.target.value)}
              className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition form-input-focus"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Rotating Roles / Phrases</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={phraseInput}
                onChange={(e) => setPhraseInput(e.target.value)}
                className="flex-1 bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gold"
                placeholder="WordPress Expert"
              />
              <button type="button" onClick={addPhrase} className="px-4 bg-gold hover:bg-gold-hover text-dark font-bold text-xs uppercase rounded-lg transition">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(data.hero.subheading_phrases || []).map((phrase, idx) => (
                <span key={idx} className="bg-dark border border-gray-800 text-cream px-3 py-1.5 rounded-full text-xs flex items-center gap-2">
                  {phrase}
                  <button type="button" onClick={() => removePhrase(idx)} className="text-red-400 hover:text-red-500 font-bold"><i className="fa-solid fa-xmark"></i></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Introductory Paragraph</label>
          <textarea 
            value={data.hero.intro}
            onChange={(e) => handleTextChange('hero', 'intro', e.target.value)}
            className="w-full h-24 bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition leading-relaxed"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Primary CTA Button Label</label>
            <input 
              type="text" 
              value={data.hero.cta_primary_label}
              onChange={(e) => handleTextChange('hero', 'cta_primary_label', e.target.value)}
              className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Primary CTA Button Link</label>
            <input 
              type="text" 
              value={data.hero.cta_primary_link}
              onChange={(e) => handleTextChange('hero', 'cta_primary_link', e.target.value)}
              className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Phone Number</label>
            <input 
              type="text" 
              value={data.hero.phone}
              onChange={(e) => handleTextChange('hero', 'phone', e.target.value)}
              className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              value={data.hero.email}
              onChange={(e) => handleTextChange('hero', 'email', e.target.value)}
              className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* About Section Card */}
      <div className="glass-panel p-6 rounded-xl space-y-6">
        <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-gray-900 pb-2"><i className="fa-solid fa-user mr-2"></i> About Me</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider">Portrait Image Profile</label>
            <div className="aspect-square bg-dark border border-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative">
              {data.about.portrait_image_url ? (
                <img src={data.about.portrait_image_url} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <i className="fa-solid fa-image text-4xl text-gray-800"></i>
              )}
            </div>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'about', 'portrait_image_url')}
                className="hidden"
                id="about-pic-input"
              />
              <label 
                htmlFor="about-pic-input"
                className="w-full block text-center py-2.5 bg-dark border border-gold hover:bg-gold hover:text-dark text-gold font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition"
              >
                Upload Photo
              </label>
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">About Content (WYSIWYG Rich Text)</label>
            <RichTextEditor 
              value={data.about.content} 
              onChange={(val) => handleTextChange('about', 'content', val)} 
              placeholder="Tell us about yourself, credentials, and workflow methodology..."
            />
          </div>
        </div>
      </div>

      {/* Expertise Cards Editor */}
      <div className="glass-panel p-6 rounded-xl space-y-6">
        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider"><i className="fa-solid fa-star mr-2"></i> My Expertise</h3>
          <button type="button" onClick={() => handleEditExp('new')} className="px-3 py-1.5 bg-gold hover:bg-gold-hover text-dark font-bold text-[10px] uppercase rounded transition">
            Add Skill Card
          </button>
        </div>

        {editingExpIndex !== null && (
          <div className="p-4 bg-dark rounded-xl border border-gold-border space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-gold uppercase tracking-widest border-b border-gray-900 pb-1">
              {editingExpIndex === 'new' ? 'New Expertise Card' : 'Edit Expertise Card'}
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xxs font-bold text-mutedText uppercase mb-1">Title</label>
                <input type="text" value={expFormData.title} onChange={(e) => setExpFormData(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-dark-secondary border border-gray-800 p-2 text-xs rounded text-cream focus:outline-none" />
              </div>
              <div>
                <label className="block text-xxs font-bold text-mutedText uppercase mb-1">Route / Link Target</label>
                <input type="text" value={expFormData.link} onChange={(e) => setExpFormData(prev => ({ ...prev, link: e.target.value }))} className="w-full bg-dark-secondary border border-gray-800 p-2 text-xs rounded text-cream focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 items-end">
              <div className="col-span-2">
                <label className="block text-xxs font-bold text-mutedText uppercase mb-1">Icon Style Class</label>
                <input type="text" value={expFormData.icon} onChange={(e) => setExpFormData(prev => ({ ...prev, icon: e.target.value }))} className="w-full bg-dark-secondary border border-gray-800 p-2 text-xs rounded text-cream focus:outline-none" />
              </div>
              <div className="col-span-1 flex gap-2 flex-wrap pb-1 justify-center">
                {availableIcons.map(icon => (
                  <button key={icon} type="button" onClick={() => setExpFormData(prev => ({ ...prev, icon }))} className={`p-2 border rounded hover:text-gold ${expFormData.icon === icon ? 'border-gold text-gold' : 'border-gray-800 text-mutedText'}`}>
                    <i className={icon}></i>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xxs font-bold text-mutedText uppercase mb-1">Brief Description</label>
              <textarea value={expFormData.description} onChange={(e) => setExpFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full h-16 bg-dark-secondary border border-gray-800 p-2 text-xs rounded text-cream focus:outline-none" />
            </div>

            <div className="flex justify-end gap-2 text-xxs font-bold uppercase tracking-wider">
              <button type="button" onClick={() => setEditingExpIndex(null)} className="px-3 py-1.5 border border-gray-800 rounded hover:text-white">Cancel</button>
              <button type="button" onClick={handleSaveExp} className="px-4 py-1.5 bg-gold hover:bg-gold-hover text-dark rounded">Save Card</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {(data.expertise || []).map((item, index) => (
            <div key={item.id || index} className="flex justify-between items-center p-3 bg-dark rounded-lg border border-gray-850">
              <div className="flex items-center gap-3">
                <i className={`${item.icon} text-lg text-gold`}></i>
                <div>
                  <span className="font-bold text-xs">{item.title}</span>
                  <p className="text-[10px] text-mutedText max-w-lg mt-0.5">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button type="button" onClick={() => handleMoveExp(index, 'up')} disabled={index === 0} className={`hover:text-gold ${index === 0 ? 'opacity-20' : ''}`}><i className="fa-solid fa-arrow-up"></i></button>
                <button type="button" onClick={() => handleMoveExp(index, 'down')} disabled={index === data.expertise.length - 1} className={`hover:text-gold ${index === data.expertise.length - 1 ? 'opacity-20' : ''}`}><i className="fa-solid fa-arrow-down"></i></button>
                <button type="button" onClick={() => handleEditExp(index)} className="text-gold hover:text-white font-semibold">Edit</button>
                <button type="button" onClick={() => handleDeleteExp(index)} className="text-red-400 hover:text-red-500 font-semibold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats/Highlights Bar Editor */}
      <div className="glass-panel p-6 rounded-xl space-y-6">
        <div className="flex justify-between items-center border-b border-gray-900 pb-2">
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider"><i className="fa-solid fa-chart-column mr-2"></i> Stats Highlights</h3>
          <button type="button" onClick={() => handleEditStat('new')} className="px-3 py-1.5 bg-gold hover:bg-gold-hover text-dark font-bold text-[10px] uppercase rounded transition">
            Add Stat Item
          </button>
        </div>

        {editingStatIndex !== null && (
          <div className="p-4 bg-dark rounded-xl border border-gold-border space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-gold uppercase tracking-widest border-b border-gray-900 pb-1">
              {editingStatIndex === 'new' ? 'New Stat Highlight' : 'Edit Stat Highlight'}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xxs font-bold text-mutedText uppercase mb-1">Number / Figure (e.g. 10+)</label>
                <input type="text" value={statFormData.number} onChange={(e) => setStatFormData(prev => ({ ...prev, number: e.target.value }))} className="w-full bg-dark-secondary border border-gray-800 p-2 text-xs rounded text-cream focus:outline-none" placeholder="3+" />
              </div>
              <div>
                <label className="block text-xxs font-bold text-mutedText uppercase mb-1">Label (e.g. Years Experience)</label>
                <input type="text" value={statFormData.label} onChange={(e) => setStatFormData(prev => ({ ...prev, label: e.target.value }))} className="w-full bg-dark-secondary border border-gray-800 p-2 text-xs rounded text-cream focus:outline-none" placeholder="Years Experience" />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xxs font-bold uppercase tracking-wider">
              <button type="button" onClick={() => setEditingStatIndex(null)} className="px-3 py-1.5 border border-gray-800 rounded hover:text-white">Cancel</button>
              <button type="button" onClick={handleSaveStat} className="px-4 py-1.5 bg-gold hover:bg-gold-hover text-dark rounded">Save Stat</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(data.stats || []).map((stat, index) => (
            <div key={stat.id || index} className="flex justify-between items-center p-3 bg-dark rounded-lg border border-gray-850">
              <div className="flex items-center gap-4">
                <span className="font-extrabold text-lg text-gold w-14">{stat.number}</span>
                <span className="text-xs text-cream font-semibold">{stat.label}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button type="button" onClick={() => handleMoveStat(index, 'up')} disabled={index === 0} className={`hover:text-gold ${index === 0 ? 'opacity-20' : ''}`}><i className="fa-solid fa-arrow-up"></i></button>
                <button type="button" onClick={() => handleMoveStat(index, 'down')} disabled={index === data.stats.length - 1} className={`hover:text-gold ${index === data.stats.length - 1 ? 'opacity-20' : ''}`}><i className="fa-solid fa-arrow-down"></i></button>
                <button type="button" onClick={() => handleEditStat(index)} className="text-gold hover:text-white font-semibold">Edit</button>
                <button type="button" onClick={() => handleDeleteStat(index)} className="text-red-400 hover:text-red-500 font-semibold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Band Section */}
      <div className="glass-panel p-6 rounded-xl space-y-6">
        <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-gray-900 pb-2"><i className="fa-solid fa-handshake mr-2"></i> CTA Footer Band</h3>
        <div>
          <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">CTA Heading</label>
          <input 
            type="text" 
            value={data.cta.heading}
            onChange={(e) => handleTextChange('cta', 'heading', e.target.value)}
            className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">CTA Description</label>
          <input 
            type="text" 
            value={data.cta.description}
            onChange={(e) => handleTextChange('cta', 'description', e.target.value)}
            className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">CTA Button Label</label>
            <input 
              type="text" 
              value={data.cta.button_label}
              onChange={(e) => handleTextChange('cta', 'button_label', e.target.value)}
              className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">CTA Button Link</label>
            <input 
              type="text" 
              value={data.cta.button_link}
              onChange={(e) => handleTextChange('cta', 'button_link', e.target.value)}
              className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

// --- SUB-PANEL: PROJECT MANAGER (WordPress & UI/UX) ---
function ProjectManager({ category, showToast }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null); // holds project ID or 'new'
  const [formData, setFormData] = useState({ title: '', description: '', images: [], external_link: '', tags: [], status: 'published' });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [category]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getProjects(category);
      setProjects(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (project) => {
    if (project === 'new') {
      setEditingProject('new');
      setFormData({ title: '', description: '', images: [], external_link: '', tags: [], status: 'published' });
    } else {
      setEditingProject(project._id);
      setFormData({ ...project });
    }
    setTagInput('');
  };

  const handleTextChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const tags = [...formData.tags];
    if (!tags.includes(tagInput.trim())) {
      tags.push(tagInput.trim());
      handleTextChange('tags', tags);
    }
    setTagInput('');
  };

  const removeTag = (index) => {
    const tags = formData.tags.filter((_, i) => i !== index);
    handleTextChange('tags', tags);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showToast('Uploading image...', 'success');
    try {
      const result = await AdminAPI.uploadImage(file);
      handleTextChange('images', [result.url]);
      showToast('Project screenshot uploaded!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      showToast('Title and Description are required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingProject === 'new') {
        const added = await AdminAPI.createProject({ ...formData, category });
        setProjects(prev => [...prev, added]);
        showToast('New project created successfully!', 'success');
      } else {
        const updated = await AdminAPI.updateProject(editingProject, formData);
        setProjects(prev => prev.map(p => p._id === editingProject ? updated : p));
        showToast('Project updated successfully!', 'success');
      }
      setEditingProject(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await AdminAPI.deleteProject(deleteConfirmId);
      setProjects(prev => prev.filter(p => p._id !== deleteConfirmId));
      showToast('Project deleted successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const shiftOrder = async (index, direction) => {
    const list = [...projects];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const orderList = list.map((p, idx) => ({ id: p._id, order: idx + 1 }));
    setProjects(list.map((p, idx) => ({ ...p, order: idx + 1 })));

    try {
      await AdminAPI.reorderProjects(orderList);
      showToast('Order saved!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      fetchProjects();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gold"></i>
      </div>
    );
  }

  const categoryTitle = category === 'wordpress' ? 'WordPress Development' : 'UI/UX Design';
  const categoryIcon = category === 'wordpress' ? 'fa-brands fa-wordpress' : 'fa-brands fa-figma';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {deleteConfirmId && (
        <ConfirmModal 
          title="Delete Project?"
          message="Are you sure you want to permanently delete this project card? This action is irreversible."
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {/* Editor Modal View */}
      {editingProject && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-dark-secondary border border-gold-border rounded-xl shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-6">
              <h2 className="text-lg font-bold text-gold flex items-center gap-2">
                <i className={`fa-solid ${categoryIcon}`}></i>
                {editingProject === 'new' ? `Add ${category === 'wordpress' ? 'WordPress' : 'UI/UX'} Project` : `Edit ${category === 'wordpress' ? 'WordPress' : 'UI/UX'} Project`}
              </h2>
              <button onClick={() => setEditingProject(null)} className="text-mutedText hover:text-white"><i className="fa-solid fa-xmark text-lg"></i></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Project Name / Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => handleTextChange('title', e.target.value)}
                  className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Project Screenshot Image</label>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="w-48 aspect-[16/10] bg-dark border border-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {formData.images && formData.images.length > 0 ? (
                      <img src={formData.images[0]} alt="Project preview" className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa-solid fa-image text-3xl text-gray-800"></i>
                    )}
                  </div>
                  <div className="flex-1 w-full relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="proj-image-input"
                    />
                    <label 
                      htmlFor="proj-image-input"
                      className="block text-center py-2.5 bg-dark border border-gold hover:bg-gold hover:text-dark text-gold font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer transition"
                    >
                      Choose New Image
                    </label>
                    <p className="text-xxs text-mutedText mt-2">Recommended resolution: 16:10 aspect ratio. Max size 5MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Project Description (WYSIWYG Rich Text)</label>
                <RichTextEditor 
                  value={formData.description}
                  onChange={(val) => handleTextChange('description', val)}
                  placeholder="Outline the client requirements, development challenges, and implementation methodologies..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">External Link (Live site or Figma)</label>
                  <input 
                    type="text" 
                    value={formData.external_link}
                    onChange={(e) => handleTextChange('external_link', e.target.value)}
                    className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleTextChange('status', e.target.value)}
                    className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gold text-cream"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Tags / Technologies</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="flex-1 bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
                    placeholder="e.g. Elementor"
                  />
                  <button type="button" onClick={addTag} className="px-4 bg-gold hover:bg-gold-hover text-dark font-bold text-xs uppercase rounded-lg transition">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(formData.tags || []).map((tag, idx) => (
                    <span key={idx} className="bg-dark border border-gray-850 px-3 py-1 rounded-full text-xs flex items-center gap-2">
                      {tag}
                      <button type="button" onClick={() => removeTag(idx)} className="text-red-400 font-bold"><i className="fa-solid fa-xmark"></i></button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-900">
                <button type="button" onClick={() => setEditingProject(null)} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-mutedText hover:text-white rounded border border-gray-800 hover:border-gray-600 transition">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-gold hover:bg-gold-hover text-dark font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-2">
                  {saving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main List Header */}
      <div className="flex justify-between items-center border-b border-gray-900 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide flex items-center gap-3">
            <i className={`fa-solid ${categoryIcon} text-gold`}></i>
            {categoryTitle}
          </h1>
          <p className="text-xs text-mutedText mt-1">Manage project cards, tag attributes, and display order</p>
        </div>
        <button onClick={() => handleEditClick('new')} className="px-5 py-2.5 bg-gold hover:bg-gold-hover text-dark font-bold uppercase tracking-widest text-xs rounded-lg transition flex items-center gap-2">
          <i className="fa-solid fa-plus"></i> Add New Project
        </button>
      </div>

      {/* Projects Table List */}
      {projects.length === 0 ? (
        <div className="glass-panel p-10 text-center rounded-xl">
          <i className="fa-solid fa-folder-open text-4xl text-gray-800 mb-3"></i>
          <p className="text-mutedText text-sm">No projects found. Click "Add New Project" to create one.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-xl overflow-hidden animate-fade-in">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-dark border-b border-gray-900 text-xxs font-bold uppercase text-gold tracking-widest">
                <th className="p-4 w-16 text-center">Sort</th>
                <th className="p-4 w-24">Image</th>
                <th className="p-4">Project Details</th>
                <th className="p-4 w-32">Status</th>
                <th className="p-4 w-28 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {projects.map((proj, idx) => (
                <tr key={proj._id} className="hover:bg-dark-secondary transition duration-150">
                  <td className="p-4">
                    <div className="flex flex-col items-center gap-1">
                      <button onClick={() => shiftOrder(idx, 'up')} disabled={idx === 0} className={`text-xs hover:text-gold ${idx === 0 ? 'opacity-20' : ''}`}><i className="fa-solid fa-chevron-up"></i></button>
                      <button onClick={() => shiftOrder(idx, 'down')} disabled={idx === projects.length - 1} className={`text-xs hover:text-gold ${idx === projects.length - 1 ? 'opacity-20' : ''}`}><i className="fa-solid fa-chevron-down"></i></button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="w-16 aspect-[16/10] bg-dark rounded border border-gray-800 overflow-hidden">
                      {proj.images && proj.images.length > 0 ? (
                        <img src={proj.images[0]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-800 font-bold">N/A</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-sm text-cream">{proj.title}</div>
                    <div className="text-xs text-mutedText line-clamp-1 mt-1 max-w-md" dangerouslySetInnerHTML={{ __html: proj.description }}></div>
                    <div className="flex gap-1 mt-2">
                      {proj.tags.slice(0, 3).map((t, i) => (
                        <span key={i} className="px-2 py-0.5 border border-gray-800 rounded text-[9px] font-semibold uppercase text-gold">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border ${proj.status === 'published' ? 'bg-green-950/20 border-green-500 text-green-400' : 'bg-yellow-950/20 border-yellow-500 text-yellow-400'}`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleEditClick(proj)} className="text-xs font-bold uppercase tracking-wider text-gold hover:text-white transition">
                        <i className="fa-solid fa-pen-to-square"></i> Edit
                      </button>
                      <button onClick={() => setDeleteConfirmId(proj._id)} className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-500 transition">
                        <i className="fa-solid fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- SUB-PANEL: GALLERY MANAGER (Graphic Designing & Etsy) ---
function GalleryManager({ category, showToast }) {
  const [items, setItems] = useState([]);
  const [introText, setIntroText] = useState('');
  const [shopUrl, setShopUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // New state for product editing modal
  const [editingItem, setEditingItem] = useState(null); // 'new' or item ID or null
  const [itemFormData, setItemFormData] = useState({
    caption: '',
    title: '',
    description: '',
    tag: 'Flyer',
    image: '',
    images: [],
    price: '',
    external_link: ''
  });
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    fetchGalleryData();
  }, [category]);

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      const galleryRes = await AdminAPI.getGallery(category);
      setItems(galleryRes);

      const introsRes = await AdminAPI.getIntros();
      setIntroText(introsRes[category] || '');

      if (category === 'etsy') {
        const settingsRes = await AdminAPI.getSettings();
        setShopUrl(settingsRes.social_links?.etsy || '');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const [uploadQueue, setUploadQueue] = useState([]);
  const [showQueueModal, setShowQueueModal] = useState(false);

  // Throttled parallel queue runner
  useEffect(() => {
    if (!showQueueModal || uploadQueue.length === 0) return;

    const pending = uploadQueue.filter(x => x.status === 'pending');
    const uploading = uploadQueue.filter(x => x.status === 'uploading');

    if (pending.length > 0 && uploading.length < 5) {
      // Start next batch up to concurrency limit of 5
      const nextBatch = pending.slice(0, 5 - uploading.length);
      nextBatch.forEach(item => {
        startUpload(item);
      });
    }

    // Check if everything is done and update bulk state
    const allDone = uploadQueue.every(x => x.status === 'success' || x.status === 'failed');
    if (allDone && uploadingBulk) {
      setUploadingBulk(false);
      const successCount = uploadQueue.filter(x => x.status === 'success').length;
      const failedCount = uploadQueue.filter(x => x.status === 'failed').length;
      if (successCount > 0 && failedCount === 0) {
        showToast(`All ${successCount} images uploaded successfully!`, 'success');
      } else if (successCount > 0) {
        showToast(`Bulk upload complete: ${successCount} succeeded, ${failedCount} failed.`, 'warning');
      } else if (failedCount > 0) {
        showToast('Bulk upload failed. Please check errors.', 'error');
      }
    }
  }, [showQueueModal, uploadQueue, uploadingBulk]);

  const startUpload = async (item) => {
    // Set status to uploading
    setUploadQueue(prev => prev.map(x => x.id === item.id ? { ...x, status: 'uploading' } : x));

    const formData = new FormData();
    formData.append('category', category);
    formData.append('tag', category === 'graphic-design' ? 'social-ads' : 'Flyer');
    formData.append('files', item.file);

    try {
      const addedItems = await AdminAPI.uploadBulkGallery(formData);
      if (addedItems && addedItems.length > 0) {
        setItems(prev => [...prev, ...addedItems]);
        setUploadQueue(prev => prev.map(x => x.id === item.id ? { ...x, status: 'success' } : x));
      } else {
        throw new Error("No data returned");
      }
    } catch (err) {
      setUploadQueue(prev => prev.map(x => x.id === item.id ? { ...x, status: 'failed', error: err.message || 'Upload failed' } : x));
    }
  };

  const retryUpload = async (id) => {
    setUploadQueue(prev => prev.map(x => x.id === id ? { ...x, status: 'pending', error: null } : x));
  };

  const closeQueueModal = () => {
    setShowQueueModal(false);
    setUploadQueue([]);
  };

  const handleBulkUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingBulk(true);
    const newItems = files.map((file, idx) => ({
      id: idx + Date.now() + '-' + Math.random(),
      file,
      name: file.name,
      status: 'pending',
      error: null
    }));

    setUploadQueue(newItems);
    setShowQueueModal(true);
    e.target.value = ''; // clear input
  };

  const handleSavePageSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const intros = await AdminAPI.getIntros();
      intros[category] = introText;
      await AdminAPI.updateIntros(intros);

      if (category === 'etsy') {
        const settings = await AdminAPI.getSettings();
        if (!settings.social_links) settings.social_links = {};
        settings.social_links.etsy = shopUrl;
        await AdminAPI.updateSettings(settings);
      }

      showToast('Page settings updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const shiftOrder = async (index, direction) => {
    const list = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const orderList = list.map((item, idx) => ({ id: item._id, order: idx + 1 }));
    setItems(list.map((item, idx) => ({ ...item, order: idx + 1 })));

    try {
      await AdminAPI.reorderGallery(orderList);
      showToast('Item reordered!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      fetchGalleryData();
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmId) return;
    try {
      await AdminAPI.deleteGalleryItem(deleteConfirmId);
      setItems(prev => prev.filter(item => item._id !== deleteConfirmId));
      showToast('Gallery item deleted', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleTagChange = async (itemId, newTag) => {
    try {
      await AdminAPI.updateGalleryItem(itemId, { tag: newTag });
      setItems(prev => prev.map(item => item._id === itemId ? { ...item, tag: newTag } : item));
      showToast('Category tag updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // UI Handlers for product editing modal
  const handleEditItemClick = (item) => {
    if (item === 'new') {
      setEditingItem('new');
      setItemFormData({
        caption: '',
        title: '',
        description: '',
        tag: category === 'graphic-design' ? 'social-ads' : 'Flyer',
        image: '',
        images: [],
        price: '',
        external_link: ''
      });
    } else {
      setEditingItem(item._id);
      setItemFormData({
        caption: item.caption || '',
        title: item.title || '',
        description: item.description || '',
        tag: item.tag || (category === 'graphic-design' ? 'social-ads' : 'Flyer'),
        image: item.image || '',
        images: item.images || [],
        price: item.price || '',
        external_link: item.external_link || ''
      });
    }
  };

  const handleItemFormDataChange = (field, value) => {
    setItemFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showToast('Uploading main image...', 'success');
    try {
      const result = await AdminAPI.uploadImage(file);
      handleItemFormDataChange('image', result.url);
      showToast('Main product image uploaded!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddAdditionalImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showToast('Uploading additional image...', 'success');
    try {
      const result = await AdminAPI.uploadImage(file);
      const currentImages = itemFormData.images || [];
      handleItemFormDataChange('images', [...currentImages, result.url]);
      showToast('Additional image added!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveAdditionalImage = (index) => {
    const currentImages = itemFormData.images || [];
    handleItemFormDataChange('images', currentImages.filter((_, i) => i !== index));
  };

  const handleSaveItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemFormData.caption) {
      showToast('Product Name is required', 'error');
      return;
    }

    setSavingItem(true);
    try {
      const payload = {
        ...itemFormData,
        category
      };

      if (editingItem === 'new') {
        const added = await AdminAPI.createGalleryItem(payload);
        setItems(prev => [...prev, added]);
        showToast('New product created successfully!', 'success');
      } else {
        const updated = await AdminAPI.updateGalleryItem(editingItem, payload);
        setItems(prev => prev.map(x => x._id === editingItem ? updated : x));
        showToast('Product updated successfully!', 'success');
      }
      setEditingItem(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingItem(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gold"></i>
      </div>
    );
  }

  const isGraphic = category === 'graphic-design';
  const pageTitle = isGraphic ? 'Graphic Designing Gallery' : 'Etsy Digital Products';
  const pageIcon = isGraphic ? 'fa-solid fa-palette' : 'fa-brands fa-etsy';

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {deleteConfirmId && (
        <ConfirmModal 
          title="Delete Gallery Item?"
          message="Are you sure you want to delete this design placeholder from your portfolio?"
          onConfirm={handleDeleteItem}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {/* Product Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-dark-secondary border border-gold-border rounded-xl shadow-2xl p-6 my-8 max-h-[95vh] overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-6">
              <h2 className="text-lg font-bold text-gold flex items-center gap-2">
                <i className={`fa-solid ${pageIcon}`}></i>
                {editingItem === 'new' ? `Add ${isGraphic ? 'Graphic' : 'Etsy'} Product` : `Edit ${isGraphic ? 'Graphic' : 'Etsy'} Product`}
              </h2>
              <button onClick={() => setEditingItem(null)} className="text-mutedText hover:text-white"><i className="fa-solid fa-xmark text-lg"></i></button>
            </div>

            <form onSubmit={handleSaveItemSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Product/Project Name</label>
                  <input 
                    type="text" 
                    value={itemFormData.caption}
                    onChange={(e) => handleItemFormDataChange('caption', e.target.value)}
                    className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
                    required
                    placeholder="e.g. Real Estate Marketing Flyer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Product Title</label>
                  <input 
                    type="text" 
                    value={itemFormData.title}
                    onChange={(e) => handleItemFormDataChange('title', e.target.value)}
                    className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
                    placeholder="e.g. Modern Real Estate Promo Flyer Template"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Category / Tag</label>
                  <select 
                    value={itemFormData.tag} 
                    onChange={(e) => handleItemFormDataChange('tag', e.target.value)}
                    className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none text-gold font-bold uppercase"
                  >
                    {isGraphic ? (
                      <option value="social-ads">Social Ad</option>
                    ) : (
                      <>
                        <option value="Flyer">Flyer</option>
                        <option value="Brochure">Brochure</option>
                        <option value="Social Kit">Social Kit</option>
                        <option value="Branding Kit">Branding Kit</option>
                        <option value="Planner">Planner</option>
                        <option value="Stationery Kit">Stationery Kit</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Price</label>
                  <input 
                    type="text" 
                    value={itemFormData.price}
                    onChange={(e) => handleItemFormDataChange('price', e.target.value)}
                    className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
                    placeholder="e.g. $4.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Product Link / URL</label>
                  <input 
                    type="text" 
                    value={itemFormData.external_link}
                    onChange={(e) => handleItemFormDataChange('external_link', e.target.value)}
                    className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
                    placeholder="e.g. https://www.etsy.com/listing/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Product Description</label>
                <textarea 
                  value={itemFormData.description}
                  onChange={(e) => handleItemFormDataChange('description', e.target.value)}
                  className="w-full h-20 bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition leading-relaxed"
                  placeholder="Describe the product details..."
                />
              </div>

              {/* Image Editors */}
              <div className="border-t border-gray-900 pt-4 space-y-4">
                <h3 className="text-xs font-bold text-gold uppercase tracking-wider">Product Image Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main Image */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase text-mutedText tracking-wider">Main Product Image</label>
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 bg-dark border border-gray-800 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                        {itemFormData.image ? (
                          <img src={itemFormData.image} alt="Main product" className="w-full h-full object-cover" />
                        ) : (
                          <i className="fa-solid fa-image text-2xl text-gray-800"></i>
                        )}
                      </div>
                      <div className="flex-1">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleMainImageUpload}
                          className="hidden"
                          id="main-image-input"
                        />
                        <label 
                          htmlFor="main-image-input"
                          className="px-4 py-2 border border-gold hover:bg-gold hover:text-dark text-gold font-bold text-[10px] uppercase tracking-wider rounded cursor-pointer transition inline-block"
                        >
                          Upload Main Image
                        </label>
                        <p className="text-[10px] text-mutedText mt-1">Shown in the main product grid gallery.</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Images */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase text-mutedText tracking-wider">Additional Product Images</label>
                    <div className="flex flex-wrap gap-2 mb-2 max-h-16 overflow-y-auto">
                      {(itemFormData.images || []).map((img, i) => (
                        <div key={i} className="relative w-10 h-10 border border-gray-800 rounded overflow-hidden flex-shrink-0">
                          <img src={img} alt={`Additional ${i+1}`} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveAdditionalImage(i)}
                            className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-red-500 transition text-xs"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleAddAdditionalImage}
                        className="hidden"
                        id="additional-image-input"
                      />
                      <label 
                        htmlFor="additional-image-input"
                        className="px-4 py-2 border border-gold hover:bg-gold hover:text-dark text-gold font-bold text-[10px] uppercase tracking-wider rounded cursor-pointer transition inline-block"
                      >
                        Add Additional Image
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-900 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)} 
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-mutedText hover:text-white rounded border border-gray-800 hover:border-gray-600 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingItem} 
                  className="px-5 py-2 bg-gold hover:bg-gold-hover text-dark font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-2"
                >
                  {savingItem ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-900 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide flex items-center gap-3">
            <i className={`fa-solid ${pageIcon} text-gold`}></i>
            {pageTitle}
          </h1>
          <p className="text-xs text-mutedText mt-1">Manage and edit your products, upload images, and reorder grid layout</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleEditItemClick('new')}
            className="px-5 py-2.5 bg-dark border border-gold hover:bg-gold hover:text-dark text-gold font-bold uppercase tracking-widest text-xs rounded-lg transition flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i> Add Product
          </button>
          <div className="relative">
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleBulkUpload}
              disabled={uploadingBulk}
              className="hidden"
              id="bulk-upload-input"
            />
            <label 
              htmlFor="bulk-upload-input"
              className="px-5 py-2.5 bg-gold hover:bg-gold-hover text-dark font-bold uppercase tracking-widest text-xs rounded-lg cursor-pointer transition flex items-center gap-2"
            >
              {uploadingBulk ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-upload"></i>} Bulk Upload Images
            </label>
          </div>
        </div>
      </div>

      {/* Intro Text Configuration */}
      <form onSubmit={handleSavePageSettings} className="glass-panel p-6 rounded-xl space-y-6">
        <h3 className="text-xs font-bold text-gold uppercase tracking-wider border-b border-gray-900 pb-2"><i className="fa-solid fa-gears mr-2"></i> Page Header Settings</h3>
        
        <div>
          <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Intro Paragraph (displays above gallery)</label>
          <textarea 
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            className="w-full h-20 bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition leading-relaxed animate-fade-in"
            required
          />
        </div>

        {!isGraphic && (
          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Visit My Etsy Shop Link URL</label>
            <input 
              type="text" 
              value={shopUrl}
              onChange={(e) => setShopUrl(e.target.value)}
              className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
              placeholder="https://www.etsy.com/shop/YourShop"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={savingSettings} className="px-5 py-2 bg-gold hover:bg-gold-hover text-dark font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-2">
            {savingSettings ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save Settings
          </button>
        </div>
      </form>

      {/* Gallery Grid display */}
      <h3 className="text-xs font-bold text-gold uppercase tracking-wider"><i className="fa-solid fa-images mr-2"></i> Gallery Items ({items.length})</h3>

      {items.length === 0 ? (
        <div className="glass-panel p-10 text-center rounded-xl">
          <i className="fa-solid fa-images text-4xl text-gray-800 mb-3"></i>
          <p className="text-mutedText text-sm">No items in gallery. Perform a bulk upload above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item, idx) => (
            <div key={item._id} className="glass-panel rounded-lg overflow-hidden group flex flex-col justify-between">
              <div className="relative aspect-square bg-dark overflow-hidden flex items-center justify-center border-b border-gray-900">
                {item.image ? (
                  <img src={item.image} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition" />
                ) : (
                  <div className="text-center p-2">
                    <i className="fa-solid fa-image text-2xl text-gray-800 mb-1"></i>
                    <div className="text-[9px] uppercase tracking-widest text-gold opacity-65 font-bold">PLACEHOLDER</div>
                  </div>
                )}
                {isGraphic && (item.is_span_h || item.is_span_v) && (
                  <span className="absolute top-1 left-1 bg-gold/90 text-dark font-bold text-[8px] uppercase px-1 rounded-sm">
                    {item.is_span_h && item.is_span_v ? 'Large' : item.is_span_h ? 'Wide' : 'Tall'}
                  </span>
                )}
              </div>

              <div className="p-3 space-y-2">
                <div className="text-xxs font-bold text-cream truncate" title={item.caption}>
                  {item.caption}
                  {item.price && <span className="text-gold ml-1 font-semibold">({item.price})</span>}
                </div>
                
                <select 
                  value={item.tag} 
                  onChange={(e) => handleTagChange(item._id, e.target.value)}
                  className="w-full bg-dark text-xxs border border-gray-850 p-1 rounded focus:outline-none text-gold font-semibold uppercase text-cream"
                >
                  {isGraphic ? (
                    <>
                      <option value="social-ads">Social Ad</option>
                    </>
                  ) : (
                    <>
                      <option value="Flyer">Flyer</option>
                      <option value="Brochure">Brochure</option>
                      <option value="Social Kit">Social Kit</option>
                      <option value="Branding Kit">Branding Kit</option>
                      <option value="Planner">Planner</option>
                      <option value="Stationery Kit">Stationery Kit</option>
                    </>
                  )}
                </select>

                <div className="flex justify-between items-center pt-2 border-t border-gray-900 text-xxs">
                  <div className="flex gap-2">
                    <button onClick={() => shiftOrder(idx, 'up')} disabled={idx === 0} className={`hover:text-gold ${idx === 0 ? 'opacity-20' : ''}`}><i className="fa-solid fa-arrow-left"></i></button>
                    <button onClick={() => shiftOrder(idx, 'down')} disabled={idx === items.length - 1} className={`hover:text-gold ${idx === items.length - 1 ? 'opacity-20' : ''}`}><i className="fa-solid fa-arrow-right"></i></button>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button onClick={() => handleEditItemClick(item)} className="text-gold hover:text-gold-hover font-bold"><i className="fa-solid fa-pen-to-square"></i></button>
                    <button onClick={() => setDeleteConfirmId(item._id)} className="text-red-400 hover:text-red-500 font-bold"><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Upload Progress Overlay Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-dark-secondary border border-gold-border rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-900 flex justify-between items-center bg-dark-tertiary">
              <div>
                <h3 className="text-lg font-bold text-gold flex items-center gap-2">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  Bulk Uploading Images
                </h3>
                <p className="text-xs text-mutedText mt-0.5">Uploading in batches of 5 images</p>
              </div>
              <button 
                onClick={closeQueueModal} 
                disabled={uploadQueue.some(x => x.status === 'uploading')}
                className="text-mutedText hover:text-cream transition disabled:opacity-20 text-lg"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Stats Strip */}
            <div className="px-6 py-3 bg-dark/40 border-b border-gray-800 flex justify-between items-center text-xs">
              <div className="flex gap-4">
                <span className="text-mutedText">Total: <strong className="text-cream">{uploadQueue.length}</strong></span>
                <span className="text-green-400">Success: <strong>{uploadQueue.filter(x => x.status === 'success').length}</strong></span>
                <span className="text-red-400">Failed: <strong>{uploadQueue.filter(x => x.status === 'failed').length}</strong></span>
              </div>
              <div>
                {uploadQueue.every(x => x.status === 'success' || x.status === 'failed') ? (
                  <span className="text-gold font-bold uppercase tracking-wider text-[10px]">Complete</span>
                ) : (
                  <span className="text-mutedText flex items-center gap-1.5"><i className="fa-solid fa-circle-notch fa-spin text-gold"></i> Uploading...</span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="w-full h-1.5 bg-dark rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold transition-all duration-300"
                  style={{ width: `${(uploadQueue.filter(x => x.status === 'success' || x.status === 'failed').length / uploadQueue.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Scrollable File List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-2.5">
              {uploadQueue.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-dark-tertiary rounded-lg border border-gray-900 text-xs">
                  <div className="flex items-center gap-3 truncate max-w-[70%]">
                    {/* File Thumbnail Preview */}
                    <div className="w-8 h-8 rounded bg-dark flex items-center justify-center overflow-hidden shrink-0 border border-gray-800">
                      {item.file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(item.file)} className="w-full h-full object-cover" />
                      ) : (
                        <i className="fa-solid fa-image text-gray-600"></i>
                      )}
                    </div>
                    <span className="truncate text-cream" title={item.name}>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.status === 'pending' && <span className="text-mutedText uppercase text-[9px] tracking-wider font-bold">Pending</span>}
                    {item.status === 'uploading' && (
                      <span className="text-gold font-bold flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
                        <i className="fa-solid fa-circle-notch fa-spin"></i> Uploading
                      </span>
                    )}
                    {item.status === 'success' && <span className="text-green-400 font-bold uppercase text-[9px] tracking-wider"><i className="fa-solid fa-circle-check mr-1"></i> Success</span>}
                    {item.status === 'failed' && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-bold uppercase text-[9px] tracking-wider" title={item.error}><i className="fa-solid fa-triangle-exclamation mr-1"></i> Failed</span>
                        <button 
                          onClick={() => retryUpload(item.id)}
                          className="px-2 py-0.5 bg-gold/10 hover:bg-gold/25 border border-gold/30 text-gold rounded font-bold text-[9px] uppercase tracking-wider transition"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-900 flex justify-end gap-3 bg-dark-tertiary">
              {uploadQueue.every(x => x.status === 'success' || x.status === 'failed') && (
                <button 
                  onClick={closeQueueModal}
                  className="px-5 py-2 bg-gold hover:bg-gold-hover text-dark font-bold text-xs uppercase tracking-wider rounded-lg transition"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-PANEL: CONTACT & MESSAGES INBOX ---
function ContactManager({ showToast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await AdminAPI.getMessages();
      setMessages(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (id, currentStatus) => {
    try {
      await AdminAPI.markMessageRead(id, !currentStatus);
      setMessages(prev => prev.map(m => m._id === id ? { ...m, is_read: !currentStatus } : m));
      showToast(`Message marked as ${!currentStatus ? 'read' : 'unread'}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await AdminAPI.deleteMessage(deleteConfirmId);
      setMessages(prev => prev.filter(m => m._id !== deleteConfirmId));
      showToast('Message deleted successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gold"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {deleteConfirmId && (
        <ConfirmModal 
          title="Delete Message?"
          message="Are you sure you want to permanently delete this client submission?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide flex items-center gap-3">
          <i className="fa-solid fa-inbox text-gold"></i>
          Messages Inbox
        </h1>
        <p className="text-xs text-mutedText mt-1">Review contact form submissions from the public website</p>
      </div>

      {messages.length === 0 ? (
        <div className="glass-panel p-10 text-center rounded-xl">
          <i className="fa-solid fa-envelope-open text-4xl text-gray-800 mb-3"></i>
          <p className="text-mutedText text-sm">No messages received yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div 
              key={msg._id} 
              className={`glass-panel p-5 rounded-xl border-l-4 transition ${msg.is_read ? 'border-l-gray-800' : 'border-l-gold bg-dark-secondary/50'}`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-2 border-b border-gray-900 pb-2 mb-3">
                <div>
                  <span className="font-bold text-cream text-sm">{msg.name}</span>
                  <a href={`mailto:${msg.email}`} className="text-xs text-gold hover:underline block md:inline md:ml-3">
                    <i className="fa-solid fa-envelope mr-1"></i> {msg.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-xxs text-mutedText">
                  <span>{new Date(msg.created_at).toLocaleString()}</span>
                  <button onClick={() => toggleReadStatus(msg._id, msg.is_read)} className="hover:text-gold" title={msg.is_read ? 'Mark as Unread' : 'Mark as Read'}>
                    <i className={`fa-solid ${msg.is_read ? 'fa-envelope-open' : 'fa-envelope'}`}></i> {msg.is_read ? 'Read' : 'Unread'}
                  </button>
                  <button onClick={() => setDeleteConfirmId(msg._id)} className="text-red-400 hover:text-red-500">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
              <div className="text-xs font-bold text-gold uppercase tracking-wider mb-2">{msg.subject}</div>
              <p className="text-xs text-mutedText whitespace-pre-wrap leading-relaxed">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- SUB-PANEL: SITE SETTINGS MANAGER ---
function SettingsManager({ showToast }) {
  const [settings, setSettings] = useState({
    logo_text: '', logo_span: '', favicon_url: '', seo_title: '', seo_description: '', font: '',
    social_links: { linkedin: '', instagram: '', behance: '', etsy: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await AdminAPI.getSettings();
      setSettings(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await AdminAPI.updateSettings(settings);
      showToast('Global settings updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gold"></i>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center border-b border-gray-900 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide flex items-center gap-3">
            <i className="fa-solid fa-sliders text-gold"></i>
            Global Settings
          </h1>
          <p className="text-xs text-mutedText mt-1">Configure global SEO meta tags, text branding, and social connections</p>
        </div>
        <button type="submit" disabled={saving} className="px-6 py-3 bg-gold hover:bg-gold-hover text-dark font-bold uppercase tracking-widest text-xs rounded-lg transition flex items-center gap-2">
          {saving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl space-y-6">
          <h3 className="text-xs font-bold text-gold uppercase tracking-wider border-b border-gray-900 pb-2"><i className="fa-solid fa-globe mr-2"></i> Branding & SEO Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Logo Text Primary</label>
              <input 
                type="text" 
                value={settings.logo_text}
                onChange={(e) => handleTextChange('logo_text', e.target.value)}
                className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Logo Text Accent</label>
              <input 
                type="text" 
                value={settings.logo_span}
                onChange={(e) => handleTextChange('logo_span', e.target.value)}
                className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Global Meta SEO Title</label>
            <input 
              type="text" 
              value={settings.seo_title}
              onChange={(e) => handleTextChange('seo_title', e.target.value)}
              className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Global Meta SEO Description</label>
            <textarea 
              value={settings.seo_description}
              onChange={(e) => handleTextChange('seo_description', e.target.value)}
              className="w-full h-28 bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none leading-relaxed"
              required
            />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-6">
          <h3 className="text-xs font-bold text-gold uppercase tracking-wider border-b border-gray-900 pb-2"><i className="fa-solid fa-share-nodes mr-2"></i> Social Networks</h3>
          
          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">LinkedIn URL</label>
            <div className="flex">
              <span className="bg-dark border border-gray-800 border-r-0 rounded-l-lg p-3 text-xs text-gold flex items-center justify-center w-12"><i className="fa-brands fa-linkedin-in"></i></span>
              <input 
                type="text" 
                value={settings.social_links?.linkedin || ''}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                className="flex-1 bg-dark border border-gray-800 rounded-r-lg p-3 text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Instagram URL</label>
            <div className="flex">
              <span className="bg-dark border border-gray-800 border-r-0 rounded-l-lg p-3 text-xs text-gold flex items-center justify-center w-12"><i className="fa-brands fa-instagram"></i></span>
              <input 
                type="text" 
                value={settings.social_links?.instagram || ''}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                className="flex-1 bg-dark border border-gray-800 rounded-r-lg p-3 text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Behance URL</label>
            <div className="flex">
              <span className="bg-dark border border-gray-800 border-r-0 rounded-l-lg p-3 text-xs text-gold flex items-center justify-center w-12"><i className="fa-brands fa-behance"></i></span>
              <input 
                type="text" 
                value={settings.social_links?.behance || ''}
                onChange={(e) => handleSocialChange('behance', e.target.value)}
                className="flex-1 bg-dark border border-gray-800 rounded-r-lg p-3 text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Etsy Store URL</label>
            <div className="flex">
              <span className="bg-dark border border-gray-800 border-r-0 rounded-l-lg p-3 text-xs text-gold flex items-center justify-center w-12"><i className="fa-brands fa-etsy"></i></span>
              <input 
                type="text" 
                value={settings.social_links?.etsy || ''}
                onChange={(e) => handleSocialChange('etsy', e.target.value)}
                className="flex-1 bg-dark border border-gray-800 rounded-r-lg p-3 text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
// --- SUB-PANEL: CONTACT FORM SETTINGS MANAGER ---
function ContactSettingsManager({ showToast }) {
  const [settings, setSettings] = useState({
    contact_recipient_email: '',
    contact_email_enabled: true,
    contact_db_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await AdminAPI.getSettings();
      setSettings({
        contact_recipient_email: res.contact_recipient_email || 'sarahyaseen123456@gmail.com',
        contact_email_enabled: res.contact_email_enabled !== false,
        contact_db_enabled: res.contact_db_enabled !== false
      });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await AdminAPI.updateSettings(settings);
      showToast('Contact settings updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gold"></i>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center border-b border-gray-900 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide flex items-center gap-3">
            <i className="fa-solid fa-envelope-open-text text-gold"></i>
            Contact Form Settings
          </h1>
          <p className="text-xs text-mutedText mt-1">Configure email forwarding and database logging for contact submissions</p>
        </div>
        <button type="submit" disabled={saving} className="px-6 py-3 bg-gold hover:bg-gold-hover text-dark font-bold uppercase tracking-widest text-xs rounded-lg transition flex items-center gap-2">
          {saving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>} Save Settings
        </button>
      </div>

      <div className="max-w-xl glass-panel p-6 rounded-xl space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-gold tracking-wider mb-2">Recipient Email Address</label>
          <input 
            type="email" 
            value={settings.contact_recipient_email}
            onChange={(e) => handleFieldChange('contact_recipient_email', e.target.value)}
            className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm text-cream focus:outline-none focus:border-gold transition form-input-focus"
            placeholder="sarahyaseen123456@gmail.com"
            required 
          />
          <p className="text-[10px] text-mutedText mt-1">Submitted messages will be forwarded to this inbox.</p>
        </div>

        <div className="border-t border-gray-900 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold uppercase text-cream tracking-wide">Enable Email Forwarding</label>
              <p className="text-[10px] text-mutedText">Send an email notification when a new message is received.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.contact_email_enabled}
                onChange={(e) => handleFieldChange('contact_email_enabled', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold peer-checked:after:bg-dark"></div>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-gray-900/50 pt-4">
            <div>
              <label className="block text-xs font-bold uppercase text-cream tracking-wide">Enable Database Logging</label>
              <p className="text-[10px] text-mutedText">Save messages to the database to show in the Inbox manager.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.contact_db_enabled}
                onChange={(e) => handleFieldChange('contact_db_enabled', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold peer-checked:after:bg-dark"></div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}

// --- SUB-PANEL: SECURITY/PASSWORD COMPONENT ---
function SecurityManager({ showToast }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setSaving(true);
    try {
      await AdminAPI.updatePassword(oldPassword, newPassword);
      showToast('Password changed successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg animate-fade-in pb-12">
      <div className="border-b border-gray-900 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide flex items-center gap-3">
          <i className="fa-solid fa-shield-halved text-gold"></i>
          Account Security
        </h1>
        <p className="text-xs text-mutedText mt-1">Change credentials for administrative login access</p>
      </div>

      <div className="glass-panel p-6 rounded-xl space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Current Admin Password</label>
          <input 
            type="password" 
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">New Admin Password</label>
          <input 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-mutedText tracking-wider mb-2">Confirm New Password</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-dark border border-gray-800 rounded-lg p-3 text-sm focus:outline-none"
            required
          />
        </div>

        <button type="submit" disabled={saving} className="px-6 py-3 bg-gold hover:bg-gold-hover text-dark font-bold uppercase tracking-widest text-xs rounded-lg transition flex items-center gap-2">
          {saving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-lock"></i>} Update Password
        </button>
      </div>
    </form>
  );
}

// --- MASTER APPLICATION CONTROLLER ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [dashboardStats, setDashboardStats] = useState({ wordpress: 0, uiux: 0, graphic: 0, etsy: 0 });
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
    verifySession();
  }, []);

  const verifySession = async () => {
    if (AdminAPI.isLoggedIn()) {
      try {
        await AdminAPI.verifyToken();
        setIsLoggedIn(true);
        loadDashboardStats();
      } catch (err) {
        AdminAPI.clearToken();
        setIsLoggedIn(false);
      }
    }
    setLoading(false);
  };

  const loadDashboardStats = async () => {
    try {
      const wp = await AdminAPI.getProjects('wordpress');
      const ux = await AdminAPI.getProjects('ui-ux');
      const gd = await AdminAPI.getGallery('graphic-design');
      const et = await AdminAPI.getGallery('etsy');
      const msgs = await AdminAPI.getMessages();

      setDashboardStats({
        wordpress: wp.length,
        uiux: ux.length,
        graphic: gd.length,
        etsy: et.length
      });
      setAllMessages(msgs);
    } catch (e) {
      console.error("Failed to load overview stats", e);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeSection === 'dashboard') {
      loadDashboardStats();
    }
  }, [activeSection, isLoggedIn]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActiveSection('dashboard');
    loadDashboardStats();
  };

  const handleLogout = () => {
    AdminAPI.clearToken();
    setIsLoggedIn(false);
    showToast('Logged out successfully.', 'success');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const unreadMessagesCount = allMessages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-gold mb-4"></i>
          <p className="text-mutedText uppercase tracking-widest text-xs">Authenticating Session...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <Login onLoginSuccess={handleLoginSuccess} showToast={showToast} />
      </div>
    );
  }

  const sidebarLinks = [
    { section: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
    { section: 'home', label: 'Home Page Editor', icon: 'fa-solid fa-house-laptop' },
    { section: 'wordpress', label: 'WordPress Projects', icon: 'fa-brands fa-wordpress' },
    { section: 'uiux', label: 'UI/UX Case Studies', icon: 'fa-brands fa-figma' },
    { section: 'graphic', label: 'Graphic Designing', icon: 'fa-solid fa-palette' },
    { section: 'etsy', label: 'Etsy Products', icon: 'fa-brands fa-etsy' },
    { 
      section: 'messages', 
      label: 'Inbox', 
      icon: 'fa-solid fa-inbox',
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null 
    },
    { section: 'contactSettings', label: 'Contact Settings', icon: 'fa-solid fa-envelope-open-text' },
    { section: 'settings', label: 'Global Settings', icon: 'fa-solid fa-sliders' },
    { section: 'security', label: 'Security', icon: 'fa-solid fa-shield-halved' }
  ];

  return (
    <div className="flex min-h-screen bg-dark">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-dark-secondary border-r border-gold-border flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-gray-900 text-center">
            <div className="text-lg font-extrabold uppercase tracking-widest text-cream">
              Sarah<span className="text-gold">.Yaseen</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-gold font-bold">PORTFOLIO CMS</span>
          </div>

          <nav className="p-4 space-y-1">
            {sidebarLinks.map(item => (
              <button
                key={item.section}
                onClick={() => setActiveSection(item.section)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  activeSection === item.section 
                    ? 'bg-gold text-dark font-extrabold' 
                    : 'text-mutedText hover:bg-dark hover:text-gold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={item.icon}></i>
                  {item.label}
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${activeSection === item.section ? 'bg-dark text-gold' : 'bg-gold text-dark'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-900">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-950/20 hover:text-red-500 rounded-lg transition"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-dark-secondary border-b border-gray-900 h-16 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            <span className="text-sm font-black uppercase tracking-wider md:hidden">Sarah<span className="text-gold">.Y</span> CMS</span>
            <span className="hidden md:inline text-xs font-semibold tracking-wider text-mutedText">Welcome back, Administrator</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-xs font-bold uppercase tracking-widest text-gold hover:text-white flex items-center gap-1.5 transition">
              <i className="fa-solid fa-eye"></i> View Site
            </a>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl w-full mx-auto">
          {activeSection === 'dashboard' && <DashboardOverview stats={dashboardStats} setSection={setActiveSection} messages={allMessages} />}
          {activeSection === 'home' && <HomeEditor showToast={showToast} />}
          {activeSection === 'wordpress' && <ProjectManager category="wordpress" showToast={showToast} />}
          {activeSection === 'uiux' && <ProjectManager category="ui-ux" showToast={showToast} />}
          {activeSection === 'graphic' && <GalleryManager category="graphic-design" showToast={showToast} />}
          {activeSection === 'etsy' && <GalleryManager category="etsy" showToast={showToast} />}
          {activeSection === 'messages' && <ContactManager showToast={showToast} />}
          {activeSection === 'contactSettings' && <ContactSettingsManager showToast={showToast} />}
          {activeSection === 'settings' && <SettingsManager showToast={showToast} />}
          {activeSection === 'security' && <SecurityManager showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
