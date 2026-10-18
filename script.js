// ─── HERO NETWORK CONSTELLATION ANIMATION ───
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
    
    // Perubahan: Mengurangi particle untuk Mobile
    const density = window.innerWidth < 480 ? 22000 : 10000;
    const particleCount = Math.floor((hW * hH) / density);  
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

  // Perubahan: Membuat video lebih ringan
  const featuredVideo = document.getElementById('featured-video');
  const mobileMQ = window.matchMedia('(max-width: 480px)');

  function animateHero() {
    if (document.hidden || (mobileMQ.matches && featuredVideo && !featuredVideo.paused)) {
      requestAnimationFrame(animateHero);
      return;
    }

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

// ─── SCROLL REVEAL ───
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ─── HAMBURGER MENU ───
(function() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  // Perubahan: Membuat agar halaman utama di background tidak bisa di scroll ketika dalam mobile menu
  function toggleMenu(force) {
    const open = force !== undefined ? force : !btn.classList.contains('open');
  btn.classList.toggle('open', open);
  menu.classList.toggle('open', open);
  document.documentElement.classList.toggle('menu-open', open);
  }
  btn.addEventListener('click', () => toggleMenu());
  document.querySelectorAll('.mobile-nav-link').forEach(a => {
    a.addEventListener('click', () => toggleMenu(false));
  });
})();

// ─── DIVISI CAROUSEL (INFINITE LOOP) ───
(function() {
  const track = document.getElementById('divisiTrack');
  const origCards = Array.from(track.querySelectorAll('.divisi-card'));
  const dotsContainer = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const total = origCards.length;

  // Clone cards before and after for seamless loop
  origCards.forEach(c => track.appendChild(c.cloneNode(true)));
  [...origCards].reverse().forEach(c => track.insertBefore(c.cloneNode(true), track.firstChild));

  const allCards = Array.from(track.querySelectorAll('.divisi-card'));
  // Actual cards are at indices [total .. total*2-1]
  let current = total; // start at real index 0 (offset by one clone set)
  let isTransitioning = false;

  // Build dots for real cards only
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => { if (!isTransitioning) goTo(total + i); });
    dotsContainer.appendChild(dot);
  }

  function getCardInfo() {
    const cardW = allCards[0].offsetWidth;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 24;
    return { width: cardW, step: cardW + gap };
  }

  function updateDots() {
    const realIdx = ((current % total) + total) % total;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === realIdx);
    });
  }

  function setActive() {
    const realIdx = ((current % total) + total) % total;
    allCards.forEach((c, i) => {
      c.classList.toggle('active', (i % total) === realIdx);
    });
    updateDots();
  }

  function getOffset() {
    const info = getCardInfo();
    const targetCenter = track.parentElement.offsetWidth / 2;
    const cardCenterRelative = (current * info.step) + (info.width / 2);
    return targetCenter - cardCenterRelative;
  }

  function goTo(index, animate = true) {
    current = index;
    if (animate) {
      isTransitioning = true;
      track.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
    } else {
      track.style.transition = 'none';
    }
    track.style.transform = `translateX(${getOffset()}px)`;
    setActive();
  }

  // After transition ends, silently jump if at clone zone
  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    const cloneTotal = total * 3;
    if (current < total) {
      goTo(current + total, false);
    } else if (current >= total * 2) {
      goTo(current - total, false);
    }
  });

  prevBtn.addEventListener('click', () => { if (!isTransitioning) goTo(current - 1); });
  nextBtn.addEventListener('click', () => { if (!isTransitioning) goTo(current + 1); });

  document.addEventListener('keydown', e => {
    const rect = track.getBoundingClientRect();
    const inView = (rect.top < window.innerHeight && rect.bottom > 0);
    if (inView) {
      if (e.key === 'ArrowLeft' && !isTransitioning) goTo(current - 1);
      if (e.key === 'ArrowRight' && !isTransitioning) goTo(current + 1);
    }
  });

  allCards.forEach((c, i) => {
    c.addEventListener('click', () => {
      if (!isTransitioning) {
        if (c.classList.contains('active')) {
          // Already active — open detail page
          const realIdx = ((current % total) + total) % total;
          openDivisiPage(realIdx);
        } else {
          goTo(i);
        }
      }
    });
  });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40 && !isTransitioning) goTo(current + (diff > 0 ? 1 : -1));
  });

  window.addEventListener('resize', () => goTo(current, false));

  // Init — no animation on first render
  goTo(current, false);

  // Perubahan: Ketika link divisi di footer di klik, langsung ke divisi tersebut
  window.goToDivisi = function (realIdx) {
    if (realIdx < 0 || realIdx >= total) return;
    isTransitioning = false;          // jangan sampai terkunci kalau animasi sedang berjalan
    goTo(total + realIdx, false);     // pindah langsung tanpa animasi
  };

  document.querySelectorAll('[data-divisi]').forEach(link => {
    link.addEventListener('click', () => {
      window.goToDivisi(Number(link.dataset.divisi));
    });
  });
})();

