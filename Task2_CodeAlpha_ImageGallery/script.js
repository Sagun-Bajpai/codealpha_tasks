/* ─── DATA ─── */
  const PHOTOS = [
    { title: "Morning Mist",      cat: "nature",       url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80" },
    { title: "Glass Facade",      cat: "architecture", url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80" },
    { title: "Neon Drift",        cat: "abstract",     url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=700&q=80" },
    { title: "Rain Street",       cat: "urban",        url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=700&q=80" },
    { title: "Santorini Dusk",    cat: "travel",       url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=80" },
    { title: "Pine Summit",       cat: "nature",       url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80" },
    { title: "Steel Tower",       cat: "architecture", url: "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?w=700&q=80" },
    { title: "Fluid Forms",       cat: "abstract",     url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=700&q=80" },
    { title: "Midnight Ave",      cat: "urban",        url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=700&q=80" },
    { title: "Kyoto Path",        cat: "travel",       url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=700&q=80" },
    { title: "Golden Hour",       cat: "nature",       url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&q=80" },
    { title: "Dome Light",        cat: "architecture", url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&q=80" },
    { title: "Chromatic Splash",  cat: "abstract",     url: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=700&q=80" },
    { title: "Subway Rush",       cat: "urban",        url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=700&q=80" },
    { title: "Bali Rice Field",   cat: "travel",       url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=80" },
    { title: "Wildflowers",       cat: "nature",       url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=700&q=80" },
    { title: "Spiral Stair",      cat: "architecture", url: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=700&q=80" },
    { title: "Prism Burst",       cat: "abstract",     url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80" },
    { title: "Night Market",      cat: "urban",        url: "https://images.unsplash.com/photo-1498887960847-2a5e46312788?w=700&q=80" },
    { title: "Iceland Aurora",    cat: "travel",       url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=700&q=80" },
    { title: "Frozen Lake",       cat: "nature",       url: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=700&q=80" },
    { title: "Bridge Arc",        cat: "architecture", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80" },
    { title: "Smoke Vortex",      cat: "abstract",     url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=700&q=80" },
    { title: "Tokyo Lights",      cat: "travel",       url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=80" },
  ];

  /* ─── STATE ─── */
  let activeFilter  = 'all';
  let lbItems       = [];   // currently visible subset
  let lbIndex       = 0;

  /* ─── DOM refs ─── */
  const galleryEl   = document.getElementById('gallery');
  const countEl     = document.getElementById('visibleCount');
  const noResultsEl = document.getElementById('noResults');
  const lightboxEl  = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lbImg');
  const lbCatEl     = document.getElementById('lbCat');
  const lbTitleEl   = document.getElementById('lbTitle');
  const lbCounterEl = document.getElementById('lbCounter');

  /* ─── BUILD GALLERY ─── */
  function buildGallery() {
    galleryEl.innerHTML = '';
    lbItems = PHOTOS.filter(p => activeFilter === 'all' || p.cat === activeFilter);

    countEl.textContent = lbItems.length;
    noResultsEl.classList.toggle('visible', lbItems.length === 0);

    lbItems.forEach((photo, idx) => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.style.animationDelay = (idx * 0.045) + 's';
      div.setAttribute('role', 'button');
      div.setAttribute('tabindex', '0');
      div.setAttribute('aria-label', photo.title);

      div.innerHTML = `
        <img src="${photo.url}" alt="${photo.title}" loading="lazy" />
        <div class="item-overlay">
          <div class="item-cat">${photo.cat}</div>
          <div class="item-name">${photo.title}</div>
        </div>
        <div class="item-expand">
          <svg viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h6m0 0v6m0-6-7 7M9 21H3m0 0v-6m0 6 7-7"/>
          </svg>
        </div>`;

      div.addEventListener('click', () => openLightbox(idx));
      div.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(idx); });
      galleryEl.appendChild(div);
    });
  }

  /* ─── FILTERS ─── */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.cat;
      buildGallery();
    });
  });

  /* ─── LIGHTBOX OPEN ─── */
  function openLightbox(idx) {
    lbIndex = idx;
    renderLbImage(false);
    lightboxEl.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* ─── LIGHTBOX RENDER ─── */
  function renderLbImage(animate = true) {
    const p = lbItems[lbIndex];
    if (animate) {
      lbImg.classList.add('fading');
      setTimeout(() => {
        lbImg.src   = p.url;
        lbImg.alt   = p.title;
        lbImg.classList.remove('fading');
      }, 320);
    } else {
      lbImg.src = p.url;
      lbImg.alt = p.title;
    }
    lbCatEl.textContent     = p.cat;
    lbTitleEl.textContent   = p.title;
    lbCounterEl.textContent = `${lbIndex + 1} / ${lbItems.length}`;
  }

  /* ─── LIGHTBOX CLOSE ─── */
  function closeLightbox() {
    lightboxEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ─── NAV ─── */
  function prevImg() { lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length; renderLbImage(); }
  function nextImg() { lbIndex = (lbIndex + 1) % lbItems.length;                  renderLbImage(); }

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbBackdrop').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', prevImg);
  document.getElementById('lbNext').addEventListener('click', nextImg);

  /* ─── KEYBOARD ─── */
  document.addEventListener('keydown', e => {
    if (!lightboxEl.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  prevImg();
    if (e.key === 'ArrowRight') nextImg();
    if (e.key === 'Escape')     closeLightbox();
  });

  /* ─── TOUCH SWIPE ─── */
  let touchStartX = 0;
  lightboxEl.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightboxEl.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? nextImg() : prevImg(); }
  });

  /* ─── INIT ─── */
  buildGallery();