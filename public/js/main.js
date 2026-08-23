/* ========================================
   DataHub USA - Client-Side JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {

  // --- Sticky Header ---
  const header = document.getElementById('site-header');
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // --- Mobile Menu ---
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-nav');
  
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      mainNav.classList.toggle('open');
      document.body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
      this.setAttribute('aria-expanded', mainNav.classList.contains('open'));
    });

    // Mobile dropdown toggles
    const dropdownItems = mainNav.querySelectorAll('.has-dropdown');
    dropdownItems.forEach(function(item) {
      const link = item.querySelector('.nav-link');
      link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
          if (link.getAttribute('href') === '#') {
            e.preventDefault();
          }
          item.classList.toggle('mobile-open');
        }
      });
    });

    // Close mobile menu on link click
    mainNav.querySelectorAll('.dropdown-link').forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          mainNav.classList.remove('open');
          mobileToggle.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
  }

  // --- Scroll Animations (IntersectionObserver) ---
  const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    animatedElements.forEach(function(el) {
      observer.observe(el);
    });
  }

  // --- Contact Form Handling ---
  const contactForms = document.querySelectorAll('.contact-form form');
  contactForms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const statusEl = form.querySelector('.form-status');
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'Send';
      
      // Basic validation
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;
      requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#ff4444';
        } else {
          field.style.borderColor = '';
        }
      });

      // Email validation
      const emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
          valid = false;
          emailField.style.borderColor = '#ff4444';
        }
      }

      if (!valid) {
        if (statusEl) {
          statusEl.textContent = 'Please fill in all required fields correctly.';
          statusEl.className = 'form-status error';
        }
        return;
      }

      // Submit via AJAX
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      const formData = new FormData(form);
      const data = {};
      formData.forEach(function(value, key) { data[key] = value; });

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function(response) { return response.json(); })
      .then(function(result) {
        if (result.success) {
          if (statusEl) {
            statusEl.textContent = 'Thank you! Your message has been sent. We will get back to you soon.';
            statusEl.className = 'form-status success';
          }
          form.reset();
        } else {
          throw new Error(result.message || 'Failed to send message');
        }
      })
      .catch(function(error) {
        if (statusEl) {
          statusEl.textContent = error.message || 'Something went wrong. Please try again.';
          statusEl.className = 'form-status error';
        }
      })
      .finally(function() {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    });
  });

  // --- Logo Carousel: duplicate items for infinite scroll ---
  const carouselTrack = document.querySelector('.logo-carousel-track');
  if (carouselTrack) {
    const items = carouselTrack.innerHTML;
    carouselTrack.innerHTML = items + items;
  }

});