// ─── DIVISI PAGE SYSTEM ───
const divisiData = {
    0: {
      emoji: '⚙️',
      image: 'images/divisi/ketuawakil.JPG',
      name: 'BPI',
      full: 'Badan Pengurus Inti',
      badge: 'Pengawasan & Evaluasi',
      desc: 'Badan Pengurus Inti (BPI) bertugas memastikan seluruh tata kelola organisasi berjalan dengan transparan, akuntabel, dan sesuai dengan nilai serta regulasi yang telah ditetapkan. BPI menjadi garda terdepan dalam menjaga integritas dan profesionalisme Informatics Community.',
      tasks: ['Mengawasi jalannya kegiatan organisasi', 'Melakukan evaluasi program kerja secara berkala', 'Memastikan kepatuhan terhadap AD/ART organisasi', 'Memberikan rekomendasi perbaikan tata kelola', 'Menjaga transparansi laporan keuangan', 'Mediasi konflik internal organisasi'],
      members: [
        { name: 'Ketua', role: 'Ketua', image: 'images/members/Ketua.png' },
        { name: 'Wakil Ketua', role: 'Wakil Ketua', image: 'images/members/Wakil.png' },
        { name: 'Sekretaris 1', role: 'Sekretaris 1', image: 'images/members/Sekretaris 1.png' },
        { name: 'Sekretaris 2', role: 'Sekretaris 2', image: 'images/members/Sekretaris 2.png' },
        { name: 'Bendahara 1', role: 'Bendahara 1', image: 'images/members/Bendahara 1.png' },
        { name: 'Bendahara 2', role: 'Bendahara 2', image: 'images/members/Bendahara 2.png' }
      ]
    },
    1: {
      emoji: '🎯',
      image: 'images/divisi/acara.JPG',
      name: 'ACARA',
      full: 'Divisi Acara',
      badge: 'Event & Program',
      desc: 'Divisi Acara bertanggung jawab merancang, mengelola, dan menjalankan seluruh rangkaian kegiatan dan event organisasi agar berjalan terstruktur, tepat waktu, dan berkesan bagi semua peserta. Dari seminar hingga kompetisi, Divisi Acara menjadi motor penggerak program-program unggulan IC.',
      tasks: ['Perencanaan dan konsep acara', 'Koordinasi teknis pelaksanaan event', 'Manajemen timeline kegiatan', 'Briefing dan koordinasi antar divisi', 'Evaluasi pasca kegiatan', 'Pengembangan format acara baru'],
      members: [
        { name: 'Koordinator Acara', role: 'Koordinator', image: 'images/members/Div. Acara.png' },
        { name: 'Anggota Acara 1', role: 'Staff Acara', image: 'images/members/Div. Acara (3).png' },
        { name: 'Anggota Acara 2', role: 'Staff Acara', image: 'images/members/Div. Acara (5).png' },
        { name: 'Anggota Acara 3', role: 'Staff Acara', image: 'images/members/Div. Acara (7).png' }
      ]
    },
    2: {
      emoji: '📡',
      image: 'images/divisi/humas.JPG',
      name: 'HUMAS',
      full: 'Hubungan Masyarakat',
      badge: 'Relasi & Komunikasi',
      desc: 'Divisi Hubungan Masyarakat (HUMAS) bertugas membangun dan menjaga relasi yang kuat dengan pihak eksternal, mitra strategis, institusi pendidikan, serta komunitas lain di luar organisasi. HUMAS menjadi wajah IC dalam menjalin kolaborasi dan kemitraan yang berdampak positif.',
      tasks: ['Menjalin kerjasama dengan mitra eksternal', 'Koordinasi dengan kampus dan institusi', 'Membangun jaringan antar komunitas', 'Outreach dan rekrutmen anggota baru', 'Representasi IC di forum eksternal', 'Pengelolaan MoU dan kerjasama'],
      members: [
        { name: 'Koordinator Humas', role: 'Koordinator', image: 'images/members/Div. Humas.png' },
        { name: 'Anggota Humas', role: 'Staff Humas', image: 'images/members/Div. Humas (3).png' }
      ]
    },
    3: {
      emoji: '💡',
      image: 'images/divisi/keilmuan.JPG',
      name: 'KEILMUAN',
      full: 'Divisi Keilmuan',
      badge: 'Edukasi & Riset',
      desc: 'Divisi Keilmuan mendorong pengembangan ilmu pengetahuan dan kompetensi teknis anggota melalui diskusi ilmiah, pelatihan terstruktur, dan program akademik berkualitas. Divisi ini menjadi pusat pertumbuhan intelektual dan riset di lingkungan Informatics Community.',
      tasks: ['Menyelenggarakan workshop teknis', 'Program mentoring akademik', 'Diskusi ilmiah rutin (sharing session)', 'Kompetisi dan olimpiade internal', 'Pengembangan kurikulum pelatihan', 'Riset dan kajian teknologi terkini'],
      members: [
        { name: 'Koordinator Keilmuan', role: 'Koordinator', image: 'images/members/Div. Keilmuan.png' },
        { name: 'Anggota Keilmuan 1', role: 'Staff Keilmuan', image: 'images/members/Div. Keilmuan (3).png' },
        { name: 'Anggota Keilmuan 2', role: 'Staff Keilmuan', image: 'images/members/Div. Keilmuan (5).png' }
      ]
    },
    4: {
      emoji: '📸',
      image: 'images/divisi/publidok.JPG',
      name: 'PUBLIDOK',
      full: 'Publikasi & Dokumentasi',
      badge: 'Konten & Media',
      desc: 'Divisi Publikasi dan Dokumentasi (PUBLIDOK) mengelola seluruh konten digital, publikasi media sosial, serta mendokumentasikan setiap kegiatan organisasi secara profesional and kreatif. PUBLIDOK memastikan jejak dan identitas IC tersebar luas di dunia digital.',
      tasks: ['Desain konten media sosial', 'Fotografi dan videografi kegiatan', 'Pengelolaan akun sosial media IC', 'Produksi konten kreatif & reels', 'Pembuatan poster dan materi promosi', 'Arsip dokumentasi digital organisasi'],
      members: [
        { name: 'Koordinator Publidok', role: 'Koordinator', image: 'images/members/Div. Publidok.png' },
        { name: 'Anggota Publidok 1', role: 'Staff Publidok', image: 'images/members/Div. Publidok (3).png' },
        { name: 'Anggota Publidok 2', role: 'Staff Publidok', image: 'images/members/Div. Publidok (5).png' },
        { name: 'Anggota Publidok 3', role: 'Staff Publidok', image: 'images/members/Div. Publidok (7).png' }
      ]
    },
    5: {
      emoji: '🍽️',
      image: 'images/divisi/konsumsi.JPG',
      name: 'KONSUM',
      full: 'Divisi Konsumsi',
      badge: 'Logistik & Layanan',
      desc: 'Divisi Konsumsi memastikan kebutuhan konsumsi setiap kegiatan organisasi terpenuhi dengan baik, terencana, dan efisien. Divisi ini bekerja keras di balik layar untuk mendukung kelancaran setiap acara dengan memperhatikan kualitas, kuantitas, dan ketepatan waktu penyajian.',
      tasks: ['Perencanaan kebutuhan konsumsi acara', 'Survey dan pemilihan vendor konsumsi', 'Pengelolaan anggaran konsumsi', 'Koordinasi distribusi konsumsi', 'Quality control penyajian makanan', 'Evaluasi kepuasan peserta acara'],
      members: [
        { name: 'Koordinator Konsumsi', role: 'Koordinator', image: 'images/members/Div. Konsum (1).png' },
        { name: 'Anggota Konsumsi', role: 'Staff Konsumsi', image: 'images/members/Div. Konsum (2).png' }
      ]
    },
    6: {
      emoji: '💰',
      image: 'images/divisi/perkap.JPG',
      name: 'DANA & PERKAP',
      full: 'Dana & Perlengkapan',
      badge: 'Dana & Logistik',
      desc: 'Divisi Dana & Perlengkapan bertugas memastikan semua kebutuhan perlengkapan kegiatan tersedia tepat waktu dan sesuai anggaran. Divisi ini menjadi tulang punggung operasional IC.',
      tasks: ['Penggalangan dana', 'Inventaris dan pengadaan perlengkapan', 'Manajemen aset & logistik organisasi', 'Pemeliharaan dan penyiapan sarana kegiatan', 'Koordinasi kebutuhan teknis & perlengkapan acara', 'Pengecekan dan pemeliharaan alat operasional'],
      members: [
        { name: 'Koordinator Perlengkapan', role: 'Koordinator', image: 'images/members/Div. Perlengkapan.png' },
        { name: 'Anggota Perlengkapan 1', role: 'Staff Perlengkapan', image: 'images/members/Div. Perlengkapan (3).png' },
        { name: 'Anggota Perlengkapan 2', role: 'Staff Perlengkapan', image: 'images/members/Div. Perlengkapan (5).png' }
      ]
    }
  };

