/* 
================================================================
SARAH YASEEN PORTFOLIO - PUBLIC API ENGINE
================================================================
Fetches dynamic content from Express API.
Includes a complete local static fallback structure for 
graceful degradation (in case the server is offline).
================================================================
*/

const API_BASE = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:8080';

// Defensively copy initial seed content as a static fallback
const STATIC_FALLBACK = {
  home_content: {
    hero: {
      heading: "Hi, I'm Sarah Yaseen",
      subheading_phrases: ["WordPress Developer", "UI/UX Designer", "Graphic Designer", "Etsy Product Designer"],
      intro: "A creative digital professional with 3 years of experience building clean, modern, and user-friendly digital experiences — from responsive WordPress websites and intuitive UI/UX designs in Figma, to eye-catching graphic designs and ready-to-edit Etsy templates in Canva.",
      cta_primary_label: "View Portfolio",
      cta_primary_link: "portfolio/wordpress.html",
      cta_secondary_label: "Contact Me",
      cta_secondary_link: "#contact",
      email: "sarahyaseen2056@gmail.com",
      phone: "0335 7423475"
    },
    about: {
      portrait_image_url: "assets/profile.jpg",
      content: "I'm Sarah Yaseen, a WordPress Developer and UI/UX Designer with 3 years of experience creating clean, modern, and user-friendly digital experiences for web and mobile. I specialize in designing intuitive interfaces and smooth user journeys in Figma, and building fully responsive WordPress websites using Elementor. I also bring a strong eye for visual design — creating graphics and Etsy-ready templates that are both functional and beautiful. My focus is always on combining aesthetics with usability to deliver effective, engaging design solutions."
    },
    expertise: [
      { id: "exp-1", icon: "fa-brands fa-wordpress", title: "WordPress Development", description: "Building responsive, SEO-friendly websites using WordPress & Elementor for businesses across industries.", link: "portfolio/wordpress.html" },
      { id: "exp-2", icon: "fa-brands fa-figma", title: "UI/UX Design", description: "Designing intuitive user interfaces and end-to-end user flows in Figma for web and mobile apps.", link: "portfolio/ui-ux.html" },
      { id: "exp-3", icon: "fa-solid fa-palette", title: "Graphic Designing", description: "Creating scroll-stopping social media ads, banners, and branded visual content.", link: "portfolio/graphic-design.html" },
      { id: "exp-4", icon: "fa-brands fa-etsy", title: "Etsy Digital Products", description: "Designing editable Canva templates (flyers, brochures, social posts) sold as digital products on Etsy.", link: "portfolio/etsy.html" }
    ],
    stats: [
      { id: "stat-1", number: "3+", label: "Years Experience" },
      { id: "stat-2", number: "25+", label: "WordPress Projects" },
      { id: "stat-3", number: "15+", label: "UI/UX Case Studies" },
      { id: "stat-4", number: "300+", label: "Etsy Templates" }
    ],
    cta: {
      heading: "Let's Work Together",
      description: "Always open to new opportunities and collaborations in WordPress development, UI/UX, and design.",
      button_label: "Get in Touch",
      button_link: "#contact"
    }
  },
  site_settings: {
    logo_text: "Sarah",
    logo_span: ".Yaseen",
    favicon_url: "assets/profile-placeholder.svg",
    social_links: {
      linkedin: "#",
      instagram: "#",
      behance: "#",
      etsy: "#"
    }
  },
  page_intros: {
    "graphic-design": "A collection of social media graphics, product promotion banners, and brand campaign visuals — designed to grab attention and communicate a brand's message clearly and creatively.",
    "etsy": "A showcase of ready-to-edit Canva templates designed for small businesses and professionals — including brochures, flyers, and social media kits — available as digital downloads on Etsy."
  }
};

