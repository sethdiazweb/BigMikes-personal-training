/**
 * ==========================================================================
 * Big Mike's Personal Training - Main JavaScript
 * Complete functionality for homepage interactions
 * ==========================================================================
 */

(function() {
  'use strict';

  // ==========================================================================
  // DOM READY
  // ==========================================================================

  document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollAnimations();
    initContactForm();
    initExitPopup();
    initCopyrightYear();
    initSmoothScroll();
    initPhoneModal();
  });

  // ==========================================================================
  // NAVIGATION
  // - Mobile menu toggle
  // - Header scroll effect
  // - Active link highlighting
  // ==========================================================================

  function initNavigation() {
    const header = document.getElementById('header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');

    // Header scroll effect - add background on scroll
    function handleScroll() {
      if (window.scrollY > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }

    // Initial check
    handleScroll();

    // Throttled scroll handler for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          handleScroll();
          updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Mobile menu toggle
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', function() {
        const isOpen = navMenu.classList.toggle('nav__menu--open');
        navToggle.classList.toggle('nav__toggle--open');
        navToggle.setAttribute('aria-expanded', isOpen);
        document.body.classList.toggle('no-scroll', isOpen);
      });

      // Close menu when clicking a link
      navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
          navMenu.classList.remove('nav__menu--open');
          navToggle.classList.remove('nav__toggle--open');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('no-scroll');
        });
      });

      // Close menu on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('nav__menu--open')) {
          navMenu.classList.remove('nav__menu--open');
          navToggle.classList.remove('nav__toggle--open');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('no-scroll');
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', function(e) {
        if (
          navMenu.classList.contains('nav__menu--open') &&
          !navMenu.contains(e.target) &&
          !navToggle.contains(e.target)
        ) {
          navMenu.classList.remove('nav__menu--open');
          navToggle.classList.remove('nav__toggle--open');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('no-scroll');
        }
      });
    }

    // Update active link based on scroll position
    function updateActiveLink() {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 100;

      sections.forEach(function(section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach(function(link) {
            link.classList.remove('nav__link--active');
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('nav__link--active');
            }
          });
        }
      });
    }
  }

  // ==========================================================================
  // SCROLL ANIMATIONS
  // - IntersectionObserver for fade-in animations
  // - Staggered reveals for grid items
  // ==========================================================================

  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      animatedElements.forEach(function(element) {
        observer.observe(element);
      });
    } else {
      // Fallback for older browsers - show all elements immediately
      animatedElements.forEach(function(element) {
        element.classList.add('animated');
      });
    }
  }

  // ==========================================================================
  // SMOOTH SCROLL
  // - Smooth scrolling for anchor links
  // - Accounts for fixed header height
  // ==========================================================================

  function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    const headerHeight = 80; // Match CSS --header-height

    anchorLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Skip if just "#" or no href
        if (href === '#' || !href) return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();

          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = targetPosition - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update URL hash without jumping
          history.pushState(null, null, href);
        }
      });
    });
  }

  // ==========================================================================
  // CONTACT FORM
  // - Client-side validation
  // - Loading states
  // - Success/error handling
  // - Async form submission
  // ==========================================================================

  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('form-success');

    // Real-time validation on blur
    const inputs = form.querySelectorAll('.form-input, .form-select, .form-textarea');
    inputs.forEach(function(input) {
      input.addEventListener('blur', function() {
        validateField(this);
      });

      input.addEventListener('input', function() {
        // Clear error on input
        clearFieldError(this);
      });
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Validate all fields
      let isValid = true;
      inputs.forEach(function(input) {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      // Validate checkbox
      const consent = form.querySelector('#consent');
      if (consent && !consent.checked) {
        isValid = false;
        // Could add visual feedback for checkbox
      }

      if (!isValid) {
        // Focus first invalid field
        const firstError = form.querySelector('.form-input--error, .form-select--error');
        if (firstError) firstError.focus();
        return;
      }

      // Show loading state
      submitButton.classList.add('btn--loading');
      submitButton.disabled = true;

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          // Success - show message and hide form
          form.style.display = 'none';
          successMessage.hidden = false;
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        // Error handling
        console.error('Form submission error:', error);
        alert('Sorry, there was an error submitting your message. Please try again or call us directly at (223) 221-1872.');
      } finally {
        // Reset loading state
        submitButton.classList.remove('btn--loading');
        submitButton.disabled = false;
      }
    });
  }

  /**
   * Validate a single form field
   * @param {HTMLElement} field - The input field to validate
   * @returns {boolean} - Whether the field is valid
   */
  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.required;
    let isValid = true;
    let errorMessage = '';

    // Required field check
    if (required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (isValid && type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }

    // Phone validation (optional - only validate if filled)
    if (isValid && type === 'tel' && value) {
      const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    }

    // Update UI
    if (!isValid) {
      setFieldError(field, errorMessage);
    } else {
      clearFieldError(field);
    }

    return isValid;
  }

  /**
   * Set error state on a field
   */
  function setFieldError(field, message) {
    field.classList.add('form-input--error');
    const errorSpan = field.parentElement.querySelector('.form-error');
    if (errorSpan) {
      errorSpan.textContent = message;
    }
  }

  /**
   * Clear error state on a field
   */
  function clearFieldError(field) {
    field.classList.remove('form-input--error');
    const errorSpan = field.parentElement.querySelector('.form-error');
    if (errorSpan) {
      errorSpan.textContent = '';
    }
  }

  // ==========================================================================
  // EXIT-INTENT POPUP
  // - Detects mouse leaving viewport
  // - Shows once per session
  // - Can be closed via button, backdrop, or escape key
  // ==========================================================================

  function initExitPopup() {
    const popup = document.getElementById('exit-popup');
    const closeButton = document.getElementById('exit-popup-close');
    const backdrop = popup ? popup.querySelector('.exit-popup__backdrop') : null;
    const popupForm = document.getElementById('exit-popup-form');

    if (!popup) return;

    // Check if already shown this session
    let hasShown = sessionStorage.getItem('exitPopupShown') === 'true';

    // Exit intent detection - mouse leaves viewport at top
    document.addEventListener('mouseout', function(e) {
      // Only trigger when mouse leaves from top of viewport
      if (e.clientY < 10 && !hasShown && !popup.hidden === false) {
        showPopup();
      }
    });

    // Close popup functions
    function showPopup() {
      popup.hidden = false;
      document.body.classList.add('no-scroll');
      hasShown = true;
      sessionStorage.setItem('exitPopupShown', 'true');

      // Focus the email input for accessibility
      const emailInput = popup.querySelector('input[type="email"]');
      if (emailInput) {
        setTimeout(function() {
          emailInput.focus();
        }, 300);
      }
    }

    function hidePopup() {
      popup.hidden = true;
      document.body.classList.remove('no-scroll');
    }

    // Close button click
    if (closeButton) {
      closeButton.addEventListener('click', hidePopup);
    }

    // Backdrop click
    if (backdrop) {
      backdrop.addEventListener('click', hidePopup);
    }

    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !popup.hidden) {
        hidePopup();
      }
    });

    // Handle popup form submission
    if (popupForm) {
      popupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const emailInput = popupForm.querySelector('input[type="email"]');
        const submitButton = popupForm.querySelector('button[type="submit"]');

        if (!emailInput.value.trim()) return;

        // Show loading
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        try {
          const formData = new FormData(popupForm);
          const response = await fetch(popupForm.action, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            // Success - update popup content
            const popupContent = popup.querySelector('.exit-popup__content');
            popupContent.innerHTML = `
              <div style="text-align: center; padding: 2rem 0;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2" style="margin: 0 auto 1rem;">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                <h3 style="margin-bottom: 0.5rem;">You're In!</h3>
                <p style="color: #64748B;">Check your email for your free guide.</p>
              </div>
            `;

            // Auto-close after 3 seconds
            setTimeout(hidePopup, 3000);
          } else {
            throw new Error('Submission failed');
          }
        } catch (error) {
          console.error('Popup form error:', error);
          submitButton.textContent = 'Try Again';
          submitButton.disabled = false;
        }
      });
    }
  }

  // ==========================================================================
  // DYNAMIC COPYRIGHT YEAR
  // - Automatically updates footer year
  // ==========================================================================

  function initCopyrightYear() {
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  /**
   * Format phone number as (XXX) XXX-XXXX
   * @param {string} value - Raw phone number
   * @returns {string} - Formatted phone number
   */
  function formatPhoneNumber(value) {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return value;
  }

  /**
   * Debounce function to limit execution rate
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} - Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = function() {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ==========================================================================
  // PHONE MODAL
  // - Shows phone number with copy button on desktop
  // - Direct call on mobile
  // ==========================================================================

  function initPhoneModal() {
    const phoneNumber = '(223) 221-1872';
    const phoneLink = 'tel:+12232211872';
    // Check for actual mobile device (not just browser simulation)
    // Must have touch capability AND mobile user agent AND small screen
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasMobileUA = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    const isMobile = hasTouchScreen && hasMobileUA && isSmallScreen;

    // Get all phone call links
    const phoneLinks = document.querySelectorAll('a[href^="tel:"], .call-btn');

    // Create modal HTML
    const modalHTML = `
      <div class="phone-modal" id="phone-modal" hidden>
        <div class="phone-modal__backdrop"></div>
        <div class="phone-modal__content">
          <button class="phone-modal__close" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="phone-modal__icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <h3 class="phone-modal__title">Call Big Mike's Personal Training</h3>
          <p class="phone-modal__subtitle">${isMobile ? 'Tap to call!' : 'Copy the number below!'}</p>
          <div class="phone-modal__number">${phoneNumber}</div>
          <div class="phone-modal__actions">
            ${isMobile ? `
              <a href="${phoneLink}" class="btn btn--primary btn--lg phone-modal__btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Call Mike
              </a>
            ` : `
              <button class="btn btn--primary btn--lg phone-modal__btn" id="copy-phone-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="copy-icon">
                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="check-icon" style="display:none;">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                <span class="btn-text">Copy Number</span>
              </button>
            `}
            <button class="btn btn--outline btn--lg phone-modal__btn" id="close-phone-modal-btn">Close</button>
          </div>
          <p class="phone-modal__footer">Based in Elizabethtown, PA • Online coaching available anywhere</p>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('phone-modal');
    const backdrop = modal.querySelector('.phone-modal__backdrop');
    const closeBtn = modal.querySelector('.phone-modal__close');
    const closeModalBtn = document.getElementById('close-phone-modal-btn');
    const copyBtn = document.getElementById('copy-phone-btn');

    function showModal() {
      modal.hidden = false;
      document.body.classList.add('no-scroll');
    }

    function hideModal() {
      modal.hidden = true;
      document.body.classList.remove('no-scroll');
    }

    // Always show modal first when clicking phone links
    phoneLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        showModal();
      });
    });

    // Close handlers
    closeBtn.addEventListener('click', hideModal);
    closeModalBtn.addEventListener('click', hideModal);
    backdrop.addEventListener('click', hideModal);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !modal.hidden) {
        hideModal();
      }
    });

    // Copy functionality (desktop only)
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(phoneNumber).then(function() {
          const btnText = copyBtn.querySelector('.btn-text');
          const copyIcon = copyBtn.querySelector('.copy-icon');
          const checkIcon = copyBtn.querySelector('.check-icon');

          btnText.textContent = 'Copied!';
          copyIcon.style.display = 'none';
          checkIcon.style.display = 'inline';

          setTimeout(function() {
            btnText.textContent = 'Copy Number';
            copyIcon.style.display = 'inline';
            checkIcon.style.display = 'none';
          }, 2000);
        });
      });
    }
  }

})();
