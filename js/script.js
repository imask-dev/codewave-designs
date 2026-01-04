/**
 * CodeWave Designs - Main JavaScript File
 * Features: Animations, Form Validation, Mobile Menu, Event Tracking
 * Last Updated: 2026-01-04
 */

// ============================================================================
// 1. EVENT TRACKING & ANALYTICS
// ============================================================================

const Analytics = {
  /**
   * Initialize analytics tracking
   */
  init() {
    this.trackPageView();
    this.trackUserInteractions();
  },

  /**
   * Track page view event
   */
  trackPageView() {
    const pageData = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      referrer: document.referrer
    };
    console.log('📊 Page View:', pageData);
    this.sendEvent('pageview', pageData);
  },

  /**
   * Track button clicks and links
   */
  trackUserInteractions() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (target) {
        const eventData = {
          element: target.tagName,
          text: target.textContent.trim(),
          href: target.href || null,
          id: target.id,
          class: target.className,
          timestamp: new Date().toISOString()
        };
        console.log('🖱️ User Interaction:', eventData);
        this.sendEvent('click', eventData);
      }
    });
  },

  /**
   * Track form submissions
   */
  trackFormSubmit(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.addEventListener('submit', (e) => {
        const eventData = {
          formId: formId,
          formName: form.name,
          timestamp: new Date().toISOString(),
          fields: this.getFormFieldNames(form)
        };
        console.log('📝 Form Submission:', eventData);
        this.sendEvent('form_submit', eventData);
      });
    }
  },

  /**
   * Get all field names from a form
   */
  getFormFieldNames(form) {
    return Array.from(form.elements)
      .filter(el => el.name)
      .map(el => ({
        name: el.name,
        type: el.type
      }));
  },

  /**
   * Track scroll events
   */
  trackScroll() {
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollData = {
          scrollY: window.scrollY,
          scrollPercentage: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
          timestamp: new Date().toISOString()
        };
        console.log('📜 Scroll Event:', scrollData);
        this.sendEvent('scroll', scrollData);
      }, 500);
    });
  },

  /**
   * Track video/media plays
   */
  trackMediaPlay() {
    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach(media => {
      media.addEventListener('play', () => {
        const eventData = {
          mediaType: media.tagName,
          mediaId: media.id,
          currentTime: media.currentTime,
          timestamp: new Date().toISOString()
        };
        console.log('▶️ Media Play:', eventData);
        this.sendEvent('media_play', eventData);
      });

      media.addEventListener('pause', () => {
        const eventData = {
          mediaType: media.tagName,
          mediaId: media.id,
          currentTime: media.currentTime,
          watchTime: media.currentTime,
          timestamp: new Date().toISOString()
        };
        console.log('⏸️ Media Pause:', eventData);
        this.sendEvent('media_pause', eventData);
      });
    });
  },

  /**
   * Send event data (to be connected to analytics service)
   */
  sendEvent(eventName, eventData) {
    // This function can be connected to Google Analytics, Mixpanel, etc.
    // Example for Google Analytics:
    // if (window.gtag) {
    //   gtag('event', eventName, eventData);
    // }
    
    // Store in localStorage for debugging
    const events = JSON.parse(localStorage.getItem('codewave_events') || '[]');
    events.push({
      event: eventName,
      data: eventData
    });
    localStorage.setItem('codewave_events', JSON.stringify(events.slice(-50)));
  }
};

// ============================================================================
// 2. FORM VALIDATION
// ============================================================================

const FormValidator = {
  /**
   * Initialize form validation for all forms
   */
  init() {
    const forms = document.querySelectorAll('form[data-validate="true"]');
    forms.forEach(form => {
      this.attachFormValidation(form);
    });
  },

  /**
   * Attach validation to a specific form
   */
  attachFormValidation(form) {
    form.addEventListener('submit', (e) => {
      if (!this.validateForm(form)) {
        e.preventDefault();
        Analytics.trackEvent('form_validation_error', { formId: form.id });
      }
    });

    // Real-time validation on input
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      input.addEventListener('input', () => {
        // Clear error on input change
        this.clearFieldError(input);
      });
    });
  },

  /**
   * Validate entire form
   */
  validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  },

  /**
   * Validate single field
   */
  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    const pattern = field.getAttribute('pattern');
    const minLength = field.getAttribute('minlength');
    const maxLength = field.getAttribute('maxlength');
    let isValid = true;

    // Clear previous error
    this.clearFieldError(field);

    // Check required
    if (required && value === '') {
      this.showFieldError(field, 'This field is required');
      return false;
    }

    // Skip other validations if field is empty and not required
    if (!required && value === '') {
      return true;
    }

    // Email validation
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.showFieldError(field, 'Please enter a valid email address');
        isValid = false;
      }
    }

    // Phone validation
    if (type === 'tel') {
      const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
      if (!phoneRegex.test(value)) {
        this.showFieldError(field, 'Please enter a valid phone number');
        isValid = false;
      }
    }

    // URL validation
    if (type === 'url') {
      try {
        new URL(value);
      } catch {
        this.showFieldError(field, 'Please enter a valid URL');
        isValid = false;
      }
    }

    // Min length validation
    if (minLength && value.length < parseInt(minLength)) {
      this.showFieldError(field, `Minimum ${minLength} characters required`);
      isValid = false;
    }

    // Max length validation
    if (maxLength && value.length > parseInt(maxLength)) {
      this.showFieldError(field, `Maximum ${maxLength} characters allowed`);
      isValid = false;
    }

    // Pattern validation
    if (pattern) {
      const regex = new RegExp(`^${pattern}$`);
      if (!regex.test(value)) {
        this.showFieldError(field, 'Please enter a valid value');
        isValid = false;
      }
    }

    return isValid;
  },

  /**
   * Show field error message
   */
  showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');

    let errorEl = field.parentElement.querySelector('.error-message');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'error-message';
      field.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
  },

  /**
   * Clear field error
   */
  clearFieldError(field) {
    field.classList.remove('error');
    const errorEl = field.parentElement.querySelector('.error-message');
    if (errorEl) {
      errorEl.remove();
    }
  }
};