function getMemberInitials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function buildMemberPhoto(member) {
  if (member.image) {
    return `<img src="${member.image}" alt="${member.name}" loading="lazy">`;
  }
  return `<div class="member-photo-placeholder">${getMemberInitials(member.name)}</div>`;
}

function buildMemberCarouselHTML(members) {
  const cards = members.map((member, i) => `
    <div class="member-card" data-index="${i}">
      <div class="member-photo">${buildMemberPhoto(member)}</div>
      <div class="member-info">
        <div class="member-name">${member.name}</div>
        <div class="member-role">${member.role}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="member-carousel-wrapper">
      <div class="member-carousel-track-outer">
        <div class="member-carousel-track">${cards}</div>
      </div>
      <div class="member-carousel-controls">
        <button type="button" class="member-carousel-btn member-prev" aria-label="Anggota sebelumnya">&#8592;</button>
        <div class="member-carousel-dots"></div>
        <button type="button" class="member-carousel-btn member-next" aria-label="Anggota berikutnya">&#8594;</button>
      </div>
    </div>
  `;
}

function initMemberCarousel(wrapper, startIndex = 0) {
  const track = wrapper.querySelector('.member-carousel-track');
  const dotsContainer = wrapper.querySelector('.member-carousel-dots');
  const prevBtn = wrapper.querySelector('.member-prev');
  const nextBtn = wrapper.querySelector('.member-next');
  const controls = wrapper.querySelector('.member-carousel-controls');
  const origCards = Array.from(track.querySelectorAll('.member-card'));
  const total = origCards.length;

  if (total === 0) {
    wrapper.style.display = 'none';
    return;
  }

  if (total === 1) {
    origCards[0].classList.add('active');
    controls.style.display = 'none';
    track.style.justifyContent = 'center';
    return;
  }

  origCards.forEach(c => track.appendChild(c.cloneNode(true)));
  [...origCards].reverse().forEach(c => track.insertBefore(c.cloneNode(true), track.firstChild));

  const allCards = Array.from(track.querySelectorAll('.member-card'));
  let current = total + (startIndex % total);
  let isTransitioning = false;

  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'member-carousel-dot' + (i === startIndex ? ' active' : '');
    dot.addEventListener('click', () => { if (!isTransitioning) goTo(total + i); });
    dotsContainer.appendChild(dot);
  }

  function getCardInfo() {
    const cardW = allCards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    return { width: cardW, step: cardW + gap };
  }

  function updateDots() {
    const realIdx = ((current % total) + total) % total;
    dotsContainer.querySelectorAll('.member-carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === realIdx);
    });
  }

  function setActive() {
    const realIdx = ((current % total) + total) % total;
    allCards.forEach((c, i) => {
      c.classList.toggle('active', (i % total) === realIdx);
    });
    updateDots();
  }

  function getOffset() {
    const info = getCardInfo();
    const targetCenter = track.parentElement.offsetWidth / 2;
    const cardCenterRelative = (current * info.step) + (info.width / 2);
    return targetCenter - cardCenterRelative;
  }

  function goTo(index, animate = true) {
    current = index;
    track.style.transition = animate
      ? 'transform 0.4s cubic-bezier(0.4,0,0.2,1)'
      : 'none';
    track.style.transform = `translateX(${getOffset()}px)`;
    setActive();
    if (animate) isTransitioning = true;
  }

  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (current < total) {
      goTo(current + total, false);
    } else if (current >= total * 2) {
      goTo(current - total, false);
    }
  });

  prevBtn.addEventListener('click', () => { if (!isTransitioning) goTo(current - 1); });
  nextBtn.addEventListener('click', () => { if (!isTransitioning) goTo(current + 1); });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40 && !isTransitioning) goTo(current + (diff > 0 ? 1 : -1));
  });

  const resizeHandler = () => goTo(current, false);
  window.addEventListener('resize', resizeHandler);
  wrapper._memberResizeHandler = resizeHandler;

  goTo(current, false);
}

