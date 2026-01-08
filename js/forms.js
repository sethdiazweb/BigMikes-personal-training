/* ==========================================================================
   Forms JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    initContactForm(contactForm);
  }
});

function initContactForm(form) {
  const submitBtn = form.querySelector('[type="submit"]');
  const successMessage = document.getElementById('form-success');
  const btnText = submitBtn ? submitBtn.querySelector('.btn__text') : null;
  const btnLoading = submitBtn ? submitBtn.querySelector('.btn__loading') : null;

  // Real-time validation on blur
  form.querySelectorAll('input, textarea, select').forEach(function(field) {
    field.addEventListener('blur', function() {
      validateField(field);
    });

    field.addEventListener('input', function() {
      clearError(field);
    });
  });

  // Form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validate all required fields
    let isValid = true;
    form.querySelectorAll('[required]').forEach(function(field) {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    // Show loading state
    setLoading(true);

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
        showSuccess();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      alert('Sorry, there was an error sending your message. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  });

  function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required check
    if (field.required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }
    // Email validation
    else if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }
    // Phone validation
    else if (field.type === 'tel' && value) {
      const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    }

    toggleError(field, isValid, errorMessage);
    return isValid;
  }

  function toggleError(field, isValid, message) {
    const group = field.closest('.form-group');
    if (!group) return;

    const existingError = group.querySelector('.form-error');

    if (!isValid) {
      field.classList.add('form-input--error');
      if (!existingError) {
        const error = document.createElement('span');
        error.className = 'form-error';
        error.textContent = message;
        group.appendChild(error);
      } else {
        existingError.textContent = message;
      }
    } else {
      field.classList.remove('form-input--error');
      if (existingError) {
        existingError.remove();
      }
    }
  }

  function clearError(field) {
    const group = field.closest('.form-group');
    if (!group) return;

    field.classList.remove('form-input--error');
    const error = group.querySelector('.form-error');
    if (error) {
      error.remove();
    }
  }

  function setLoading(loading) {
    if (submitBtn) {
      submitBtn.disabled = loading;
    }
    if (btnText) {
      btnText.hidden = loading;
    }
    if (btnLoading) {
      btnLoading.hidden = !loading;
    }
  }

  function showSuccess() {
    form.hidden = true;
    if (successMessage) {
      successMessage.hidden = false;
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
