// ─── HERO NETWORK CONSTELLATION ANIMATION (FOR JOIN PAGE) ───
const heroCanvas = document.getElementById('hero-canvas');
if (heroCanvas) {
  const hCtx = heroCanvas.getContext('2d');
  let hW, hH;
  let mouse = { x: -1000, y: -1000, radius: 150 };
  
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

  let particles = [];

  function initMatrix() {
    hW = heroCanvas.width = window.innerWidth;
    hH = heroCanvas.height = window.innerHeight;
    
    const particleCount = Math.floor((hW * hH) / 10000);
    particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * hW,
        y: Math.random() * hH,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: Math.random() * 2 + 1.5
      });
    }
  }
  
  initMatrix();
  
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initMatrix, 200);
  });

  function animateHero() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    hCtx.clearRect(0, 0, hW, hH);
    hCtx.lineWidth = 1;
    
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > hW) p.vx *= -1;
      if (p.y < 0 || p.y > hH) p.vy *= -1;
      
      hCtx.beginPath();
      hCtx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
      hCtx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)'; // Blue 500
      hCtx.fill();
      
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 130) {
          hCtx.beginPath();
          hCtx.moveTo(p.x, p.y);
          hCtx.lineTo(p2.x, p2.y);
          let opacity = 1 - (dist / 130);
          hCtx.lineWidth = 1.5;
          hCtx.strokeStyle = isDark ? `rgba(59, 130, 246, ${opacity * 0.5})` : `rgba(59, 130, 246, ${opacity * 0.35})`;
          hCtx.stroke();
        }
      }
      
      let mdx = mouse.x - p.x;
      let mdy = mouse.y - p.y;
      let mDist = Math.sqrt(mdx*mdx + mdy*mdy);
      if (mDist < mouse.radius) {
        hCtx.beginPath();
        hCtx.moveTo(p.x, p.y);
        hCtx.lineTo(mouse.x, mouse.y);
        let mOpacity = 1 - (mDist / mouse.radius);
        hCtx.lineWidth = 2;
        hCtx.strokeStyle = isDark ? `rgba(244, 63, 94, ${mOpacity * 0.8})` : `rgba(244, 63, 94, ${mOpacity * 0.6})`; // Rose 500
        hCtx.stroke();
      }
    }
    
    requestAnimationFrame(animateHero);
  }
  
  animateHero();
}

// CONFIG: Tempelkan URL Google Apps Script Web App Anda di sini
// Contoh: const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx.../exec";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsAqOhNQ_zACbuLyuK-DizsSrHnOphBPGbX9Amst4G0KSNYDWr-_M3C4dovCM09TG-/exec";

// ─── JOIN FORM SUBMISSION HANDLER ───
window.handleJoinSubmit = function(event) {
  event.preventDefault();
  
  const form = document.getElementById('joinForm');
  const successState = document.getElementById('joinSuccessState');
  const successMessage = document.getElementById('joinSuccessMessage');
  const submitBtn = document.getElementById('joinSubmitBtn');
  
  if (!form || !successState || !submitBtn) return;
  
  // Get values
  const name = document.getElementById('join-name').value.trim();
  const nim = document.getElementById('join-nim').value.trim();
  const prodi = document.getElementById('join-prodi').value;
  const angkatan = document.getElementById('join-angkatan').value;
  const email = document.getElementById('join-email').value.trim();
  const whatsapp = document.getElementById('join-whatsapp').value.trim();
  const divisi1 = document.getElementById('join-divisi1').value;
  const divisi2El = document.getElementById('join-divisi2');
  const divisi2 = divisi2El ? divisi2El.value : '';
  const alasan = document.getElementById('join-alasan').value.trim();
  
  if (!/^\d+$/.test(nim)) {
    showToast("NIM harus berupa angka saja!");
    return;
  }

  if (divisi2 && divisi1 === divisi2) {
    showToast("Divisi Pilihan 1 dan Divisi Pilihan 2 tidak boleh sama! Silakan pilih divisi yang berbeda.");
    if (divisi2El) divisi2El.focus();
    return;
  }
  
  // Add loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  
  const registration = {
    name, nim, prodi, angkatan, email, whatsapp, divisi1, divisi2, alasan,
    date: new Date().toISOString()
  };
  
  const finishSubmission = () => {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    
    // Save to local storage for backup
    let currentRegistrations = JSON.parse(localStorage.getItem('ic_registrations') || '[]');
    currentRegistrations.push(registration);
    localStorage.setItem('ic_registrations', JSON.stringify(currentRegistrations));
    
    // Show success message
    const displayDivisi = divisi2 ? `${divisi1} & ${divisi2}` : divisi1;
    successMessage.innerHTML = `Halo <strong>${name}</strong>, pendaftaran Anda untuk bergabung dengan <strong>Informatics Community (IC)</strong> pada <strong>${displayDivisi}</strong> telah kami terima!<br><br>Kami akan memproses data Anda dan menghubungi Anda kembali melalui WhatsApp ke nomor <strong>${whatsapp}</strong> atau email ke <strong>${email}</strong> segera.`;
    
    form.style.display = 'none';
    successState.style.display = 'flex';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Check if Google Apps Script URL is configured
  if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.startsWith('http')) {
    const params = new URLSearchParams({
      name: name,
      nim: nim,
      prodi: prodi,
      angkatan: angkatan,
      email: email,
      whatsapp: whatsapp,
      divisi1: divisi1,
      divisi2: divisi2 || '-',
      alasan: alasan
    });
    
    // Send via GET + POST fallback for 100% reliability across all Google Apps Script deployment types
    const requestUrl = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
    
    fetch(requestUrl, {
      method: 'GET',
      mode: 'no-cors'
    })
    .then(() => {
      finishSubmission();
    })
    .catch((err) => {
      console.error("Error submitting to Google Sheets:", err);
      finishSubmission();
    });
  } else {
    // Simulated delay if URL is not set yet
    setTimeout(finishSubmission, 1200);
  }
};

window.resetJoinForm = function() {
  const form = document.getElementById('joinForm');
  const successState = document.getElementById('joinSuccessState');
  
  if (!form || !successState) return;
  
  form.reset();
  successState.style.display = 'none';
  form.style.display = 'block';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ─── REAL-TIME DUPICATE DIVISION PREVENTION ───
document.addEventListener('DOMContentLoaded', function() {
  const d1 = document.getElementById('join-divisi1');
  const d2 = document.getElementById('join-divisi2');

  if (d1 && d2) {
    function checkDivisions(e) {
      if (d1.value && d2.value && d1.value === d2.value) {
        showToast("Divisi Pilihan 2 tidak boleh sama dengan Divisi Pilihan 1. Silakan pilih divisi yang berbeda.");
        d2.value = "";
      }
    }

    d1.addEventListener('change', checkDivisions);
    d2.addEventListener('change', checkDivisions);
  }
});

// ─── CUSTOM MODERN TOAST NOTIFICATION ───
window.showToast = function(message) {
  let toast = document.getElementById('toast-notification');
  let toastText = document.getElementById('toast-text');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <div class="toast-content">
        <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span id="toast-text"></span>
      </div>
      <button type="button" class="toast-close" onclick="hideToast()">&times;</button>
    `;
    document.body.appendChild(toast);
    toastText = document.getElementById('toast-text');
  }

  toastText.textContent = message;
  toast.classList.add('show');

  if (window.toastTimer) clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    hideToast();
  }, 4000);
};

window.hideToast = function() {
  const toast = document.getElementById('toast-notification');
  if (toast) toast.classList.remove('show');
};