(function() {
  const overlay = document.getElementById('divisiOverlay');
  const pageContent = document.getElementById('divisiPageContent');

  window.openDivisiPage = function(index) {
    const d = divisiData[index];
    if (!d) return;
    const existingCarousel = pageContent.querySelector('.member-carousel-wrapper');
    if (existingCarousel && existingCarousel._memberResizeHandler) {
      window.removeEventListener('resize', existingCarousel._memberResizeHandler);
    }
    const tasksHTML = d.tasks.map(t => `<div class="divisi-task-item">${t}</div>`).join('');
    const membersHTML = d.members && d.members.length
      ? `
        <div class="divisi-page-section-title">Anggota Divisi</div>
        ${buildMemberCarouselHTML(d.members)}
      `
      : '';
    const headerIcon = d.image
      ? `<div class="divisi-page-photo"><img src="${d.image}" alt="${d.full}"></div>`
      : `<div class="divisi-page-icon">${d.emoji}</div>`;
    pageContent.innerHTML = `
      <button class="divisi-page-back" onclick="closeDivisiPage()">
        ← Kembali ke Divisi
      </button>
      <div class="divisi-page-header">
        ${headerIcon}
        <div>
          <div class="divisi-page-title">${d.name}</div>
          <div class="divisi-page-subtitle">${d.full}</div>
          <span class="divisi-page-badge">${d.badge}</span>
        </div>
      </div>
      <div class="divisi-page-divider"></div>
      <div class="divisi-page-section-title">Tentang Divisi</div>
      <p class="divisi-page-desc">${d.desc}</p>
      <div class="divisi-page-section-title">Program & Tanggung Jawab</div>
      <div class="divisi-page-tasks">${tasksHTML}</div>
      ${membersHTML}
    `;
    overlay.classList.add('open');
    // Perubahan: Membuat agar halaman utama di background tidak bisa discroll ketika di divisi overlay
    document.documentElement.classList.add('divisi-open');
    overlay.scrollTop = 0;
    const memberCarousel = pageContent.querySelector('.member-carousel-wrapper');
    if (memberCarousel) initMemberCarousel(memberCarousel, 0);
  };

  window.closeDivisiPage = function() {
    const memberCarousel = pageContent.querySelector('.member-carousel-wrapper');
    if (memberCarousel && memberCarousel._memberResizeHandler) {
      window.removeEventListener('resize', memberCarousel._memberResizeHandler);
    }
    overlay.style.opacity = '0';
    overlay.style.transform = 'translateY(20px)';
    overlay.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setTimeout(() => {
      overlay.classList.remove('open');
      overlay.style.opacity = '';
      overlay.style.transform = '';
      overlay.style.transition = '';
      // Perubahan: Membuat agar halaman utama di background tidak bisa discroll ketika di divisi overlay
      document.documentElement.classList.remove('divisi-open');;
    }, 300);
  };

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeDivisiPage();
  });
})();