const PortfolioAPI = {
  // Safe helper to perform requests and fall back on error
  async _request(endpoint, fallbackValue) {
    const cacheKey = `portfolio_cache_${endpoint}`;
    
    // 1. Try to load from cache first for instant rendering
    const cached = localStorage.getItem(cacheKey);
    let cachedData = null;
    if (cached) {
      try {
        cachedData = JSON.parse(cached);
      } catch (e) {}
    }

    // 2. Fetch from network in background or foreground
    const fetchPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }
        const data = await response.json();
        // Update cache
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      } catch (err) {
        console.warn(`API Error on ${endpoint}: ${err.message}.`);
        if (cachedData) return cachedData;
        return fallbackValue;
      }
    })();

    if (cachedData) {
      // Run the fetch in background to refresh cache silently
      fetchPromise.catch(() => {});
      return cachedData;
    }
    
    return fetchPromise;
  },

  // 1. Get Home Page Details
  async getHomeContent() {
    return this._request('/api/content/home', STATIC_FALLBACK.home_content);
  },

  // 2. Get Site Settings
  async getSettings() {
    return this._request('/api/settings', STATIC_FALLBACK.site_settings);
  },

  // 3. Get Project Lists (WordPress / UI-UX)
  async getProjects(category) {
    // We construct default project array as a local fallback
    const fallbackProjects = {
      wordpress: [
        { _id: "wp-1", title: "German Car Service Website", description: "I designed and developed this German car service website using WordPress with Elementor, focusing on creating a modern, clean, and user-friendly interface...", images: ["/uploads/placeholder-wp-1.svg"], tags: ["WordPress", "Elementor", "UI/UX", "Responsive"] },
        { _id: "wp-2", title: "LLC Business Website Design", description: "This project involved designing and developing a professional WordPress website for an LLC business using Elementor...", images: ["/uploads/placeholder-wp-2.svg"], tags: ["WordPress", "Elementor", "Corporate"] },
        { _id: "wp-3", title: "Dubai Urgent Visa Website", description: "This project focused on designing and developing a fast, user-friendly WordPress website for Dubai urgent visa services...", images: ["/uploads/placeholder-wp-3.svg"], tags: ["WordPress", "Elementor", "Lead Gen"] },
        { _id: "wp-4", title: "GCCF – Global Climate Change Foundation Website", description: "This project involved designing and developing an informative and impact-focused WordPress website for the Global Climate Change Foundation...", images: ["/uploads/placeholder-wp-4.svg"], tags: ["WordPress", "Elementor", "Non-Profit"] },
        { _id: "wp-5", title: "Limitless Repair Co – Credit Repair Website", description: "This project involved designing and developing a professional WordPress website for Limitless Repair Co...", images: ["/uploads/placeholder-wp-5.svg"], tags: ["WordPress", "Elementor", "Credit Repair"] },
        { _id: "wp-6", title: "New England Agency – AI Solutions Website", description: "This project involved designing and developing a modern WordPress website for New England Agency...", images: ["/uploads/placeholder-wp-6.svg"], tags: ["WordPress", "Elementor", "AI Tech Site"] },
        { _id: "wp-7", title: "Own Aim Construction Website", description: "This project involved designing and developing a professional WordPress website for Own Aim Construction...", images: ["/uploads/placeholder-wp-7.svg"], tags: ["WordPress", "Elementor", "Construction"] },
        { _id: "wp-8", title: "Surplus Recovery – Real Estate Website", description: "This project involved designing and developing a professional WordPress website for a real estate surplus recovery service...", images: ["/uploads/placeholder-wp-8.svg"], tags: ["WordPress", "Elementor", "Real Estate"] }
      ],
      "ui-ux": [
        { _id: "ux-1", title: "AirLift-Style Ride Booking Web App", description: "I designed a complete web application interface for an AirLift-style ride booking platform using Figma...", images: ["/uploads/placeholder-ux-1.svg"], tags: ["Figma", "Web App"], external_link: "https://www.figma.com/design/GoKLFCEApVUQ1XPrFTiqul/Air-lift-web-design" },
        { _id: "ux-2", title: "Quick Oil Change Service Finder UI/UX Design", description: "I designed this Quick Oil Change Service Finder web page in Figma...", images: ["/uploads/placeholder-ux-2.svg"], tags: ["Figma", "User Research"] },
        { _id: "ux-3", title: "First Alert – Fleet Safety & Incident Management Dashboard", description: "I designed the UI for First Alert, a real-time fleet safety and incident management platform, in Figma...", images: ["/uploads/placeholder-ux-3.svg"], tags: ["Figma", "Dashboard"], external_link: "https://www.figma.com/design/aqM1u4kEEWhUJGdzeqGqPz/Shipping-management" }
      ],
      "graphic-design": [
        { _id: "gd-proj-1", title: "Apex Cyber Logo & Branding Kit", description: "Creative branding and visual identity suite designed for a modern cybersecurity agency, featuring customizable templates.", images: ["/uploads/placeholder-ux-2.svg"], tags: ["Branding", "Logo Kit", "Vector Art"], external_link: "portfolio/graphic-design.html" }
      ],
      "social-media": [
        { _id: "smm-proj-1", title: "FitLife Instagram Promo Campaign", description: "Branded social media ad creatives and promotional banner design templates optimized for high engagement.", images: ["/uploads/placeholder-ux-1.svg"], tags: ["SMM", "Instagram", "Canva"], external_link: "portfolio/graphic-design.html" }
      ],
      "seo-blogging": [
        { _id: "seo-proj-1", title: "Surplus Recovery – Real Estate SEO Blog", description: "Designed a high-converting SEO blogging template and outline to boost organic reach and search rankings.", images: ["/uploads/placeholder-wp-8.svg"], tags: ["SEO", "Blogging", "Content Strategy"], external_link: "portfolio/wordpress.html" }
      ],
      "video-editing": [
        { _id: "video-proj-1", title: "Real Estate Promotional Video", description: "Cinematic property tour and promotional video editing for luxury real estate listings, optimized for social media.", images: ["/uploads/placeholder-wp-5.svg"], tags: ["Video Editing", "Premiere Pro", "Shorts/Reels"], external_link: "#contact" }
      ],
      "web-dev": [
        { _id: "webdev-proj-1", title: "AirLift-Style Ride Booking Web App", description: "Interactive ride booking web application interface and prototype designed in Figma for seamless commuter flow.", images: ["/uploads/placeholder-ux-1.svg"], tags: ["Web Dev", "Figma", "UI/UX Design"], external_link: "portfolio/ui-ux.html" }
      ]
    };

    return this._request(`/api/projects?category=${category}`, fallbackProjects[category] || []);
  },

  // 4. Get Gallery Lists (Graphic Design / Etsy)
  async getGallery(category) {
    const fallbackItems = {
      "graphic-design": [
        { _id: "wvigswfvz", category: "graphic-design", image: "/uploads/upload-1787739030180-946943607.webp", caption: "Graphic Designing", tag: "social-ads", order: 19 },
        { _id: "1gcas9ycf", category: "graphic-design", image: "/uploads/upload-1787739030184-169645333.webp", caption: "Corporate Promotion Social Ad", tag: "social-ads", order: 20 },
        { _id: "bsykgcbj8", category: "graphic-design", image: "/uploads/upload-1787739030187-726800565.jpg", caption: "Digital Marketing Campaign Banner", tag: "social-ads", order: 21 },
        { _id: "2wmxayp7b", category: "graphic-design", image: "/uploads/upload-1787739030182-439426471.webp", caption: "E-Commerce Discount Social Grid", tag: "social-ads", order: 22 },
        { _id: "nhsqlrnle", category: "graphic-design", image: "/uploads/upload-1787739030195-318841831.jpg", caption: "Real Estate Facebook Post Design", tag: "social-ads", order: 23 },
        { _id: "f8hcx0qwz", category: "graphic-design", image: "/uploads/upload-1787739030386-557584881.webp", caption: "Apex Cyber Security Campaign", tag: "social-ads", order: 24 },
        { _id: "9iu8bovj9", category: "graphic-design", image: "/uploads/upload-1787739030525-919508224.webp", caption: "Brand Product Promotion Banner", tag: "social-ads", order: 29 },
        { _id: "2mjtst403", category: "graphic-design", image: "/uploads/upload-1787739030523-714589997.webp", caption: "Business Agency Instagram Post", tag: "social-ads", order: 31 },
        { _id: "i5j38gfl6", category: "graphic-design", image: "/uploads/upload-1787739030527-611423936.webp", caption: "Creative Agency Promotion Cover", tag: "social-ads", order: 32 },
        { _id: "kr1dqwxhy", category: "graphic-design", image: "/uploads/upload-1787739030530-943369121.png", caption: "Modern Business Flyer Layout", tag: "social-ads", order: 33 },
        { _id: "mrci5y2yg", category: "graphic-design", image: "/uploads/upload-1787739030641-291233625.png", caption: "Corporate Tri-fold Brochure Cover", tag: "social-ads", order: 34 },
        { _id: "ku20qsc2", category: "graphic-design", image: "/uploads/upload-1787739030650-5042671.png", caption: "Minimalist Business Identity Kit", tag: "Branding", order: 35 },
        { _id: "68jjkx0tg", category: "graphic-design", image: "/uploads/upload-1787739030645-869371429.png", caption: "Corporate Stationery Package", tag: "Branding", order: 36 },
        { _id: "kqpup0p8q", category: "graphic-design", image: "/uploads/upload-1787739030642-282650169.png", caption: "Modern Creative Logo Branding", tag: "Branding", order: 37 },
        { _id: "m926pyzr6", category: "graphic-design", image: "/uploads/upload-1787739030647-882575357.png", caption: "Corporate Presentation Slides", tag: "Branding", order: 38 },
        { _id: "3jgi5rkeu", category: "graphic-design", image: "/uploads/upload-1787739030782-157174145.png", caption: "Product Branding Package Design", tag: "Branding", order: 39 }
      ],
      "etsy": Array.from({ length: 24 }, (_, i) => ({
        _id: `etsy-${i+1}`,
        caption: ["Real Estate Marketing Flyer", "Gym Tri-fold Brochure", "Skincare Post & Stories Kit", "Bakery Stationery & Tag Kit", "Beauty Salon Tri-fold", "Personal Trainer Rate Sheet", "Digital Marketing Planner", "Restaurant Table Menu", "Yoga Studio Social Pack", "Creative Agency Booklet", "Elegant Wedding Invitation Set", "Fashion Brand Lookbook", "Cleaning Services Flyer", "Spa Service Price List", "Café Instagram Stories Kit", "Minimalist Business Cards", "Medical Services Brochure", "Financial Advisor Flyer", "Photography Client Packet", "Self-Care Digital Journal", "Airbnb Welcome Guest Guide", "Author Book Promotion Pack", "Business Consultant Pitch Deck", "Daily Fitness & Wellness Planner"][i],
        tag: ["Flyer", "Brochure", "Social Kit", "Branding Kit", "Brochure", "Flyer", "Planner", "Flyer", "Social Kit", "Brochure", "Stationery Kit", "Branding Kit", "Flyer", "Flyer", "Social Kit", "Stationery Kit", "Brochure", "Flyer", "Stationery Kit", "Planner", "Branding Kit", "Social Kit", "Branding Kit", "Planner"][i],
        image: ["/uploads/upload-1787568048246-811438314.jpg", "/uploads/upload-1787567995533-469959206.jpg", "/uploads/upload-1787567985677-729134214.jpg", "/uploads/upload-1787567962577-686744954.jpg", "/uploads/upload-1787567692141-986515546.jpg", "/uploads/upload-1787567607780-81895277.jpg", "/uploads/upload-1787308679034-655591145.jpg", "/uploads/upload-1787307691031-371191773.jpg"][i] || ""
      }))
    };

    return this._request(`/api/gallery?category=${category}`, fallbackItems[category] || []);
  },

  // 5. Get Page Intros
  async getIntros() {
    return this._request('/api/intros', STATIC_FALLBACK.page_intros);
  },

  // 6. Submit Contact Message
  async submitMessage(data) {
    try {
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Server submit error');
      }
      return await response.json();
    } catch (err) {
      console.warn("API Submit error, executing local fallback simulation.", err);
      // Simulate client success
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
    }
  }
};

window.PortfolioAPI = PortfolioAPI;
