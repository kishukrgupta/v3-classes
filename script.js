/* ============================================
   V3 CLASSES — Premium Interactions & Animations
   ============================================ */

(function () {
  'use strict';

  // ── PRELOADER ──
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.remove(), 600);
      }, 800);
    }
  });

  // ── NAVBAR — Sticky + Glass Effect ──
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.navbar__link, .mobile-menu__link');
  const sections = document.querySelectorAll('section[id]');

  function handleScroll() {
    // Navbar background
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top visibility
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }

    // Active section highlighting
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href.substring(1) === currentSection) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ── MOBILE MENU ──
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', mobileMenu.classList.contains('active'));
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── BACK TO TOP ──
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── HERO SLIDESHOW — Ken Burns + Crossfade ──
  const slides = document.querySelectorAll('.hero__slide');
  let currentSlide = 0;
  const slideInterval = 5000;

  function nextSlide() {
    if (slides.length <= 1) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }

  if (slides.length > 1) {
    setInterval(nextSlide, slideInterval);
  }

  // ── SCROLL REVEAL ANIMATIONS ──
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ── ANIMATED COUNTERS ──
  const counters = document.querySelectorAll('.stat__number[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '+';
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = current.toLocaleString('en-IN') + (progress >= 1 ? suffix : '');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ── FAQ ACCORDION ──
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-item__question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('active');
        const btn = i.querySelector('.faq-item__question');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── TESTIMONIAL SLIDER ──
  const testimonialTrack = document.getElementById('testimonialTrack');
  const testimonialDots = document.getElementById('testimonialDots');

  if (testimonialTrack) {
    const cards = testimonialTrack.querySelectorAll('.testimonial-card');
    let currentTestimonial = 0;
    let cardsPerView = getCardsPerView();

    function getCardsPerView() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    const totalPages = Math.ceil(cards.length / cardsPerView);

    // Create dots
    if (testimonialDots) {
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.classList.add('testimonials__dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to testimonial page ${i + 1}`);
        dot.addEventListener('click', () => goToTestimonial(i));
        testimonialDots.appendChild(dot);
      }
    }

    function goToTestimonial(index) {
      currentTestimonial = index;
      const cardWidth = cards[0].offsetWidth + 16; // card width + gap
      const offset = -index * cardsPerView * cardWidth;
      testimonialTrack.style.transform = `translateX(${offset}px)`;

      // Update dots
      const dots = testimonialDots.querySelectorAll('.testimonials__dot');
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
      });
    }

    // Auto-advance testimonials
    setInterval(() => {
      const next = (currentTestimonial + 1) % totalPages;
      goToTestimonial(next);
    }, 6000);

    // Recalc on resize
    window.addEventListener('resize', () => {
      cardsPerView = getCardsPerView();
      goToTestimonial(0);
    });
  }

  // ── GALLERY FILTER ──
  const galleryFilters = document.querySelectorAll('.gallery__filter');
  const galleryItems = document.querySelectorAll('.gallery__item');

  galleryFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.filter;

      galleryFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');

      galleryItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.style.display = '';
          item.style.opacity = '0';
          requestAnimationFrame(() => {
            item.style.transition = 'opacity 0.4s ease';
            item.style.opacity = '1';
          });
        } else {
          item.style.opacity = '0';
          setTimeout(() => {
            item.style.display = 'none';
          }, 400);
        }
      });
    });
  });

  // ── RESULTS FILTER ──
  const resultsFilters = document.querySelectorAll('.results__filter');
  const topperCards = document.querySelectorAll('.topper-card');

  resultsFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.filter;

      resultsFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');

      topperCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = '';
          card.style.opacity = '0';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease';
            card.style.opacity = '1';
          });
        } else {
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.display = 'none';
          }, 400);
        }
      });
    });
  });

  // ── LIGHTBOX ──
  const galleryImages = [];
  document.querySelectorAll('.gallery__item img').forEach(img => {
    galleryImages.push(img.src);
  });

  let currentLightboxIndex = 0;

  window.openLightbox = function (index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    if (!lightbox || !lightboxImg) return;

    currentLightboxIndex = index;
    lightboxImg.src = galleryImages[index];
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeLightbox = function () {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  window.changeLightboxSlide = function (direction) {
    currentLightboxIndex = (currentLightboxIndex + direction + galleryImages.length) % galleryImages.length;
    const lightboxImg = document.getElementById('lightboxImg');
    if (lightboxImg) {
      lightboxImg.style.opacity = '0';
      setTimeout(() => {
        lightboxImg.src = galleryImages[currentLightboxIndex];
        lightboxImg.style.opacity = '1';
      }, 200);
    }
  };

  // Close lightbox on background click
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') changeLightboxSlide(-1);
      if (e.key === 'ArrowRight') changeLightboxSlide(1);
    });
  }

  // ── BUTTON RIPPLE EFFECT ──
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // ── SMOOTH SCROLL for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 72;
        const targetPosition = target.offsetTop - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── API CONFIGURATION ──
  const V3_API_BASE = window.V3_API_BASE || 'http://localhost:5000/api';

  // ── FORM SUBMISSION HANDLER ──
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const studentName = formData.get('studentName');
      const phone = formData.get('phone');
      const courseInterest = formData.get('courseInterest');
      const message = formData.get('message') || '';
      const email = formData.get('email') || '';

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Submitting...';

      // 1. Save to backend database
      let savedToDb = false;
      try {
        const res = await fetch(`${V3_API_BASE}/enquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: studentName,
            phone: phone,
            email: email,
            course: courseInterest,
            message: message,
            source: 'WEBSITE',
          }),
        });
        if (res.ok) savedToDb = true;
      } catch (err) {
        // API unavailable — will still send to WhatsApp
        console.warn('V3 API unavailable, falling back to WhatsApp only.');
      }

      // 2. Also open WhatsApp as secondary action
      const waMessage = `Hello V3 Classes!%0A%0A*New Admission Inquiry*%0A%0AStudent: ${encodeURIComponent(studentName)}%0APhone: ${encodeURIComponent(phone)}%0ACourse: ${encodeURIComponent(courseInterest)}%0AMessage: ${encodeURIComponent(message)}`;
      window.open(`https://wa.me/919386851441?text=${waMessage}`, '_blank');

      // 3. Show success feedback
      submitBtn.innerHTML = savedToDb ? '✓ Inquiry Submitted!' : '✓ Sent to WhatsApp!';
      submitBtn.style.background = '#10B981';

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        this.reset();
      }, 3000);
    });
  }

  // ── PARALLAX on Hero (subtle) ──
  const heroContent = document.querySelector('.hero__content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.6;
      }
    }, { passive: true });
  }

  // ── TEXT REVEAL on Hero Title ──
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    heroTitle.style.opacity = '0';

    setTimeout(() => {
      heroTitle.style.transition = 'opacity 1s ease';
      heroTitle.style.opacity = '1';
    }, 500);
  }

  // ── Hero Badge animation on load ──
  const heroBadge = document.querySelector('.hero__badge');
  if (heroBadge) {
    heroBadge.style.opacity = '0';
    heroBadge.style.transform = 'translateY(20px)';

    setTimeout(() => {
      heroBadge.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      heroBadge.style.opacity = '1';
      heroBadge.style.transform = 'translateY(0)';
    }, 300);
  }

  // ── Hero Subtitle + Actions staggered reveal ──
  const heroSubtitle = document.querySelector('.hero__subtitle');
  const heroActions = document.querySelector('.hero__actions');

  if (heroSubtitle) {
    heroSubtitle.style.opacity = '0';
    heroSubtitle.style.transform = 'translateY(20px)';
    setTimeout(() => {
      heroSubtitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      heroSubtitle.style.opacity = '1';
      heroSubtitle.style.transform = 'translateY(0)';
    }, 800);
  }

  if (heroActions) {
    heroActions.style.opacity = '0';
    heroActions.style.transform = 'translateY(20px)';
    setTimeout(() => {
      heroActions.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      heroActions.style.opacity = '1';
      heroActions.style.transform = 'translateY(0)';
    }, 1100);
  }

  // ── Lightbox image transition ──
  const lightboxImg = document.getElementById('lightboxImg');
  if (lightboxImg) {
    lightboxImg.style.transition = 'opacity 0.2s ease';
  }

})();