// ─── EVENTS VIDEO CHANGER ───
window.toggleMute = function() {
  const videoObj = document.getElementById('featured-video');
  const muteIcon = document.getElementById('mute-icon');
  if (!videoObj) return;
  
  if (videoObj.muted) {
    videoObj.muted = false;
    if (muteIcon) muteIcon.textContent = '🔊';
  } else {
    videoObj.muted = true;
    if (muteIcon) muteIcon.textContent = '🔇';
  }
};

// Perubahan: Membuat agar video hanya main ketika kelihatan, agar lebih ringan
(function () {
  const video = document.getElementById('featured-video');
  if (!video || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) video.play().catch(() => {});
    else video.pause();
  }, { threshold: 0.25 });

  io.observe(video);
})();

window.changeFeaturedEvent = function(videoSrc, year, status, statusClass, title, desc) {
  const videoObj = document.getElementById('featured-video');
  const yearObj = document.getElementById('featured-year');
  const statusObj = document.getElementById('featured-status');
  const titleObj = document.getElementById('featured-title');
  const descObj = document.getElementById('featured-desc');
  const featuredBody = document.getElementById('featured-container');
  
  if (!videoObj || !featuredBody) return;
  
  // Fade out effect
  featuredBody.style.opacity = '0';
  
  // Perubahan: Membuat video lebih ringan
  setTimeout(() => {
    videoObj.removeAttribute('poster');
    videoObj.src = videoSrc;
    videoObj.load();
    yearObj.textContent = year;
    statusObj.textContent = status;
    statusObj.className = 'event-status ' + statusClass;
    titleObj.textContent = title;
    descObj.textContent = desc;
    videoObj.play().catch(() => {});
    
    // Unmute automatically on user interaction
    videoObj.muted = false;
    const muteIcon = document.getElementById('mute-icon');
    if (muteIcon) muteIcon.textContent = '🔊';
    
    // Fade in
    featuredBody.style.opacity = '1';
  }, 300);
};