// ============================================================================
// 3. ANIMATIONS & SCROLL EFFECTS
// ============================================================================

const AnimationManager = {
  /**
   * Initialize all animations
   */
  init() {
    this.setupFadeInOnScroll();
    this.setupParallax();
    this.setupCounterAnimation();
    this.setupElementAnimations();
  },

  /**
   * Fade in elements on scroll
   */
  setupFadeInOnScroll() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('[data-animation="fade-in"]').forEach(el => {
      observer.observe(el);
    });
  },

  /**
   * Parallax scrolling effect
   */
  setupParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach(el => {
        const speed = el.getAttribute('data-parallax') || '0.5';
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    });
  },

  /**
   * Counter/number animation
   */
  setupCounterAnimation() {
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length === 0) return;

    const observerOptions = { threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          this.animateCounter(entry.target);
          entry.target.classList.add('counted');
        }
      });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
  },

  /**
   * Animate counter from 0 to target value
   */
  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-counter'));
    const duration = parseInt(element.getAttribute('data-duration')) || 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  },

  /**
   * Setup various element animations
   */
  setupElementAnimations() {
    // Stagger animation for list items
    document.querySelectorAll('[data-stagger]').forEach((container, index) => {
      const items = container.querySelectorAll('[data-stagger-item]');
      items.forEach((item, itemIndex) => {
        item.style.animationDelay = `${itemIndex * 0.1}s`;
        item.classList.add('stagger-item');
      });
    });
  }
};

// ============================================================================
// 4. MOBILE MENU FUNCTIONALITY
// ============================================================================

const MobileMenu = {
  menuOpen: false,
  toggleBtn: null,
  menu: null,
  backdrop: null,

  /**
   * Initialize mobile menu
   */
  init() {
    this.toggleBtn = document.querySelector('[data-mobile-menu-toggle]');
    this.menu = document.querySelector('[data-mobile-menu]');
    this.backdrop = document.querySelector('[data-menu-backdrop]');

    if (!this.toggleBtn || !this.menu) return;

    this.attachEventListeners();
    this.handleResize();
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toggle button
    this.toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Backdrop click
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => {
        this.closeMenu();
      });
    }

    // Close menu on link click
    this.menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.menuOpen) {
        this.closeMenu();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Track menu events
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-mobile-menu-toggle]')) {
        Analytics.sendEvent('mobile_menu_toggle', {
          timestamp: new Date().toISOString()
        });
      }
    });
  },

  /**
   * Toggle menu open/close
   */
  toggleMenu() {
    if (this.menuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  },

  /**
   * Open menu
   */
  openMenu() {
    this.menuOpen = true;
    this.menu.classList.add('open');
    this.toggleBtn.classList.add('open');
    if (this.backdrop) this.backdrop.classList.add('open');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    console.log('📱 Mobile menu opened');
  },

  /**
   * Close menu
   */
  closeMenu() {
    this.menuOpen = false;
    this.menu.classList.remove('open');
    this.toggleBtn.classList.remove('open');
    if (this.backdrop) this.backdrop.classList.remove('open');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    console.log('📱 Mobile menu closed');
  },

  /**
   * Handle window resize to close menu on larger screens
   */
  handleResize() {
    if (window.innerWidth > 768 && this.menuOpen) {
      this.closeMenu();
    }
  }
};

// ============================================================================
// 5. SMOOTH SCROLLING
// ============================================================================

const SmoothScroll = {
  /**
   * Initialize smooth scroll for anchor links
   */
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        this.scrollToElement(target);
      });
    });
  },

  /**
   * Smooth scroll to element
   */
  scrollToElement(element) {
    const offsetTop = element.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
};

// ============================================================================
// 6. UTILITY FUNCTIONS
// ============================================================================

const Utils = {
  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Detect if device is mobile
   */
  isMobile() {
    return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  },

  /**
   * Get URL parameter
   */
  getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  /**
   * Show notification
   */
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  },

  /**
   * Copy to clipboard
   */
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Copied to clipboard!', 'success', 2000);
    }).catch(() => {
      this.showNotification('Failed to copy', 'error', 2000);
    });
  }
};

// ============================================================================
// 7. INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 CodeWave Designs - Initializing...');

  // Initialize all modules
  Analytics.init();
  Analytics.trackScroll();
  Analytics.trackMediaPlay();
  
  FormValidator.init();
  
  AnimationManager.init();
  
  MobileMenu.init();
  
  SmoothScroll.init();

  console.log('✅ All modules initialized');
});

// ============================================================================
// 8. EXPORT FOR EXTERNAL USE
// ============================================================================

window.CodeWave = {
  Analytics,
  FormValidator,
  AnimationManager,
  MobileMenu,
  SmoothScroll,
  Utils
};
