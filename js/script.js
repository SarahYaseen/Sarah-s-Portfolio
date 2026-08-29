/* 
================================================================
SARAH YASEEN PORTFOLIO - DYNAMIC RUNTIME ENGINE
================================================================
Controls:
1. Typewriter Animation (Hero Sub-heading)
2. Sticky Header & Scroll Behavior
3. Mobile Navigation Menu Toggle (Accordion Dropdown)
4. Scroll Reveal Intersection Observer
5. Dynamic Page Rendering (API Fetch)
6. Gallery Filtering (Graphic Design Page)
7. Interactive Contact Form Submission Handler
================================================================
*/

document.addEventListener('DOMContentLoaded', async () => {
  function logDebugStatus(msg) {
    const el = document.getElementById('debug-status-log');
    if (el) {
      if (el.innerHTML === 'Loading scripts...') el.innerHTML = '';
      el.innerHTML += '<div style="margin-bottom: 4px;">[' + new Date().toLocaleTimeString() + '] ' + msg + '</div>';
    }
  }
  logDebugStatus('script.js DOMContentLoaded listener initialized.');

  // Initialize Welcome Popup Immediately
  (function() {
    const popupOverlay = document.getElementById('welcome-popup-overlay');
    const closeBtn = document.getElementById('welcome-popup-close-btn');
    const ctaBtn = document.getElementById('welcome-popup-cta-btn');

    if (popupOverlay) {
      // Immediately display popup on page load, no sessionStorage check
      popupOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      const closePopup = () => {
        popupOverlay.classList.remove('active');
        document.body.style.overflow = '';
      };

      if (closeBtn) closeBtn.addEventListener('click', closePopup);
      if (ctaBtn) ctaBtn.addEventListener('click', closePopup);

      popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
          closePopup();
        }
      });
    }
  })();

  // Mobile Hamburger Navigation & Dropdown Toggle
  (function() {
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu-list');
    const dropdownToggle = document.querySelector('.dropdown-toggle-btn');
    const dropdownParent = document.querySelector('.dropdown');

    if (hamburger && navMenu) {
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      // Close menu when clicking a nav link
      const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle-btn)');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
          hamburger.classList.remove('active');
          navMenu.classList.remove('active');
        }
      });
    }

    // Toggle portfolio dropdown on mobile
    if (dropdownToggle && dropdownParent) {
      dropdownToggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 991) {
          e.preventDefault();
          e.stopPropagation();
          dropdownParent.classList.toggle('active');
        }
      });
    }
  })();

  let apiLoaded = false;
  let homeData = null;
  let siteSettings = null;
  let wpGridContainer = null;
  let uiuxGridContainer = null;
  let gdGridContainer = null;
  let etsyGridContainer = null;

  function resolveImagePath(src) {
    if (!src) return '';
    if (src.startsWith('/uploads/')) {
      if (window.location.protocol === 'file:') {
        if (window.location.pathname.includes('/portfolio/')) {
          return '../' + src.substring(1);
        }
        return src.substring(1);
      }
      return window.location.origin + src;
    }
    return src;
  }


  // Helper to update global branding elements (logo, footer, social links)
  function updateGlobalSettings(settings) {
    if (!settings) return;
    
    // Logo texts
    const logoLinks = document.querySelectorAll('.logo a');
    logoLinks.forEach(link => {
      link.innerHTML = `${settings.logo_text || 'Sarah'}<span>${settings.logo_span || '.Yaseen'}</span>`;
    });

    const footerLogos = document.querySelectorAll('.footer-logo');
    footerLogos.forEach(logo => {
      logo.innerHTML = `${settings.logo_text || 'Sarah'}<span>${settings.logo_span || '.Yaseen'}</span>`;
    });

    // Social Icon Links
    const socialContainers = document.querySelectorAll('.social-icons');
    if (settings.social_links) {
      socialContainers.forEach(container => {
        const links = container.querySelectorAll('a');
        links.forEach(link => {
          const label = link.getAttribute('aria-label') || '';
          if (label.toLowerCase().includes('linkedin')) {
            link.setAttribute('href', settings.social_links.linkedin || '#');
          } else if (label.toLowerCase().includes('behance')) {
            link.setAttribute('href', settings.social_links.behance || '#');
          } else if (label.toLowerCase().includes('instagram')) {
            link.setAttribute('href', settings.social_links.instagram || '#');
          } else if (label.toLowerCase().includes('etsy')) {
            link.setAttribute('href', settings.social_links.etsy || '#');
          }
        });
      });
    }

    // Dynamic Footer Contact info
    const footerPhone = document.querySelector('.footer-contact .fa-phone + span');
    const footerEmail = document.querySelector('.footer-contact .fa-envelope + span');
    
    const contactInfo = settings.contact_info || { phone: '0335 7423475', email: 'sarahyaseen2056@gmail.com' };
    if (footerPhone) footerPhone.textContent = contactInfo.phone;
    if (footerEmail) footerEmail.textContent = contactInfo.email;

    // Etsy Shop Button link binding
    const etsyShopBtn = document.getElementById('etsy-shop-btn');
    if (etsyShopBtn && settings.social_links && settings.social_links.etsy) {
      etsyShopBtn.setAttribute('href', settings.social_links.etsy);
    }
  }

  // --- 1. DYNAMIC PAGE RENDER ROUTINES ---



  async function renderHomePage(data) {
    if (!data) return;
    
    // Hero Text
    if (data.hero) {
      const heroTitle = document.getElementById('hero-title');
      const heroIntro = document.querySelector('.hero-intro');
      const ctaPrimary = document.querySelector('.hero-actions .btn-primary');
      const ctaSecondary = document.querySelector('.hero-actions .btn-secondary');
      const emailLink = document.querySelector('.contact-item a[href^="mailto:"]');
      const phoneLink = document.querySelector('.contact-item a[href^="tel:"]');
      
      if (heroTitle) {
        const text = data.hero.heading || "I'M SARAH YASEEN";
        if (text.includes("SARAH YASEEN")) {
          heroTitle.innerHTML = text.replace("SARAH YASEEN", '<span class="text-prominent">SARAH YASEEN</span>');
        } else if (text.includes("Sarah Yaseen")) {
          heroTitle.innerHTML = text.replace("Sarah Yaseen", '<span class="text-prominent">Sarah Yaseen</span>');
        } else {
          heroTitle.textContent = text;
        }
      }
      if (heroIntro) heroIntro.textContent = data.hero.intro;
      
      if (ctaPrimary && data.hero.cta_primary_label) {
        ctaPrimary.textContent = data.hero.cta_primary_label;
        ctaPrimary.setAttribute('href', data.hero.cta_primary_link);
      }
      if (ctaSecondary && data.hero.cta_secondary_label) {
        ctaSecondary.textContent = data.hero.cta_secondary_label;
        ctaSecondary.setAttribute('href', data.hero.cta_secondary_link);
      }

      if (emailLink) {
        emailLink.textContent = data.hero.email;
        emailLink.setAttribute('href', `mailto:${data.hero.email}`);
      }
      if (phoneLink) {
        phoneLink.textContent = data.hero.phone;
        phoneLink.setAttribute('href', `tel:${data.hero.phone.replace(/\s/g, '')}`);
      }

      // Also updates the home contact side details
      let sidePhone = null;
      let sideEmail = null;
      const contactCards = document.querySelectorAll('.contact-card');
      contactCards.forEach(card => {
        const span = card.querySelector('.contact-text-box span');
        const p = card.querySelector('.contact-text-box p');
        if (span && p) {
          if (span.textContent.includes('Call')) sidePhone = p;
          if (span.textContent.includes('Email')) sideEmail = p;
        }
      });
      if (!sidePhone) sidePhone = document.querySelector('.contact-card:nth-child(1) p');
      if (!sideEmail) sideEmail = document.querySelector('.contact-card:nth-child(2) p');

      if (sidePhone) sidePhone.textContent = data.hero.phone;
      if (sideEmail) sideEmail.textContent = data.hero.email;
    }

    // About Section
    if (data.about) {
      const aboutText = document.querySelector('.about-content p');
      const aboutImage = document.querySelector('.about-visual img');
      if (aboutText) aboutText.textContent = data.about.content;
      if (aboutImage && data.about.portrait_image_url) {
        aboutImage.setAttribute('src', resolveImagePath(data.about.portrait_image_url));
      }
    }

    // Expertise Cards & Rows (Kathryn Style)
    if (data.expertise && data.expertise.length > 0) {
      const expertiseGrid = document.querySelector('.expertise-grid');
      const expertiseRowsContainer = document.querySelector('.expertise-rows-container');
      
      if (expertiseGrid) {
        expertiseGrid.innerHTML = ''; // clear static cards
        data.expertise.forEach((item, index) => {
          let serviceId = 'wordpress';
          if (item.title.toLowerCase().includes('ux')) serviceId = 'ui-ux';
          else if (item.title.toLowerCase().includes('graphic')) serviceId = 'graphic-design';
          else if (item.title.toLowerCase().includes('etsy')) serviceId = 'etsy';

          const projLink = window.location.pathname.includes('/portfolio/') ? item.link.replace('portfolio/', '') : item.link;
          const serviceLink = window.location.pathname.includes('/portfolio/') ? `service.html?id=${serviceId}` : `portfolio/service.html?id=${serviceId}`;

          expertiseGrid.innerHTML += `
            <div class="expertise-card reveal reveal-delay-${(index % 3) + 1}">
              <div class="expertise-icon">
                <i class="${item.icon}"></i>
              </div>
              <h3>${item.title}</h3>
              <p>${item.description}</p>
              <div style="display:flex; justify-content:center; gap:15px; margin-top:1.5rem;">
                <a href="${serviceLink}" class="expertise-link" style="margin-top:0">Learn Service <i class="fa-solid fa-arrow-right"></i></a>
                <a href="${projLink}" class="expertise-link" style="margin-top:0">View Projects <i class="fa-solid fa-arrow-right"></i></a>
              </div>
            </div>
          `;
        });
      }

      if (expertiseRowsContainer) {
        expertiseRowsContainer.innerHTML = ''; // clear static rows
        data.expertise.forEach((item, index) => {
          let serviceId = 'wordpress';
          if (item.title.toLowerCase().includes('ux')) serviceId = 'ui-ux';
          else if (item.title.toLowerCase().includes('graphic')) serviceId = 'graphic-design';
          else if (item.title.toLowerCase().includes('etsy')) serviceId = 'etsy';

          const projLink = window.location.pathname.includes('/portfolio/') ? item.link.replace('portfolio/', '') : item.link;
          const serviceLink = window.location.pathname.includes('/portfolio/') ? `service.html?id=${serviceId}` : `portfolio/service.html?id=${serviceId}`;
          const padNum = String(index + 1).padStart(2, '0');

          expertiseRowsContainer.innerHTML += `
            <div class="expertise-row-item reveal reveal-delay-${(index % 3) + 1}" onclick="window.location.href='${projLink}'">
              <div class="expertise-row-left">
                <span class="expertise-row-num">${padNum}</span>
                <h3 class="expertise-row-title">${item.title}</h3>
              </div>
              <div class="expertise-row-right">
                <p class="expertise-row-desc">${item.description}</p>
                <div class="expertise-row-link-circle"><i class="fa-solid fa-arrow-right"></i></div>
              </div>
            </div>
          `;
        });
      }
    }

    // Stats Section
    if (data.stats && data.stats.length > 0) {
      const statsGrid = document.querySelector('.stats-grid');
      const aboutStatsStack = document.querySelector('.about-stats-stack');
      
      if (statsGrid) {
        statsGrid.innerHTML = '';
        data.stats.forEach((stat, index) => {
          statsGrid.innerHTML += `
            <div class="stat-item reveal reveal-delay-${index % 4}">
              <div class="stat-number">${stat.number}</div>
              <div class="stat-label">${stat.label}</div>
            </div>
          `;
        });
      }

      if (aboutStatsStack) {
        aboutStatsStack.innerHTML = '';
        data.stats.forEach((stat, index) => {
          aboutStatsStack.innerHTML += `
            <div class="about-stat-row">
              <span class="about-stat-number">${stat.number}</span>
              <span class="about-stat-label">${stat.label}</span>
            </div>
          `;
        });
      }
    }

    // CTA Band
    if (data.cta) {
      const ctaHeading = document.querySelector('.cta-band h2');
      const ctaDesc = document.querySelector('.cta-band p');
      const ctaBtn = document.querySelector('.cta-band .btn');
      
      if (ctaHeading) ctaHeading.textContent = data.cta.heading;
      if (ctaDesc) ctaDesc.textContent = data.cta.description;
      if (ctaBtn) {
        ctaBtn.textContent = data.cta.button_label;
        ctaBtn.setAttribute('href', data.cta.button_link);
      }
    }
    
    // Featured Projects Previews
    // Featured Projects Previews
    const featuredGrid = document.getElementById('featured-projects-grid');
    if (featuredGrid) {
      try {
        const wpProjects = await window.PortfolioAPI.getProjects('wordpress');
        const uxProjects = await window.PortfolioAPI.getProjects('ui-ux');
        const gdItems = await window.PortfolioAPI.getGallery('graphic-design');
        
        const wpFeatured = wpProjects.filter(p => p.status !== 'draft')[0];
        const uxFeatured = uxProjects.filter(p => p.status !== 'draft')[0];
        const gdFeatured = gdItems[0];
        
        featuredGrid.innerHTML = '';
        
        if (wpFeatured) {
          const img = wpFeatured.images[0] || 'assets/profile-placeholder.svg';
          featuredGrid.innerHTML += renderFeaturedCard('WordPress Development', wpFeatured.title, wpFeatured.description, img, 'portfolio/wordpress.html');
        }
        if (uxFeatured) {
          const img = uxFeatured.images[0] || 'assets/profile-placeholder.svg';
          featuredGrid.innerHTML += renderFeaturedCard('UI/UX Design', uxFeatured.title, uxFeatured.description, img, 'portfolio/ui-ux.html');
        }
        if (gdFeatured) {
          const img = gdFeatured.image || 'assets/profile-placeholder.svg';
          featuredGrid.innerHTML += renderFeaturedCard('Graphic Design', gdFeatured.caption || 'Promotional Banner', 'Branded promotional banner and creative ad layout designed for digital marketing.', img, 'portfolio/graphic-design.html');
        }
      } catch (err) {
        console.error("Error loading featured projects preview", err);
      }
    }
    
    // Re-initialize intersection observers for newly generated elements
    reinitObservers();
  }

  function renderFeaturedCard(category, title, desc, img, link) {
    let mediaHtml = `
      <div class="media-placeholder">
        <div class="media-placeholder-icon">
          <i class="fa-solid fa-image"></i>
        </div>
        <div class="media-placeholder-text">${title}</div>
        <div class="media-placeholder-sub">[Featured ${category} Preview]</div>
      </div>
    `;
    if (img) {
      mediaHtml = `<img src="${resolveImagePath(img)}" alt="${title}" style="width:100%; height:100%; object-fit:cover; border-radius:12px 12px 0 0">`;
    }
    const cleanDesc = desc.replace(/<[^>]*>/g, '');
    return `
      <div class="project-preview-card reveal">
        <div style="aspect-ratio: 16/10; overflow:hidden;">
          ${mediaHtml}
        </div>
        <div class="project-preview-info text-left">
          <div class="project-preview-category">${category}</div>
          <h3 class="project-preview-title">${title}</h3>
          <p class="project-preview-text">${cleanDesc.substring(0, 120)}${cleanDesc.length > 120 ? '...' : ''}</p>
          <a href="${link}" class="expertise-link">Learn More <i class="fa-solid fa-arrow-right"></i></a>
        </div>
      </div>
    `;
  }



  function renderWordPressPage(projects) {
    if (!projects || !wpGridContainer) return;
    
    // Filter only published projects
    const published = projects.filter(p => p.status !== 'draft');
    
    if (published.length === 0) {
      wpGridContainer.innerHTML = '<p class="text-center" style="width:100%; color:var(--text-muted);">No projects published yet.</p>';
      return;
    }

    wpGridContainer.innerHTML = ''; // clear loading/static elements
    published.forEach((project, index) => {
      const imageSrc = project.images && project.images.length > 0 ? project.images[0] : '';
      let mediaHtml = `
        <div class="media-placeholder">
          <div class="media-placeholder-icon"><i class="fa-solid fa-car-side"></i></div>
          <div class="media-placeholder-text">${project.title}</div>
          <div class="media-placeholder-sub">[Project Screenshot: ${project.title}]</div>
        </div>
      `;

      if (imageSrc) {
        mediaHtml = `<img src="${resolveImagePath(imageSrc)}" alt="${project.title} Screen" loading="lazy" style="border-radius:12px; width:100%; border:1px solid var(--border-color)">`;
      }

      const tagsHtml = (project.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
      
      wpGridContainer.innerHTML += `
        <div class="wordpress-card reveal">
          <div class="wordpress-image-wrapper">
            ${mediaHtml}
          </div>
          <div class="wordpress-content">
            <h3>${project.title}</h3>
            <p>${project.description.replace(/<[^>]*>/g, '').substring(0, 150)}${project.description.replace(/<[^>]*>/g, '').length > 150 ? '...' : ''}</p>
            <div class="wordpress-tags">
              ${tagsHtml}
            </div>
            ${project.external_link ? `
              <div style="margin-top:1.5rem; display:flex; gap:10px;">
                <a href="${project.external_link}" target="_blank" class="btn btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.75rem;">Visit Site</a>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });

    reinitObservers();
  }



  function renderUIUXPage(projects) {
    if (!projects || !uiuxGridContainer) return;
    
    const published = projects.filter(p => p.status !== 'draft');
    if (published.length === 0) {
      uiuxGridContainer.innerHTML = '<p class="text-center" style="width:100%; color:var(--text-muted);">No case studies published yet.</p>';
      return;
    }

    uiuxGridContainer.innerHTML = '';
    published.forEach((project, index) => {
      const imageSrc = project.images && project.images.length > 0 ? project.images[0] : '';
      let mediaHtml = `
        <div class="media-placeholder" style="width: 100%; max-width: 800px; aspect-ratio: 16/9;">
          <div class="media-placeholder-icon"><i class="fa-solid fa-mobile-screen-button"></i></div>
          <div class="media-placeholder-text">${project.title}</div>
          <div class="media-placeholder-sub">[Device Mockup: ${project.title} design screenshots]</div>
        </div>
      `;

      if (imageSrc) {
        mediaHtml = `<img src="${resolveImagePath(imageSrc)}" alt="${project.title} mockup" loading="lazy" style="border-radius:12px; width:100%; max-width:800px;">`;
      }

      const tagsHtml = (project.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
      const figmaBtn = project.external_link ? `
        <div>
          <a href="${project.external_link}" target="_blank" class="btn btn-primary">
            <i class="fa-brands fa-figma" style="margin-right: 8px;"></i> View on Figma
          </a>
        </div>
      ` : '';

      uiuxGridContainer.innerHTML += `
        <div class="uiux-card reveal">
          <div class="uiux-mockup-wrapper">
            ${mediaHtml}
          </div>
          <div class="uiux-info">
            <div class="uiux-header-row">
              <div class="uiux-title-group">
                <h2>${project.title}</h2>
                <div class="wordpress-tags" style="margin-top: 0.5rem;">
                  ${tagsHtml}
                </div>
              </div>
              <div style="display:flex; gap:10px;">
                <a href="project.html?id=${project._id}" class="btn btn-secondary" style="padding: 0.5rem 1.2rem; font-size: 0.75rem; border-color:var(--gold-primary); color:var(--gold-primary);">View Case Study</a>
                ${project.external_link ? `
                  <a href="${project.external_link}" target="_blank" class="btn btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.75rem;"><i class="fa-brands fa-figma" style="margin-right:8px;"></i> View on Figma</a>
                ` : ''}
              </div>
            </div>
            <p class="uiux-desc">${project.description.replace(/<[^>]*>/g, '').substring(0, 200)}${project.description.replace(/<[^>]*>/g, '').length > 200 ? '...' : ''}</p>
            
            <div class="uiux-footer-row">
              <span style="font-size: 0.85rem; color: var(--gold-primary); font-weight: 600;"><i class="fa-solid fa-circle-check" style="margin-right: 5px;"></i> Component-based Design</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Case Study &bull; Figma Archive</span>
            </div>
          </div>
        </div>
      `;
    });

    reinitObservers();
  }



  async function renderGraphicDesignPage(items) {
    logDebugStatus('renderGraphicDesignPage started. galleryItems: ' + (items ? items.length : 0));
    if (!gdGridContainer) {
      logDebugStatus('gdGridContainer is NULL! Aborting rendering.');
      return;
    }

    currentGalleryItems = items || [];
    gdGridContainer.innerHTML = '';

    if (currentGalleryItems.length === 0) {
      logDebugStatus('No gallery items found.');
      gdGridContainer.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color:var(--text-muted); font-size:1.1rem; padding:3rem 0;">No projects available yet.</p>';
      return;
    }

    logDebugStatus('Rendering clean gallery items...');
    currentGalleryItems.forEach((item, index) => {
      let imageHtml = `
        <div class="media-placeholder">
          <div class="media-placeholder-icon"><i class="fa-solid fa-image"></i></div>
          <div class="media-placeholder-text">${item.caption || 'Design Creative'}</div>
          <div class="media-placeholder-sub">[Creative Image]</div>
        </div>
      `;

      if (item.image) {
        imageHtml = `<img src="${resolveImagePath(item.image)}" alt="${item.caption || 'Design'}" loading="lazy">`;
      }

      // Span variety for masonry layout
      let spanClass = '';
      if (index % 6 === 0) {
        spanClass = 'span-h2 span-v2';
      } else if (index % 4 === 0) {
        spanClass = 'span-h2';
      } else if (index % 5 === 0) {
        spanClass = 'span-v2';
      }

      gdGridContainer.innerHTML += `
        <div class="gallery-item ${spanClass}" onclick="window.openLightbox(${index})" style="cursor:pointer">
          ${imageHtml}
        </div>
      `;
    });

    logDebugStatus('Gallery items rendered. Reinitializing observers...');
    reinitObservers();
    logDebugStatus('Observers reinitialized. Rendering completed.');
  }



  function renderEtsyPage(items) {
    if (!items || !etsyGridContainer) return;
    
    if (items.length === 0) {
      etsyGridContainer.innerHTML = '<p class="text-center" style="grid-column:1/-1; color:var(--text-muted);">No Etsy templates published yet.</p>';
      return;
    }

    etsyGridContainer.innerHTML = '';
    items.forEach((item, idx) => {
      // Lazy load only items below the fold (index 4 and higher) for faster initial rendering
      const isLazy = idx >= 4;
      // Create a solid image wrapper container to prevent collapsing when image is used
      // and support graceful fallback to the styled placeholder if image fails to load.
      let imageHtml = `
        <div class="etsy-image-container" style="position: relative; aspect-ratio: 16/10; overflow: hidden; border-radius: 12px 12px 0 0;">
          <div class="media-placeholder" style="position: absolute; inset: 0; z-index: 1; border-radius: 0; border: none; aspect-ratio: auto; height: 100%; width: 100%; margin: 0; padding: 1.5rem;">
            <div class="media-placeholder-icon" style="font-size: 2.5rem; margin-bottom: 0.5rem;"><i class="fa-brands fa-etsy"></i></div>
            <div class="media-placeholder-text" style="font-size: 0.75rem; letter-spacing: 1px; max-width: 100%;">${item.caption}</div>
            <div class="media-placeholder-sub" style="font-size: 0.65rem;">[Etsy Canva Template]</div>
          </div>
          ${item.image ? `
            <img src="${resolveImagePath(item.image)}" alt="${item.caption}" 
                 ${isLazy ? 'loading="lazy"' : ''}
                 style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 2; display: block;"
                 onload="this.previousElementSibling.style.display='none';"
                 onerror="this.style.display='none';">
          ` : ''}
        </div>
      `;

      etsyGridContainer.innerHTML += `
        <div class="etsy-card" onclick="window.location.href='project.html?id=${item._id}'" style="cursor:pointer">
          <span class="canva-badge">Canva Editable</span>
          ${imageHtml}
          <div class="etsy-info text-left">
            <h3 class="etsy-title" style="display: flex; justify-content: space-between; align-items: baseline; gap: 10px;">
              <span>${item.caption}</span>
              ${item.price ? `<span style="color: var(--gold-primary); font-size: 0.9rem; font-weight: bold; flex-shrink: 0;">${item.price}</span>` : ''}
            </h3>
            <span class="etsy-category">${item.tag} Template</span>
            <div style="font-size:0.7rem; color:var(--gold-primary); margin-top:5px; font-weight:bold;">View Details &rarr;</div>
          </div>
        </div>
      `;
    });

    reinitObservers();
  }


  // --- 2. TYPEWRITER EFFECT (Hero Section) ---
  const typewriterElement = document.getElementById('typewriter');
  if (typewriterElement) {
    // Fallback phrases
    let roles = [
      'WordPress Developer',
      'UI/UX Designer',
      'Graphic Designer',
      'Etsy Product Designer'
    ];
    
    // Try to load phrases dynamically from seeded home content
    if (homeData && homeData.hero && homeData.hero.subheading_phrases) {
      roles = homeData.hero.subheading_phrases;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      const currentRole = roles[roleIndex];
      if (isDeleting) {
        typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 120;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 500;
      }

      setTimeout(type, typingSpeed);
    }
    setTimeout(type, 1000);
  }

  // --- 3. STICKY HEADER & SCROLL SPY ---
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function handleScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    let scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}` || link.getAttribute('href') === `index.html#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // --- 4. MOBILE MENU TOGGLE ---
  const hamburger = document.getElementById('hamburger-menu');
  const navMenu = document.getElementById('nav-menu-list');
  const dropdownParents = document.querySelectorAll('.dropdown');
  const dropdownToggleBtns = document.querySelectorAll('.dropdown-toggle-btn');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link:not(.dropdown-toggle-btn)').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        dropdownParents.forEach(p => p.classList.remove('active'));
      });
    });

    dropdownToggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (window.innerWidth <= 991) {
          e.preventDefault();
          const parent = btn.closest('.dropdown');
          if (parent) {
            // Close other dropdowns
            dropdownParents.forEach(p => {
              if (p !== parent) {
                p.classList.remove('active');
              }
            });
            parent.classList.toggle('active');
          }
        }
      });
    });
  }

  // Close dropdowns if click is outside the header
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 991 && navMenu && navMenu.classList.contains('active')) {
      const headerEl = document.querySelector('header');
      if (headerEl && !headerEl.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        dropdownParents.forEach(p => p.classList.remove('active'));
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 991 && navMenu && navMenu.classList.contains('active')) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      dropdownParents.forEach(p => p.classList.remove('active'));
    }
  });

  // --- 5. INTERSECTION OBSERVER RE-INIT HELPER ---
  let activeObservers = [];
  function reinitObservers() {
    // Disconnect old observers to prevent duplicates
    activeObservers.forEach(obs => obs.disconnect());
    activeObservers = [];

    const elementsToReveal = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && elementsToReveal.length > 0) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      elementsToReveal.forEach(element => {
        revealObserver.observe(element);
      });
      activeObservers.push(revealObserver);
    } else {
      elementsToReveal.forEach(element => {
        element.classList.add('active');
      });
    }
  }
  reinitObservers();

  // --- 6. GALLERY FILTERING ---
  function setupGalleryFilterLogic() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length > 0 && galleryItems.length > 0) {
      filterBtns.forEach(btn => {
        // Remove previous listeners (clone and replace)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
          const freshBtns = document.querySelectorAll('.filter-btn');
          freshBtns.forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');

          const filterValue = e.target.getAttribute('data-filter');

          galleryItems.forEach(item => {
            const categories = item.getAttribute('data-category').split(' ');
            if (filterValue === 'all' || categories.includes(filterValue)) {
              item.classList.remove('hide');
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
              }, 5);
            } else {
              item.style.opacity = '0';
              item.style.transform = 'scale(0.85)';
              setTimeout(() => {
                item.classList.add('hide');
              }, 250);
            }
          });
        });
      });
    }
  }
  setupGalleryFilterLogic();

  // --- 7. CONTACT FORM HANDLER ---
  const contactForm = document.getElementById('portfolio-contact-form');
  const formStatus = document.getElementById('form-status-msg');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !subject || !message) {
        formStatus.textContent = "Please fill out all fields.";
        formStatus.className = "form-status error";
        return;
      }

      formStatus.textContent = "Sending your message...";
      formStatus.className = "form-status success";
      formStatus.style.color = "var(--gold-primary)";

      const result = await window.PortfolioAPI.submitMessage({ name, email, subject, message });
      
      if (result && result.success) {
        formStatus.textContent = "Thank you! Your message has been sent successfully. I will get back to you shortly.";
        formStatus.className = "form-status success";
        formStatus.style.color = "#2ec4b6";
        contactForm.reset();
      } else {
        formStatus.textContent = "There was an error sending your message. Please try again.";
        formStatus.className = "form-status error";
      }
    });
  }

  // --- 0. INITIALIZE PORTFOLIO DATA & RENDERING ---
  async function init() {
    logDebugStatus('init() function execution started.');
    apiLoaded = false;
    homeData = null;
    siteSettings = null;
    
    if (!window.PortfolioAPI) {
      logDebugStatus('window.PortfolioAPI is undefined! Failed to fetch settings.');
      return;
    }

    // Inject WhatsApp Button on all pages on start
    injectWhatsAppButton();

    try {
      const homeHeroTitle = document.getElementById('hero-title');
      const wpGridContainerEl = document.getElementById('wordpress-projects-container');
      const uiuxGridContainerEl = document.getElementById('uiux-projects-container');
      const gdGridContainerEl = document.getElementById('graphic-design-gallery-container');
      const etsyGridContainerEl = document.getElementById('etsy-gallery-container');
      const projectDetailContainer = document.getElementById('project-detail-container');
      
      const promises = [window.PortfolioAPI.getSettings()];
      let fetchType = ''; // 'home', 'wp', 'uiux', 'gd', 'etsy', 'detail'
      
      if (homeHeroTitle) {
        fetchType = 'home';
        promises.push(window.PortfolioAPI.getHomeContent());
      } else if (wpGridContainerEl) {
        fetchType = 'wp';
        promises.push(window.PortfolioAPI.getProjects('wordpress'));
      } else if (uiuxGridContainerEl) {
        fetchType = 'uiux';
        promises.push(window.PortfolioAPI.getProjects('ui-ux'));
      } else if (gdGridContainerEl) {
        fetchType = 'gd';
        gdGridContainer = gdGridContainerEl;
        promises.push(window.PortfolioAPI.getGallery('graphic-design'));
        promises.push(window.PortfolioAPI.getIntros());
      } else if (etsyGridContainerEl) {
        fetchType = 'etsy';
        etsyGridContainer = etsyGridContainerEl;
        promises.push(window.PortfolioAPI.getGallery('etsy'));
        promises.push(window.PortfolioAPI.getIntros());
      } else if (projectDetailContainer) {
        fetchType = 'detail';
      }
      
      const results = await Promise.all(promises);
      siteSettings = results[0];
      apiLoaded = true;
      updateGlobalSettings(siteSettings);
      
      if (fetchType === 'home') {
        homeData = results[1];
        // Re-inject WhatsApp button to use live phone from settings if modified
        injectWhatsAppButton();
        await renderHomePage(homeData);
      } else if (fetchType === 'wp') {
        wpGridContainer = wpGridContainerEl;
        renderWordPressPage(results[1]);
      } else if (fetchType === 'uiux') {
        uiuxGridContainer = uiuxGridContainerEl;
        renderUIUXPage(results[1]);
      } else if (fetchType === 'gd') {
        const items = results[1];
        const intros = results[2];
        const introPara = document.querySelector('.gallery-intro');
        if (introPara && intros && intros['graphic-design']) {
          introPara.textContent = intros['graphic-design'];
        }
        await renderGraphicDesignPage(items);
      } else if (fetchType === 'etsy') {
        const items = results[1];
        const intros = results[2];
        const introPara = document.querySelector('.gallery-intro');
        if (introPara && intros && intros['etsy']) {
          introPara.textContent = intros['etsy'];
        }
        renderEtsyPage(items);
      } else if (fetchType === 'detail') {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        if (projectId) {
          await renderProjectDetailPage(projectId);
        } else {
          projectDetailContainer.innerHTML = '<div class="text-center py-20"><i class="fa-solid fa-circle-xmark text-4xl text-red-500 mb-4"></i><p style="color:var(--text-muted)">No project ID specified.</p></div>';
        }
      }
    } catch (err) {
      logDebugStatus('Init failure: ' + err.message);
    }

    // G. Service Details Page Loader
    const serviceDetailContainer = document.getElementById('service-detail-container');
    if (serviceDetailContainer && apiLoaded) {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceId = urlParams.get('id');
      if (serviceId) {
        renderServiceDetailPage(serviceId);
      } else {
        serviceDetailContainer.innerHTML = '<div class="text-center py-20"><i class="fa-solid fa-circle-xmark text-4xl text-red-500 mb-4"></i><p style="color:var(--text-muted)">No service ID specified.</p></div>';
      }
    }

    // H. Skill Details Page Loader
    const skillDetailContainer = document.getElementById('skill-detail-container');
    if (skillDetailContainer) {
      const urlParams = new URLSearchParams(window.location.search);
      const skillId = urlParams.get('id');
      if (skillId) {
        await renderSkillDetailPage(skillId);
      } else {
        skillDetailContainer.innerHTML = '<div class="text-center py-20"><i class="fa-solid fa-circle-xmark text-4xl text-red-500 mb-4"></i><p style="color:var(--text-muted)">No skill ID specified.</p></div>';
      }
    }
  }

  // Standard Seeded Projects Metadata Dictionary
  const PROJECT_METADATA = {
    'wp-1': {
      objective: 'Create a high-performing real estate agency web portal targeting luxury listings.',
      role: 'Lead WordPress & Elementor Pro Developer',
      process: 'Figma layout reviews &rarr; Elementor Pro custom skinning &rarr; WP Rocket speed optimizations &rarr; SEO metadata configurations.',
      outcome: 'Ranked in the top 3 spots for key local search terms. Reduced homepage loading time to 1.1 seconds (99% score on Lighthouse).',
      features: ['Custom Elementor layout loops', 'Dynamic filtering system', 'Automated broker lead forwarding']
    },
    'wp-2': {
      objective: 'Build an optimized online booking system for an international dental clinic.',
      role: 'WordPress Developer & UI Designer',
      process: 'Patient booking workflow layout &rarr; Plugin integration &rarr; Form validations &rarr; E-mail notification scheduling.',
      outcome: 'Reduced patient intake form processing time by 40% and improved calendar booking retention by 25%.',
      features: ['Real-time appointment picker', 'Responsive doctor profiles', 'Automated patient booking notifications']
    },
    'wp-3': {
      objective: 'Develop an e-learning platform for digital creators, integrating payment gateways and course tracking.',
      role: 'Full Stack WordPress Specialist',
      process: 'LearnDash LMS configuration &rarr; Stripe / PayPal integration &rarr; Custom dashboard panels &rarr; Mobile responsiveness tuning.',
      outcome: 'Over 1,200 active students registered in the first month with zero checkout drop-offs.',
      features: ['Custom LMS course catalog', 'Interactive quiz module', 'Secure customer checkout system']
    },
    'wp-4': {
      objective: 'Rebrand and launch a fast-loading e-commerce catalog for a custom apparel brand.',
      role: 'WooCommerce Developer',
      process: 'Database catalog migrations &rarr; Custom cart styling &rarr; WP Rocket asset optimization &rarr; checkout flow optimization.',
      outcome: 'Increased mobile transaction rates by 35% due to faster checkout sequences.',
      features: ['One-page dynamic checkout template', 'Advanced product variation attributes', 'Live product stock tracking']
    },
    'ux-1': {
      objective: 'Design a sleek, user-friendly mobile dashboard application for tracking cryptocurrency assets.',
      role: 'Lead UI/UX Designer',
      process: 'User persona research &rarr; Mobile wireframes &rarr; High-fidelity component layouts &rarr; Interactive Figma prototype.',
      outcome: 'Positive user rating of 94% on initial usability testing, praising the dark-mode layout hierarchy.',
      features: ['Live pricing component widget', 'Intuitive wallet transaction flow', 'Unified design tokens library']
    },
    'ux-2': {
      objective: 'Develop wireframes and user flows for a local food delivery app to minimize drop-off rates.',
      role: 'UX Researcher & Prototyper',
      process: 'Competitive study &rarr; User journey wireframing &rarr; Component layouts &rarr; Figma interactive prototype.',
      outcome: 'Optimized booking path from 5 screens to 3, lowering cart abandonment rate by 18%.',
      features: ['Unified checkout screen', 'Live delivery tracking overlay', 'Interactive order feedback state']
    }
  };

  // Helper to dynamically generate rich metadata and description for un-seeded categories (e.g. Graphic Design, Etsy templates)
  function generateProjectMetadata(project, type) {
    const title = project.title || project.caption || "Creative Design";
    const tag = (project.tags && project.tags[0]) || project.tag || "Design";
    
    let objective = "";
    let role = "";
    let process = "";
    let outcome = "";
    let features = [];
    let description = project.description || "";

    const lowerTitle = title.toLowerCase();

    if (type === 'wordpress') {
      role = "Lead WordPress Developer";
      objective = `Design and build a fully customized, high-converting WordPress website for "${title}" using Elementor Pro, focusing on mobile responsiveness and modern layout design.`;
      process = `Wireframe styling &rarr; Elementor container building &rarr; Dynamic product/service loops &rarr; Asset optimization and WP speed tuning.`;
      outcome = `Successfully launched "${title}". Achieved 95+ score on Google Lighthouse, and saw a significant increase in client inquiries within 30 days.`;
      features = [
        "Fully responsive Elementor Pro layout templates",
        "SEO-friendly header hierarchies and metadata config",
        "Integrated custom contact forms and booking logic",
        "Fast page loading speeds with caching optimization"
      ];
    } else if (type === 'ui-ux') {
      role = "UI/UX Designer";
      objective = `Develop intuitive wireframes, high-fidelity layouts, and clickable interactive prototypes in Figma for "${title}", optimizing the user experience journey.`;
      process = `User research & mapping &rarr; Low-fidelity wireframing &rarr; Modern component layout design &rarr; Figma variable states and interactive transitions.`;
      outcome = `Delivered complete Figma design system and high-fidelity screen packages. Received 95% positive feedback during user testing sessions.`;
      features = [
        "High-fidelity interactive prototype links in Figma",
        "Reusable master component libraries and variants",
        "Optimized mobile-responsive grids and layout cards",
        "Detailed user journey mapping and flow validation"
      ];
    } else if (type === 'graphic-design') {
      role = "Graphic Designer";
      if (lowerTitle.includes("logo") || lowerTitle.includes("identity") || lowerTitle.includes("brand")) {
        objective = `Create a premium visual identity system and logo set for "${title}" that reflects modern brand values and ensures scalability across vectors.`;
        process = `Brand research & sketching &rarr; Vector mapping in Adobe Illustrator &rarr; Typography pairing &rarr; Assembling full brand style guide and logo variations.`;
        outcome = `Successfully established a cohesive brand identity kit. Client reported higher brand recognition and standard guidelines alignment.`;
        features = [
          "Scalable master vector logo files (SVG/PDF)",
          "Curated cohesive brand color guidelines",
          "Custom typography pairings and icon kit",
          "Mockup templates for commercial stationery and web"
        ];
        description = `Custom visual identity set and logo design custom-crafted for <strong>${title}</strong>, formatted specifically for print-ready stationery, digital assets, and brand banners. Every graphic element has been optimized for clean, professional vector scaling.`;
      } else if (lowerTitle.includes("banner") || lowerTitle.includes("ad") || lowerTitle.includes("promo") || lowerTitle.includes("flyer")) {
        objective = `Design a high-conversion, scroll-stopping promotional advertisement banner for "${title}" to drive click-through-rates.`;
        process = `Target demographic analysis &rarr; Layout drafting &rarr; Copywriting visual placement &rarr; Designing graphic elements and exporting formats.`;
        outcome = `Delivered platform-ready promo creatives. Customer reported a significant rise in campaign engagement and transactional conversions.`;
        features = [
          `Optimized visual layout for "${tag}" campaigns`,
          "Bold typography and clear call-to-actions",
          "High-contrast color treatments and margins",
          "Optimized resolutions for social platforms"
        ];
        description = `High-impact promotional campaign creative custom-designed for <strong>${title}</strong>, structured to capture audience attention on digital advertising networks and social channels.`;
      } else {
        objective = `Create scroll-stopping, high-converting promotional banners and ad creatives for "${title}" designed for digital marketing channels.`;
        process = `Brand guideline analysis &rarr; Vector shape modeling &rarr; Custom typography and layout hierarchy &rarr; Rendering high-resolution exports (SVG/PNG).`;
        outcome = `Delivered visually stunning, platform-ready graphics. The client reported a substantial rise in social media click-through rates.`;
        features = [
          `Custom ad layouts tailored for "${tag}" campaigns`,
          "Professional typography and visual hierarchies",
          "Crystal-clear high-resolution vector exports",
          "Consistent brand colors and visual styling"
        ];
        description = `Professional graphic design artwork custom-crafted for <strong>${title}</strong>, formatted specifically for high-engagement promotional ads, product banner placements, or visual branding kits. Every layout element is structured around conversion optimization best practices.`;
      }
    } else if (type === 'etsy') {
      if (lowerTitle.includes("flyer")) {
        objective = `Design a professional, easily-customizable real estate or business promotional flyer template for "${title}" sold on Etsy.`;
        process = `Market demand analysis &rarr; Canva layout grid styling &rarr; Integrating stock elements &rarr; Packaging shareable access link.`;
        outcome = `Consistently ranked as a best-seller template on Etsy with positive buyer ratings on ease of layout edits.`;
        features = [
          "100% editable Canva template access link",
          "Standard print resolution sizing (8.5x11 inches)",
          "Drag-and-drop placeholder grids for photos",
          "Clean typography hierarchy and instructions included"
        ];
      } else if (lowerTitle.includes("brochure")) {
        objective = `Create a fully customizable tri-fold or bi-fold marketing brochure template for "${title}" for instant download.`;
        process = `Page layout folding design &rarr; Typography structure planning &rarr; Canva component styling &rarr; Instructions guide packaging.`;
        outcome = `Provided a high-quality print marketing asset. Buyers loved the clean, modern color schemes and easy drag-and-drop layouts.`;
        features = [
          "Canva template shareable access link",
          "Tri-fold layout structure with crop marks",
          "Free commercial fonts and vector elements used",
          "Fully responsive grids for simple layout shifting"
        ];
      } else if (lowerTitle.includes("planner") || lowerTitle.includes("journal")) {
        objective = `Design a premium, hyperlinked digital/printable planner and organizer pages for "${title}" on Canva.`;
        process = `Daily productivity studies &rarr; Grid and chart template design &rarr; Page indexing &rarr; Assembling editable bundle files.`;
        outcome = `Excellent sales feedback from buyers using the planner to organize daily wellness, fitness, or digital tasks.`;
        features = [
          "Fully editable Canva planner template access link",
          "Printable PDF sheets (A4, A5, and US Letter)",
          "Daily, weekly, and monthly goal trackers",
          "Modern minimalist aesthetics for daily journaling"
        ];
      } else {
        objective = `Design a fully editable, premium Canva template for "${title}" sold as a digital download on Etsy, complete with user instructions.`;
        process = `Niche demand analysis &rarr; Canva canvas structuring &rarr; Grid and typography layout styling &rarr; Packaging shareable access links.`;
        outcome = `Successfully listed and sold on Etsy. Customers praised the ease of customization and the clean visual aesthetics.`;
        features = [
          "100% editable Canva template access link",
          `Specifically optimized for "${tag}" business formats`,
          "Includes instruction guide PDF with placeholder tips",
          "Free commercial-use icons and font listings included"
        ];
      }
      description = `Premium Canva-editable digital template for <strong>${title}</strong>. This template is designed as an instant digital download product, allowing small businesses, fitness coaches, planners, or beauty salons to easily customize colors, fonts, shapes, and images inside Canva.`;
    }

    return { objective, role, process, outcome, features, description };
  }

  // Render project detail page view
  async function renderProjectDetailPage(id) {
    const container = document.getElementById('project-detail-container');
    if (!container) return;

    let project = null;
    let type = '';

    try {
      // Search in projects (wordpress / ui-ux)
      if (id.startsWith('wp-')) {
        window.location.replace('wordpress.html');
        return;
      } else if (id.startsWith('ux-')) {
        const ux = await window.PortfolioAPI.getProjects('ui-ux');
        project = ux.find(item => item._id === id);
        type = 'ui-ux';
      } else if (id.startsWith('gd-') || id === 'gd-proj-1') {
        const gdProjects = await window.PortfolioAPI.getProjects('graphic-design');
        project = gdProjects.find(item => item._id === id);
        if (project) {
          type = 'graphic-design';
        } else {
          const gdGallery = await window.PortfolioAPI.getGallery('graphic-design');
          const item = gdGallery.find(item => item._id === id);
          if (item) {
            project = {
              _id: item._id,
              title: item.caption,
              description: 'Professional graphic design creative optimized for promotional campaigns, product banner distributions, and branding kits.',
              images: [item.image],
              tags: [item.tag, 'Graphic Design', 'Brand Design'],
              external_link: 'graphic-design.html'
            };
            type = 'graphic-design';
          }
        }
      } else if (id.startsWith('etsy-')) {
        const et = await window.PortfolioAPI.getGallery('etsy');
        const item = et.find(item => item._id === id);
        if (item) {
          project = {
            _id: item._id,
            title: item.title || item.caption,
            description: item.description || 'Canva editable premium template, fully customizable with brand colors, fonts, and assets.',
            images: item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []),
            tags: [item.tag, 'Canva Editable', 'Etsy Digital'],
            external_link: item.external_link || 'etsy.html',
            price: item.price || ''
          };
          type = 'etsy';
        }
      } else {
        // Fallback lookup for random IDs (such as bulk-uploaded gallery items)
        const gdGallery = await window.PortfolioAPI.getGallery('graphic-design');
        let item = gdGallery.find(item => item._id === id);
        if (item) {
          project = {
            _id: item._id,
            title: item.caption,
            description: 'Professional graphic design creative optimized for promotional campaigns, product banner distributions, and branding kits.',
            images: [item.image],
            tags: [item.tag, 'Graphic Design', 'Brand Design'],
            external_link: 'graphic-design.html'
          };
          type = 'graphic-design';
        } else {
          const etGallery = await window.PortfolioAPI.getGallery('etsy');
          item = etGallery.find(item => item._id === id);
          if (item) {
            project = {
              _id: item._id,
              title: item.title || item.caption,
              description: item.description || 'Canva editable premium template, fully customizable with brand colors, fonts, and assets.',
              images: item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []),
              tags: [item.tag, 'Canva Editable', 'Etsy Digital'],
              external_link: item.external_link || 'etsy.html',
              price: item.price || ''
            };
            type = 'etsy';
          }
        }
      }

      if (!project) {
        container.innerHTML = '<div class="text-center py-20"><i class="fa-solid fa-triangle-exclamation text-4xl text-gold-primary mb-4"></i><p style="color:var(--text-muted)">Project details not found.</p></div>';
        return;
      }

      // Load specific metadata or dynamically generate custom details
      let meta = PROJECT_METADATA[project._id];
      if (!meta) {
        meta = generateProjectMetadata(project, type);
      }
      if (meta.description) {
        project.description = meta.description;
      }

      const imageSrc = project.images && project.images.length > 0 ? project.images[0] : '';
      let imageHtml = `
        <div class="media-placeholder" style="aspect-ratio: 16/10; max-height: 450px;">
          <div class="media-placeholder-icon"><i class="fa-solid fa-image"></i></div>
          <div class="media-placeholder-text">${project.title}</div>
        </div>
      `;
      if (imageSrc) {
        let additionalImagesHtml = '';
        if (project.images && project.images.length > 1) {
          additionalImagesHtml = `
            <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
              ${project.images.map((img, i) => `
                <div style="width: 70px; height: 45px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-color); cursor: pointer; opacity: ${i === 0 ? '1' : '0.6'}; transition: 0.2s;" 
                     onclick="
                       const container = this.closest('.project-detail-grid');
                       container.querySelector('.main-project-img').src = '${resolveImagePath(img)}';
                       this.parentElement.querySelectorAll('div').forEach(el => el.style.opacity = '0.6');
                       this.style.opacity = '1';
                     ">
                  <img src="${resolveImagePath(img)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none';">
                </div>
              `).join('')}
            </div>
          `;
        }

        imageHtml = `
          <div style="position: relative; width: 100%; aspect-ratio: 16/10; max-height: 500px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);">
            <div class="media-placeholder" style="position: absolute; inset: 0; z-index: 1; border: none; aspect-ratio: auto; height: 100%; width: 100%; margin: 0; padding: 2rem;">
              <div class="media-placeholder-icon" style="font-size: 2.5rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-image"></i></div>
              <div class="media-placeholder-text" style="font-size: 0.75rem; letter-spacing: 1px; max-width: 100%;">${project.title}</div>
            </div>
            <img class="main-project-img" src="${resolveImagePath(imageSrc)}" alt="${project.title}" 
                 style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 2; display: block;"
                 onload="this.previousElementSibling.style.display='none';"
                 onerror="this.style.display='none';">
          </div>
          ${additionalImagesHtml}
        `;
      }

      const tagsHtml = (project.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
      const featuresHtml = (meta.features || []).map(f => `<li><i class="fa-solid fa-circle-check" style="color:#2ec4b6; margin-right:8px;"></i> ${f}</li>`).join('');

      let actionBtnHtml = '';
      if (type === 'wordpress' && project.external_link) {
        actionBtnHtml = `<a href="${project.external_link}" target="_blank" class="btn btn-primary" style="width:100%; text-align:center; margin-bottom:10px;">Visit Live Site <i class="fa-solid fa-up-right-from-square" style="margin-left: 8px;"></i></a>`;
      } else if (type === 'ui-ux' && project.external_link) {
        actionBtnHtml = `<a href="${project.external_link}" target="_blank" class="btn btn-primary" style="width:100%; text-align:center; margin-bottom:10px;"><i class="fa-brands fa-figma" style="margin-right:8px;"></i> View on Figma</a>`;
      } else if (type === 'etsy') {
        actionBtnHtml = '';
      } else if (type === 'graphic-design') {
        actionBtnHtml = `<a href="graphic-design.html" class="btn btn-primary" style="width:100%; text-align:center; margin-bottom:10px;"><i class="fa-solid fa-palette" style="margin-right:8px;"></i> View Full Gallery</a>`;
      }

      // View Source mock GitHub button
      const githubUrl = "https://github.com/sarah-yaseen";
      const sourceBtnHtml = type === 'etsy' ? '' : `<a href="${githubUrl}" target="_blank" class="btn btn-secondary" style="width:100%; text-align:center; border-color:var(--gold-primary); color:var(--gold-primary);"><i class="fa-brands fa-github" style="margin-right:8px;"></i> View Source Code</a>`;

      // Back URL mapping
      const backUrls = {
        'wordpress': 'wordpress.html',
        'ui-ux': 'ui-ux.html',
        'graphic-design': 'graphic-design.html',
        'etsy': 'etsy.html'
      };
      const backUrl = backUrls[type] || 'wordpress.html';

      container.innerHTML = `
        <div style="margin-bottom:2rem;">
          <a href="${backUrl}" class="expertise-link" style="font-size:0.85rem;"><i class="fa-solid fa-arrow-left" style="margin-right:8px;"></i> Back to Portfolio</a>
        </div>
        
        <div class="project-detail-grid">
          <div>
            <div style="margin-bottom: 2.5rem;">
              ${imageHtml}
            </div>
            
            <div class="project-body-content">
              <h2>Project Objective</h2>
              <p>${meta.objective}</p>
              
              <h2>My Role & Contribution</h2>
              <p>${meta.role}</p>
              
              <h2>Development & Design Process</h2>
              <p>${meta.process}</p>
              
              <h2>Key Features</h2>
              <ul style="list-style:none; padding-left:0; margin-bottom: 2rem;">
                ${featuresHtml}
              </ul>

              <h2>Results & Outcome</h2>
              <p>${meta.outcome}</p>
              
              <h2>Detailed Description</h2>
              <div>${project.description}</div>
            </div>
          </div>
          
          <div>
            <div class="project-sidebar-card">
              <h3 style="font-size:1.1rem; color:var(--gold-primary); margin-bottom:1.5rem; text-transform:uppercase; letter-spacing:1px;">Project Specifications</h3>
              
              <div class="project-meta-list">
                <div class="project-meta-item">
                  <span class="project-meta-label">Project Title</span>
                  <span class="project-meta-val">${project.title}</span>
                </div>
                <div class="project-meta-item">
                  <span class="project-meta-label">Category</span>
                  <span class="project-meta-val" style="text-transform:uppercase;">${type.replace('-', ' ')}</span>
                </div>
                ${project.price ? `
                <div class="project-meta-item">
                  <span class="project-meta-label">Price</span>
                  <span class="project-meta-val" style="color:var(--gold-primary); font-weight:bold; font-size:1.1rem;">${project.price}</span>
                </div>
                ` : ''}
                <div class="project-meta-item">
                  <span class="project-meta-label">Technologies / Tags</span>
                  <div class="wordpress-tags" style="margin-top: 0.5rem;">
                    ${tagsHtml}
                  </div>
                </div>
              </div>
              
              ${(actionBtnHtml || sourceBtnHtml) ? `
              <div style="display:flex; flex-direction:column; gap:10px; margin-top:2rem;">
                ${actionBtnHtml}
                ${sourceBtnHtml}
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      reinitObservers();
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="text-center py-20"><i class="fa-solid fa-triangle-exclamation text-4xl text-gold-primary mb-4"></i><p style="color:var(--text-muted)">Failed to render project details.</p></div>';
    }
  }

  // Render service detail page view
  function renderServiceDetailPage(id) {
    const container = document.getElementById('service-detail-container');
    if (!container) return;

    const services = {
      'wordpress': {
        title: 'WordPress Development',
        icon: 'fa-brands fa-wordpress',
        desc: 'Custom, high-performing corporate websites, landing pages, and e-commerce stores designed and developed using WordPress & Elementor.',
        benefits: [
          { title: 'Mobile Responsive', text: 'Optimized layouts designed specifically to adapt flawlessly across all smartphone, tablet, and desktop viewports.' },
          { title: 'Speed Optimized', text: 'Clean asset serving, image compression, and cache setups to guarantee fast page loads and lower bounce rates.' },
          { title: 'SEO-Friendly Structure', text: 'Built on clean header structures (H1-H4 hierarchy) with proper meta setups for search engine crawlers.' },
          { title: 'Drag-and-Drop Editor', text: 'Configured fully in Elementor so you can easily update text, banners, and links yourself without writing code.' }
        ],
        steps: [
          { num: '01', title: 'Strategy & Mockup Review', text: 'Analyze client requirements, review Figma layout mockups, and outline structure maps.' },
          { num: '02', title: 'Elementor Page Development', text: 'Configure custom themes, structure sections with Elementor containers, and adapt typography styles.' },
          { num: '03', title: 'SEO & Speed Tuning', text: 'Install SEO plugins, set up schema markup, integrate asset compressor tools, and check GTmetrix performance score.' },
          { num: '04', title: 'Responsive Testing & Handover', text: 'Conduct multi-device QA testing and provide a recorded screen walkthrough explaining dashboard management.' }
        ],
        deliverables: ['Custom Elementor Website', 'Full responsive adaptation layout', 'Basic SEO setup & configurations', 'User walkthrough video guide'],
        portfolioLink: 'wordpress.html'
      },
      'ui-ux': {
        title: 'UI/UX Interface Design',
        icon: 'fa-brands fa-figma',
        desc: 'User-centric wireframes, high-fidelity UI layout designs, and interactive web/app prototypes designed in Figma.',
        benefits: [
          { title: 'Interactive Prototypes', text: 'Simulate user actions with dynamic frame animations so you can experience user flows before writing code.' },
          { title: 'Component Libraries', text: 'Built with unified Figma variables, auto layouts, and master components for easy developer handover.' },
          { title: 'User-Centric Architecture', text: 'Information structures planned around user target demographics to maximize conversion rate.' },
          { title: 'Clean Modern Aesthetics', text: 'Premium visual treatments (curated color maps, spacing scales, modern typography hierarchy).' }
        ],
        steps: [
          { num: '01', title: 'Discovery & Competitor Analysis', text: 'Align with client on app goals, user flows, and research competitor design systems.' },
          { num: '02', title: 'Low-fidelity Wireframing', text: 'Outline page structures and structural blocks to define data architecture before visual treatments.' },
          { num: '03', title: 'High-fidelity UI Screens', text: 'Design unified pages with final colors, icon kits, imagery, and interactive states.' },
          { num: '04', title: 'Figma Prototyping & Developer Handover', text: 'Build page connections, set up variable components, and share developer files.' }
        ],
        deliverables: ['Figma UI source files', 'High-fidelity interactive prototype', 'Component design system guide', 'User flow structure charts'],
        portfolioLink: 'ui-ux.html'
      },
      'graphic-design': {
        title: 'Graphic Designing',
        icon: 'fa-solid fa-palette',
        desc: 'Attention-grabbing social campaign banners, ad creatives, visual kits, and digital identity branding designed to drive marketing conversions.',
        benefits: [
          { title: 'Conversion Optimized', text: 'Banners formatted with clear visual hierarchies and readable fonts to drive higher click-through-rates.' },
          { title: 'Cohesive Branding', text: 'Graphic elements structured around unified color maps to reinforce brand recognition.' },
          { title: 'Social Platform Ready', text: 'Visual items customized to exact resolutions required by Facebook, Instagram, LinkedIn, and Web Ads.' },
          { title: 'High-Quality Outputs', text: 'All design outputs rendered in crystal-clear vector formats (SVG, PNG, print-ready PDF).' }
        ],
        steps: [
          { num: '01', title: 'Brand Brief Analysis', text: 'Define the design goals, target audience, color palettes, and copywriting scripts.' },
          { num: '02', title: 'Layout Drafting', text: 'Create initial layout structures to balance visual weight, logo placement, and typography size.' },
          { num: '03', title: 'Visual Rendering', text: 'Incorporate high-quality vectors, branding assets, custom illustrations, and color treatments.' },
          { num: '04', title: 'Multi-resolution Delivery', text: 'Deliver design packages in required dimensions and high-resolution export formats.' }
        ],
        deliverables: ['High-resolution Social Ads (JPG/PNG)', 'Vector logos & icons (SVG)', 'Print-ready branding materials', 'Custom Canva/Illustrator source files'],
        portfolioLink: 'graphic-design.html'
      },
      'seo': {
        title: 'Search Engine Optimization (SEO)',
        icon: 'fa-solid fa-magnifying-glass',
        desc: 'Strategic optimization of on-page structures, keyword targeting, metadata, and core web vitals to scale search rankings.',
        benefits: [
          { title: 'Organic Traffic Scaling', text: 'Increase site visibility on Google to capture buyer intent organically without paying for ads.' },
          { title: 'Speed & UX Tuning', text: 'Resolve loading delays, structure heading hierarchies, and set up schema properties.' },
          { title: 'Targeted Keywords', text: 'Research niche queries with high search volumes and low ranking difficulties.' },
          { title: 'Local Directory SEO', text: 'Tune local Google Maps profiles and directory indexes to drive offline store visits.' }
        ],
        steps: [
          { num: '01', title: 'Technical Site Audit', text: 'Scan search index status, crawl errors, page response speeds, and mobile compatibility.' },
          { num: '02', title: 'Keyword Research', text: 'Evaluate industry query terms and map target landing pages to specific keywords.' },
          { num: '03', title: 'On-Page Optimization', text: 'Structure metadata description tags, H1-H3 header hierarchies, image alt attributes, and clean URL slugs.' },
          { num: '04', title: 'Index Submission & Analytics', text: 'Configure Google Search Console maps, build XML sitemaps, and set up tracking analytics.' }
        ],
        deliverables: ['SEO Site Audit Report', 'Target Keyword Map Spreadsheet', 'Optimized Metadata implementation', 'Google Analytics setup & dashboard'],
        portfolioLink: 'wordpress.html'
      },
      'content-writing': {
        title: 'Content Writing',
        icon: 'fa-solid fa-pen-nib',
        desc: 'SEO-driven blog posts, high-converting copy, and professional brand guidelines designed to communicate brand value.',
        benefits: [
          { title: 'Engaging & Authentic', text: 'Articles written with professional, conversational tones customized to address customer pain points.' },
          { title: 'SEO Optimized', text: 'Content naturally integrates target keywords in headers and body text without keyword stuffing.' },
          { title: 'Clear CTA Directions', text: 'Copy structured to guide readers to contact pages, newsletters, or digital store checkout pages.' },
          { title: 'Error-Free Copy', text: 'All drafts undergo structured spellchecking, formatting edits, and plagiarism scans.' }
        ],
        steps: [
          { num: '01', title: 'Topic & Outline Alignment', text: 'Identify search volume trends and design an article outline detailing key takeaways.' },
          { num: '02', title: 'Draft Research & Copywriting', text: 'Research reputable sources, write unique content pieces, and structure with headers.' },
          { num: '03', title: 'Formatting & SEO check', text: 'Format paragraphs for fast scanning, insert targeted bullet points, and check keyword frequency.' },
          { num: '04', title: 'Editing & Delivery', text: 'Perform readability edits and package final documents in clean Markdown or Google Docs.' }
        ],
        deliverables: ['SEO-Optimized blog posts (Markdown/Doc)', 'Competitor content outline notes', 'Branded social copy templates', 'Stock imagery suggestion lists'],
        portfolioLink: 'wordpress.html'
      },
      'video-editing': {
        title: 'Video Editing',
        icon: 'fa-solid fa-video',
        desc: 'High-quality promotional reels, YouTube ads, and product showcase clips edited to capture social attention.',
        benefits: [
          { title: 'Scroll-Stopping Hooks', text: 'Initial 3-second segments optimized with fast cuts and visual cues to maximize retention.' },
          { title: 'Dynamic Captions', text: 'Subtitles synced dynamically to match voiceovers, formatted for silent social feeds.' },
          { title: 'Sound Design & Mixing', text: 'Sync licensing audio tracks, apply crisp sound effects, and clean dialog tracks.' },
          { title: 'Color Grading', text: 'Apply professional LUT sets and color corrections to match brand colors.' }
        ],
        steps: [
          { num: '01', title: 'Footage Organization & Scripting', text: 'Ingest raw video layers, review audio voiceovers, and write an edit timeline script.' },
          { num: '02', title: 'Rough Cut Timeline assembly', text: 'Sequence clips, align pacing to background tracks, and remove pauses.' },
          { num: '03', title: 'Captions & Motion Graphics', text: 'Insert text overlays, sync dynamic transitions, and add visual branding elements.' },
          { num: '04', title: 'Color Grading & Final Master', text: 'Color-correct lighting variations, apply sound leveling, and render high-res formats.' }
        ],
        deliverables: ['1080x1920 Social Reels (MP4)', '16:9 Landscape YouTube Ads (MP4)', 'Sync sound effects package', 'Final color-graded master source'],
        portfolioLink: 'graphic-design.html'
      },
      'etsy': {
        title: 'Etsy Digital Products',
        icon: 'fa-brands fa-etsy',
        desc: 'Canva editable digital products (brochures, flyers, Instagram stories, Planners) structured for small businesses and creators.',
        benefits: [
          { title: 'Fully Editable in Canva', text: 'Templates built with standard Canva elements so buyers can easily edit colors, text, and images.' },
          { title: 'High Etsy Buyer Appeal', text: 'Styled layout designs tailored to address high-demand niches (Real Estate, Fitness, Beauty, Planners).' },
          { title: 'Ready-to-Sell Packaging', text: 'Templates delivered with instruction PDF templates and display graphics ready for Etsy upload.' },
          { title: 'Passive Revenue assets', text: 'Product bundles designed to establish digital shop portfolios for steady template sales.' }
        ],
        steps: [
          { num: '01', title: 'Market Research', text: 'Analyze high-volume search queries and popular product boards on Etsy to identify template needs.' },
          { num: '02', title: 'Canva Template Layout', text: 'Structure professional page layouts using grids, color systems, and modern font choices.' },
          { num: '03', title: 'Mockup Generation', text: 'Generate eye-catching display slides and promo graphics to display the template inside shop listings.' },
          { num: '04', title: 'Delivery Package Assembly', text: 'Assemble share link access sheets, instruction notes, and PDF delivery resources.' }
        ],
        deliverables: ['Canva Shareable template access link', 'Product Listing mockups', 'Buyer Guide & Instructions PDF', 'Marketing promotional banner set'],
        portfolioLink: 'etsy.html'
      }
    };

    const service = services[id];
    if (!service) {
      container.innerHTML = '<div class="text-center py-20"><i class="fa-solid fa-triangle-exclamation text-4xl text-gold-primary mb-4"></i><p style="color:var(--text-muted)">Service details not found.</p></div>';
      return;
    }

    const benefitsHtml = service.benefits.map(b => `
      <div class="benefit-card">
        <h4>${b.title}</h4>
        <p style="font-size:0.85rem; line-height:1.6; color:var(--text-muted);">${b.text}</p>
      </div>
    `).join('');

    const stepsHtml = service.steps.map(s => `
      <div class="process-step">
        <h4 style="font-weight:bold; color:var(--text-primary);"><span style="color:var(--gold-primary); margin-right:8px; font-weight:850;">${s.num}</span> ${s.title}</h4>
        <p style="font-size:0.85rem; line-height:1.6; color:var(--text-muted); margin-top:0.35rem;">${s.text}</p>
      </div>
    `).join('');

    const deliverablesHtml = service.deliverables.map(d => `
      <div class="deliverable-item">
        <i class="fa-solid fa-circle-check"></i>
        <span>${d}</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="service-details-container animate-fade-in">
        <div style="margin-bottom:2rem;">
          <a href="../index.html" class="expertise-link" style="font-size:0.85rem;"><i class="fa-solid fa-arrow-left" style="margin-right:8px;"></i> Back to Home</a>
        </div>

        <div class="service-title-section">
          <i class="${service.icon} service-icon-large"></i>
          <div>
            <h1 style="font-size:2.2rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin:0;">${service.title}</h1>
            <p style="color:var(--text-muted); font-size:1rem; margin-top:0.5rem; line-height:1.5;">${service.desc}</p>
          </div>
        </div>

        <div class="service-block">
          <h3><i class="fa-solid fa-circle-plus"></i> Service Key Benefits</h3>
          <div class="benefits-grid">
            ${benefitsHtml}
          </div>
        </div>

        <div class="service-block">
          <h3><i class="fa-solid fa-circle-nodes"></i> Development & Design Process</h3>
          <div class="process-timeline">
            ${stepsHtml}
          </div>
        </div>

        <div class="service-block">
          <h3><i class="fa-solid fa-box-archive"></i> Package Deliverables</h3>
          <div class="deliverables-list">
            ${deliverablesHtml}
          </div>
        </div>

        <div class="service-actions">
          <a href="../contact.html" class="btn btn-primary" style="padding:0.75rem 2rem;">Hire For This Service</a>
          <a href="${service.portfolioLink}" class="btn btn-secondary" style="padding:0.75rem 2rem; border-color:var(--gold-primary); color:var(--gold-primary);">Browse Portfolio Projects</a>
        </div>
      </div>
    `;

    reinitObservers();
  }

  // Render skill detail page view
  async function renderSkillDetailPage(id) {
    const container = document.getElementById('skill-detail-container');
    if (!container) return;

    const skills = {
      'wordpress': {
        title: 'WordPress Development (Elementor)',
        desc: 'Advanced page building, template design, e-commerce configurations, database optimization, and plugin customizations.',
        tools: ['Elementor Pro', 'WooCommerce', 'WP Rocket', 'RankMath SEO', 'Advanced Custom Fields', 'MySQL'],
        experience: 'Designed and engineered over 10 business portals, including online doctor appointment portals, LMS e-learning checkouts, and custom WooCommerce configurations.',
        linkedService: 'wordpress',
        projectsCategory: 'wordpress'
      },
      'ui-ux': {
        title: 'UI/UX Interface Design (Figma)',
        desc: 'Development of user flows, mobile and web wireframing structures, variable design systems, high-fidelity UI visual styles, and clickable interactive prototypes.',
        tools: ['Figma', 'FigJam', 'Adobe Photoshop', 'UI Style Guides', 'Prototyping Variables'],
        experience: 'Designed full mobile dashboard prototypes for crypto asset trackers, food delivery apps, and SaaS admin panels.',
        linkedService: 'ui-ux',
        projectsCategory: 'ui-ux'
      },
      'graphic-design': {
        title: 'Graphic Designing (Canva/Adobe)',
        desc: 'Visual campaign asset creation, high-conversion social promotion creatives, branded banners, and print-ready brochures.',
        tools: ['Canva Pro', 'Adobe Illustrator', 'Adobe Photoshop', 'Vector Graphics', 'Branding Kits'],
        experience: 'Crafted 30+ campaign grids, vector logos, and social ads for regional digital agencies and small businesses.',
        linkedService: 'graphic-design',
        projectsCategory: 'graphic-design'
      },
      'front-end': {
        title: 'HTML5, CSS3, ES6 JavaScript',
        desc: 'Clean frontend web scripting using semantic HTML layout models, responsive grid systems, dynamic DOM animations, and REST API fetch pipelines.',
        tools: ['HTML5 Semantic Markup', 'CSS3 Transitions', 'ES6 JavaScript', 'jQuery', 'REST API integrations'],
        experience: 'Coded customized Elementor layout components, CSS visual animations, and direct AJAX contact submit handlers.',
        linkedService: 'wordpress',
        projectsCategory: 'wordpress'
      },
      'seo': {
        title: 'Search Engine Optimization (SEO) & SMM',
        desc: 'Tuning organic keywords, technical site structure layouts, metadata index properties, page speed vitals, and social campaign strategies.',
        tools: ['Google Analytics', 'Google Search Console', 'RankMath Pro', 'SEMrush Keyword Tool', 'Page Speed Insights'],
        experience: 'Analyzed site crawlers, set up JSON-LD schema properties, and optimized sites to load under 1.5 seconds, boosting organic keyword positions.',
        linkedService: 'seo',
        projectsCategory: 'wordpress'
      }
    };

    const skill = skills[id];
    if (!skill) {
      container.innerHTML = '<div class="text-center py-20"><i class="fa-solid fa-triangle-exclamation text-4xl text-gold-primary mb-4"></i><p style="color:var(--text-muted)">Skill details not found.</p></div>';
      return;
    }

    const toolsHtml = skill.tools.map(t => `<span class="tool-badge"><i class="fa-solid fa-gear" style="color:var(--gold-primary); margin-right:6px;"></i> ${t}</span>`).join('');
    
    // Fetch associated projects
    let relatedProjectsHtml = '<p style="color:var(--text-muted); font-size:0.9rem;">Loading related projects...</p>';
    try {
      let items = [];
      if (skill.projectsCategory === 'wordpress' || skill.projectsCategory === 'ui-ux') {
        items = await window.PortfolioAPI.getProjects(skill.projectsCategory);
      } else {
        items = await window.PortfolioAPI.getGallery(skill.projectsCategory);
      }
      
      if (items && items.length > 0) {
        relatedProjectsHtml = items.slice(0, 4).map(p => `
          <div class="mini-project-card animate-fade-in" onclick="window.location.href='project.html?id=${p._id}'">
            <h4>${p.title || p.caption}</h4>
            <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.5; margin-top:0.25rem;">${(p.description || 'Creative asset item.').substring(0, 90)}...</p>
            <div style="font-size:0.75rem; color:var(--gold-primary); margin-top:0.75rem; font-weight:bold;">View Details &rarr;</div>
          </div>
        `).join('');
      } else {
        relatedProjectsHtml = '<p style="color:var(--text-muted)">No active projects found under this skill area.</p>';
      }
    } catch (e) {
      relatedProjectsHtml = '<p style="color:var(--text-muted)">Failed to load related projects.</p>';
    }

    container.innerHTML = `
      <div class="skill-details-container">
        <div style="margin-bottom:2rem;">
          <a href="../about.html" class="expertise-link" style="font-size:0.85rem;"><i class="fa-solid fa-arrow-left" style="margin-right:8px;"></i> Back to About</a>
        </div>

        <div class="skill-title-section">
          <h1 style="font-size:2.2rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin:0;">${skill.title}</h1>
        </div>

        <div class="skill-meta-grid">
          <div>
            <h3 style="font-size:1.1rem; color:var(--gold-primary); margin-bottom:1rem; text-transform:uppercase; letter-spacing:1px;">Skill Description</h3>
            <p style="font-size:0.95rem; line-height:1.7; margin-bottom:2.5rem;">${skill.desc}</p>

            <h3 style="font-size:1.1rem; color:var(--gold-primary); margin-bottom:1rem; text-transform:uppercase; letter-spacing:1px;">Experience & Work Performed</h3>
            <div class="skill-experience-card">
              <p style="font-size:0.9rem; line-height:1.6; color:var(--text-primary); margin:0;">${skill.experience}</p>
            </div>
          </div>

          <div>
            <h3 style="font-size:1.1rem; color:var(--gold-primary); margin-bottom:1rem; text-transform:uppercase; letter-spacing:1px;">Software & Toolset</h3>
            <div class="tools-list">
              ${toolsHtml}
            </div>

            <div style="margin-top:3rem; border-top: 1px solid var(--border-color); padding-top:2rem;">
              <h4 style="font-size:0.9rem; color:var(--text-muted); margin-bottom:0.75rem; text-transform:uppercase;">Relevant Services</h4>
              <a href="service.html?id=${skill.linkedService}" class="btn btn-primary" style="padding:0.5rem 1.2rem; font-size:0.8rem; display:inline-block; text-align:center;">Learn Associated Service</a>
            </div>
          </div>
        </div>

        <div style="border-top:1px solid var(--border-color); padding-top:3rem; margin-top:3rem; margin-bottom:4rem;">
          <h3 style="font-size:1.15rem; color:var(--gold-primary); margin-bottom:1.5rem; text-transform:uppercase; letter-spacing:1px;">Related Work & Projects</h3>
          <div class="skill-projects-grid">
            ${relatedProjectsHtml}
          </div>
        </div>
      </div>
    `;

    reinitObservers();
  }

  // --- LIGHTBOX INTERACTIVE VIEWER ---
  let activeLightboxIndex = 0;
  let currentGalleryItems = [];

  window.openLightbox = (index) => {
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    if (!lightboxOverlay || !lightboxImg || !lightboxCaption || !currentGalleryItems[index]) return;
    
    activeLightboxIndex = index;
    const item = currentGalleryItems[index];
    
    lightboxImg.src = resolveImagePath(item.image);
    lightboxImg.alt = item.caption;
    lightboxCaption.textContent = '';
    
    lightboxOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent body scrolling
  };

  window.navigateLightbox = (direction) => {
    let nextIdx = activeLightboxIndex + direction;
    if (nextIdx < 0) nextIdx = currentGalleryItems.length - 1;
    if (nextIdx >= currentGalleryItems.length) nextIdx = 0;
    
    window.openLightbox(nextIdx);
  };

  window.closeLightbox = () => {
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    if (lightboxOverlay) {
      lightboxOverlay.classList.remove('active');
      document.body.style.overflow = ''; // Restore body scrolling
    }
  };

  // Bind Lightbox Event Listeners
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const overlay = document.getElementById('lightbox-overlay');

  if (closeBtn) closeBtn.addEventListener('click', window.closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => window.navigateLightbox(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => window.navigateLightbox(1));
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) window.closeLightbox();
    });
  }
  
  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('lightbox-overlay');
    if (!overlay || !overlay.classList.contains('active')) return;
    if (e.key === 'Escape') window.closeLightbox();
    if (e.key === 'ArrowLeft') window.navigateLightbox(-1);
    if (e.key === 'ArrowRight') window.navigateLightbox(1);
  });

  // Helper to format/retrieve WhatsApp Link based on configured phone
  function getWhatsAppLink() {
    let rawPhone = "0335 7423475"; // default fallback
    if (homeData && homeData.hero && homeData.hero.phone) {
      rawPhone = homeData.hero.phone;
    }
    // Clean all non-digit characters
    const cleanPhone = rawPhone.replace(/\D/g, '');
    // If it starts with 0, replace with 92 (Pakistan country code)
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '92' + cleanPhone.substring(1);
    }
    return `https://wa.me/${formattedPhone}`;
  }

  // Inject Floating WhatsApp Button dynamically on all pages
  function injectWhatsAppButton() {
    if (document.querySelector('.whatsapp-float')) {
      document.querySelector('.whatsapp-float').href = getWhatsAppLink();
      return;
    }
    const waBtn = document.createElement('a');
    waBtn.href = getWhatsAppLink();
    waBtn.target = "_blank";
    waBtn.className = "whatsapp-float animate-fade-in";
    waBtn.setAttribute('aria-label', 'Contact on WhatsApp');
    waBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
    document.body.appendChild(waBtn);
  }

  // Execute initialization
  await init();
});