// Perubahan: Menambahkan script berpindah antara panel events & activities
// ─── EVENTS / ACTIVITIES TABS ───
(function () {
  const tabs = document.querySelectorAll('.events-tab');
  const panels = document.querySelectorAll('.events-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });

      panels.forEach(p => { p.hidden = p.id !== 'panel-' + target; });

      // Jangan biarkan video tetap berjalan di belakang tab lain
      const video = document.getElementById('featured-video');
      if (video) {
        if (target === 'events') video.play().catch(() => {});
        else video.pause();
      }
    });
  });
})();

// ─── IC TERMINAL BOOTLOADER ───
(function() {
  const loader = document.getElementById('ic-loader');
  const terminal = document.getElementById('loader-terminal');
  const cursor = document.getElementById('loader-cursor');
  if(!loader) return;

  // Perubahan: Skip intro jika sudah pernah main
  let seen = false;
  try { seen = sessionStorage.getItem('ic-intro-seen') === '1'; } catch (e) {}
  if (seen) {
    loader.remove();
    document.body.classList.add('loaded');
    return;
  }

  const lines = [
    "Memulai sistem Informatics Community...",
    "Membangun koneksi dan kekeluargaan...",
    "Menyatukan [BPI, ACARA, HUMAS, KEILMUAN, PUBLIDOK, KONSUM, PERKAP]...",
    "Status: SIAP BERKOLABORASI.",
    "Selamat datang di rumah kita."
  ];

  let lineIdx = 0;
  let charIdx = 0;
  let currentLineEl = null;

  function typeLine() {
    if(lineIdx >= lines.length) {
      // Sequence finished
      setTimeout(() => {
        loader.classList.add('hide');
        document.body.classList.add('loaded');
        try { sessionStorage.setItem('ic-intro-seen', '1'); } catch (e) {}
        setTimeout(() => loader.remove(), 1000);
      }, 200);
      return;
    }

    if(charIdx === 0) {
      currentLineEl = document.createElement('div');
      currentLineEl.className = 'loader-line';
      currentLineEl.innerHTML = '<span style="color:#79d799; font-weight:bold;">$</span> ';
      terminal.insertBefore(currentLineEl, cursor);
    }

    currentLineEl.innerHTML += lines[lineIdx][charIdx];
    charIdx++;

    if(charIdx < lines[lineIdx].length) {
      // Typing speed variation
      let speed = Math.random() * 8 + 3;
      setTimeout(typeLine, speed);
    } else {
      lineIdx++;
      charIdx = 0;
      setTimeout(typeLine, 80); // Pause before next line
    }
  }

  // Delay start slightly to ensure render
  setTimeout(typeLine, 50);
})();

