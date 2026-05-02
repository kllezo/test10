document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('applyForm');
  if (!form) return;

  const requiredFields = form.querySelectorAll('[required]');

  function validateField(field) {
    const group = field.closest('.form-group');
    const error = group.querySelector('.form-error');
    let valid = true;

    if (!field.value.trim()) {
      valid = false;
      if (error) { error.textContent = 'This field is required.'; error.classList.add('show'); }
      group.classList.add('error');
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      valid = false;
      if (error) { error.textContent = 'Please enter a valid email.'; error.classList.add('show'); }
      group.classList.add('error');
    } else if (field.type === 'tel' && field.value.trim().length < 7) {
      valid = false;
      if (error) { error.textContent = 'Please enter a valid phone number.'; error.classList.add('show'); }
      group.classList.add('error');
    } else {
      if (error) { error.textContent = ''; error.classList.remove('show'); }
      group.classList.remove('error');
    }
    return valid;
  }

  requiredFields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.form-group').classList.contains('error')) validateField(field);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;
    requiredFields.forEach(f => { if (!validateField(f)) valid = false; });
    if (!valid) return;

    const btn    = form.querySelector('[type="submit"]');
    const orig   = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    // Formspree endpoint — replace with real endpoint
    const action = form.getAttribute('action') || '#';

    try {
      if (action === '#') {
        // Demo mode — simulate success
        await new Promise(r => setTimeout(r, 1200));
        showSuccess();
      } else {
        const res = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) showSuccess();
        else throw new Error('Server error');
      }
    } catch {
      btn.textContent = 'Try again';
      btn.disabled = false;
    }

    function showSuccess() {
      form.innerHTML = `
        <div style="text-align:center; padding: 80px 40px;">
          <div style="font-size:32px; margin-bottom:24px;">✓</div>
          <p style="font-family:var(--font-display); font-size:28px; color:var(--beige); margin-bottom:16px;">Application received.</p>
          <p style="font-size:14px; color:var(--muted); line-height:1.7;">
            We review every application manually.<br>
            If it's a fit, we'll reach out within 48 hours.
          </p>
        </div>
      `;
    }
  });
});