// Theme Switcher Logic
// Perubahan: Membuat perubahan theme pada Mobile lebih instant
(function() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const root = document.documentElement;
  const isMobile = window.matchMedia('(max-width: 480px), (hover: none)');

  const savedTheme = localStorage.getItem('ic-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

    if (isMobile.matches) {
      // mobile: switch instantly, no per-element color animation
      root.classList.add('theme-switching');
      root.setAttribute('data-theme', newTheme);
      void root.offsetWidth; // force style recalc
      requestAnimationFrame(() =>
        requestAnimationFrame(() => root.classList.remove('theme-switching'))
      );
    } else {
      // desktop: unchanged behavior
      root.setAttribute('data-theme', newTheme);
    }

    localStorage.setItem('ic-theme', newTheme);
  });
})();

// ─── PELAJARI LEBIH LANJUT SMOOTH SCROLL & TRANSITION ───
(function() {
  const learnMoreBtn = document.getElementById('learnMoreBtn');
  if (!learnMoreBtn) return;

  learnMoreBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const targetSection = document.getElementById('about');
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Trigger section highlight transition
      targetSection.classList.remove('scroll-highlight');
      void targetSection.offsetWidth; // trigger reflow
      targetSection.classList.add('scroll-highlight');
      
      setTimeout(() => {
        targetSection.classList.remove('scroll-highlight');
      }, 1200);
    }
  });
})();

// --- INTERACTIVE HERO TITLE ---
(function() {
  const titleLines = document.querySelectorAll('.interactive-title .title-line');
  titleLines.forEach(line => {
    const text = line.textContent.trim();
    line.innerHTML = '';
    for(let i=0; i<text.length; i++) {
      let span = document.createElement('span');
      span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
      span.className = 'hover-char';
      line.appendChild(span);
    }
  });

  // Parallax effect on mouse move
  const heroContent = document.querySelector('.hero-content');
  if(heroContent) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      heroContent.style.transform = `translate(${-x}px, ${-y}px)`;
      heroContent.style.transition = 'transform 0.1s ease-out';
    });
  }
})();
