/* ============================================================
   BENJAMIN SOARES PORTFOLIO — CHIC MIDNIGHT NAVY JAVASCRIPT
   ============================================================ */

(function () {
  'use strict';

  // 0. SIGNATURE INTRO (Fundo azul com revelação no mouse + assinatura via scroll)
  function initSignatureIntro() {
    var sigBgLayer = document.getElementById('signatureBgLayer');
    var sigVideoLayer = document.getElementById('signatureVideoLayer');
    var sigVideo = document.getElementById('signatureVideo');
    var scrollCue = document.getElementById('scrollCue');

    if (scrollCue) {
      scrollCue.classList.remove('is-hidden');
    }

    if (!sigBgLayer || !sigVideoLayer || !sigVideo) return;

    var isSigMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 850);

    sigVideo.muted = true;
    sigVideo.defaultMuted = true;
    sigVideo.playsInline = true;
    sigVideo.setAttribute('muted', '');
    sigVideo.setAttribute('playsinline', '');
    sigVideo.setAttribute('webkit-playsinline', '');

    if (isSigMobile) {
      // No celular: reproduz automaticamente sem precisar clicar em play (e para no último frame)
      sigVideo.autoplay = true;
      sigVideo.setAttribute('autoplay', '');
      var sigPlayP = sigVideo.play();
      if (sigPlayP !== undefined) {
        sigPlayP.catch(function () {
          var unlockSig = function () {
            sigVideo.play().catch(function () { });
          };
          ['touchstart', 'scroll', 'pointerdown'].forEach(function (evt) {
            window.addEventListener(evt, unlockSig, { once: true, passive: true });
          });
        });
      }
    } else {
      sigVideo.pause();
      if (sigVideo.readyState === 0) {
        sigVideo.load();
      }
      sigVideo.addEventListener('loadeddata', function () {
        sigVideo.pause();
        if (sigVideo.currentTime === 0) {
          sigVideo.currentTime = 0.01;
        }
      });
    }

    // Efeito de revelar o vídeo do menino por onde o mouse passa
    var targetX = window.innerWidth * 0.5;
    var targetY = window.innerHeight * 0.5;
    var curX = targetX;
    var curY = targetY;
    var targetR = 0;
    var curR = 0;
    var sigCurrentTime = 0;
    var isMouseActive = false;

    window.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      targetR = 185;
      if (!isMouseActive) {
        curX = targetX;
        curY = targetY;
        isMouseActive = true;
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      targetR = 0;
    });

    function renderSignatureFrame() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var vh = window.innerHeight || 800;

      // 1. Opacidade das camadas da assinatura (desaparece depois que ela termina para o vídeo do menino aparecer na frente)
      var fadeStart = vh * 1.45;
      var fadeEnd = vh * 1.85;
      var layerOpacity = 1;
      if (scrollY > fadeStart) {
        layerOpacity = 1 - ((scrollY - fadeStart) / (fadeEnd - fadeStart));
        layerOpacity = Math.max(0, Math.min(1, layerOpacity));
      }

      sigBgLayer.style.opacity = layerOpacity.toFixed(3);
      sigVideoLayer.style.opacity = layerOpacity.toFixed(3);
      var isVisible = layerOpacity > 0.01;
      sigBgLayer.style.visibility = isVisible ? 'visible' : 'hidden';
      sigVideoLayer.style.visibility = isVisible ? 'visible' : 'hidden';

      // 2. Scrubbing da assinatura sincronizado com o scroll no desktop (no celular roda automático)
      if (!isSigMobile && isVisible && sigVideo.duration && !isNaN(sigVideo.duration)) {
        var scrubEnd = vh * 1.25;
        var sigProgress = Math.min(Math.max(scrollY / scrubEnd, 0), 1);
        var sigTargetTime = sigProgress * (sigVideo.duration - 0.04);
        sigCurrentTime += (sigTargetTime - sigCurrentTime) * 0.2;

        if (!sigVideo.seeking && Math.abs(sigCurrentTime - sigVideo.currentTime) > 0.02) {
          sigVideo.currentTime = sigCurrentTime;
        }
      }

      // 3. Interpolação suave do spotlight do mouse no fundo azul
      if (isVisible) {
        curX += (targetX - curX) * 0.16;
        curY += (targetY - curY) * 0.16;
        curR += (targetR - curR) * 0.14;
        sigBgLayer.style.setProperty('--mx', curX.toFixed(1) + 'px');
        sigBgLayer.style.setProperty('--my', curY.toFixed(1) + 'px');
        sigBgLayer.style.setProperty('--mr', curR.toFixed(1) + 'px');
      }

      requestAnimationFrame(renderSignatureFrame);
    }

    requestAnimationFrame(renderSignatureFrame);
  }

  // 1. VIDEO ENGINE (Google Flow / Continuous Ambient & Scroll Sync)
  var video = document.getElementById('flowVideo');
  var videoStatusText = document.getElementById('videoStatusText');
  var videoInput = document.getElementById('videoFileInput');
  var videoModeBtn = document.getElementById('videoModeBtn');
  var dropOverlay = document.getElementById('dropOverlay');

  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 850);
  var isVideoActive = false;
  // No celular/tablet: reprodução contínua (loop) fluida garantida. No desktop: scroll sync.
  var isScrollSyncMode = !isMobile;
  var targetTime = 0;
  var currentVideoTime = 0;

  function loadVideoSource(src, fileName) {
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    if (!isScrollSyncMode) {
      video.loop = true;
      video.autoplay = true;
      video.setAttribute('loop', '');
      video.setAttribute('autoplay', '');
    }

    function onVideoReady() {
      isVideoActive = true;
      if (isScrollSyncMode) {
        video.pause();
      } else {
        var p = video.play();
        if (p !== undefined) {
          p.catch(function (e) {
            console.log('Autoplay deferred:', e);
          });
        }
      }
    }

    video.onloadeddata = onVideoReady;
    video.oncanplay = onVideoReady;
    video.onplay = function () {
      isVideoActive = true;
      if (isScrollSyncMode) {
        video.pause();
      }
    };

    video.onerror = function () {
      console.warn('Vídeo não encontrado ou formato incompatível');
    };

    if (src) {
      var current = video.currentSrc || video.src || '';
      if (!current.endsWith(src) && !current.endsWith(encodeURI(src))) {
        video.src = src;
        video.load();
      }
    }

    if (video.readyState >= 2) {
      onVideoReady();
    }
  }

  function initScrollVideo() {
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    if (!isScrollSyncMode) {
      video.loop = true;
      video.autoplay = true;
      video.setAttribute('loop', '');
      video.setAttribute('autoplay', '');
    }

    if (isScrollSyncMode) {
      video.pause();
    } else {
      var playP = video.play();
      if (playP !== undefined) {
        playP.catch(function () { });
      }
    }

    var sourceEl = video.querySelector('source');
    var defaultSrc = (sourceEl && sourceEl.getAttribute('src')) ? sourceEl.getAttribute('src') : 'assets/video/hero.mp4';
    loadVideoSource(defaultSrc, '');

    // Desbloqueia reprodução no primeiro toque/scroll no mobile ou clique no desktop
    var unlockVideo = function () {
      if (video && video.paused && !isScrollSyncMode) {
        video.play().then(function () {
          isVideoActive = true;
        }).catch(function () { });
      }
    };
    ['touchstart', 'touchend', 'scroll', 'click'].forEach(function (evt) {
      window.addEventListener(evt, unlockVideo, { once: true, passive: true });
    });

    // FADE-OUT SUAVE DO VÍDEO CONFORME O USUÁRIO PASSA DO HERO
    var videoContainer = document.querySelector('.video-bg-container');
    var videoOverlay = document.querySelector('.video-overlay-gradient');
    var etecContainer = document.querySelector('.etec-bg-container');

    function updateVideoScrollFade() {
      if (!videoContainer) return;
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // O vídeo fica 100% visível quando aparece na frente e durante a leitura do Hero.
      // O fade-out só inicia após o usuário passar pelo conteúdo do Hero (aprox. 290% da altura da tela).
      // E desaparece completamente por volta de 380% da tela (início das Soluções & Inovação).
      var fadeStart = window.innerHeight * 2.9;
      var fadeEnd = window.innerHeight * 3.8;

      var opacity = 1;
      if (scrollY > fadeStart) {
        opacity = 1 - ((scrollY - fadeStart) / (fadeEnd - fadeStart));
        opacity = Math.max(0, Math.min(1, opacity));
      }

      videoContainer.style.opacity = opacity.toFixed(3);
      if (videoOverlay) {
        videoOverlay.style.opacity = opacity.toFixed(3);
      }

      // O fundo com a foto do prédio da ETEC MAS surge suavemente conforme o vídeo vai sumindo
      if (etecContainer) {
        var etecOpacity = (1 - opacity) * 0.92;
        etecContainer.style.opacity = etecOpacity.toFixed(3);
      }

      // Pausa o vídeo quando totalmente invisível para economizar GPU/processamento
      if (video) {
        if (opacity <= 0.01) {
          if (!video.paused) video.pause();
        } else {
          if (video.paused && !isScrollSyncMode && isVideoActive) {
            video.play().catch(function () { });
          }
        }
      }

      // Oculta o badge de vídeo flutuante quando o vídeo não estiver em exibição
      var controller = document.getElementById('videoController');
      if (controller) {
        if (opacity <= 0.05) {
          controller.style.opacity = '0';
          controller.style.pointerEvents = 'none';
        }
      }
    }

    window.addEventListener('scroll', updateVideoScrollFade, { passive: true });
    window.addEventListener('resize', updateVideoScrollFade, { passive: true });
    updateVideoScrollFade();

    // REVEAL DO HERO E NAVBAR AO ROLAR A PÁGINA (VÍDEO DO MENINO SURGE SOZINHO NO INÍCIO)
    var navWrap = document.querySelector('.nav-wrap');
    var heroContent = document.getElementById('heroContent');
    var scrollCue = document.getElementById('scrollCue');
    var videoController = document.getElementById('videoController');

    function updateHeroScrollReveal() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var vh = window.innerHeight || 800;

      // Navbar e controlador aparecem quando o vídeo do menino assume a tela
      if (scrollY > vh * 1.8) {
        if (navWrap) navWrap.classList.add('nav-visible');
        if (videoController) videoController.classList.add('is-active');
      } else {
        if (navWrap) {
          navWrap.classList.remove('nav-visible');
          navWrap.classList.remove('is-scrolled');
        }
        if (videoController) videoController.classList.remove('is-active');
      }

      if (scrollY > vh * 1.9) {
        if (navWrap) navWrap.classList.add('is-scrolled');
      } else {
        if (navWrap) navWrap.classList.remove('is-scrolled');
      }

      // O indicador de scroll some assim que o usuário começa a rolar
      if (scrollY > 60) {
        if (scrollCue) scrollCue.style.opacity = '0';
      } else {
        if (scrollCue) scrollCue.style.opacity = '0.85';
      }

      // Os textos do Hero aparecem suavemente após o vídeo do menino aparecer na frente
      if (scrollY > vh * 1.95) {
        if (heroContent) heroContent.classList.add('is-revealed');
      } else {
        if (heroContent) heroContent.classList.remove('is-revealed');
      }
    }

    window.addEventListener('scroll', updateHeroScrollReveal, { passive: true });
    window.addEventListener('resize', updateHeroScrollReveal, { passive: true });
    updateHeroScrollReveal();

    if (scrollCue && heroContent) {
      scrollCue.addEventListener('click', function () {
        heroContent.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Render loop para o modo de scroll (começa após a assinatura terminar)
    function renderVideoScrub() {
      if (video && video.duration && !isNaN(video.duration) && isScrollSyncMode) {
        var scrollY = window.pageYOffset || document.documentElement.scrollTop;
        var scrubStart = window.innerHeight * 1.35;
        var scrubEnd = window.innerHeight * 3.8;
        var scrollProgress = Math.min(Math.max((scrollY - scrubStart) / (scrubEnd - scrubStart), 0), 1);
        targetTime = scrollProgress * (video.duration - 0.05);

        // Interpolação suave (lerp) para scrubbing limpo
        currentVideoTime += (targetTime - currentVideoTime) * 0.18;

        if (!video.seeking && Math.abs(currentVideoTime - video.currentTime) > 0.02) {
          video.currentTime = currentVideoTime;
        }
      }
      requestAnimationFrame(renderVideoScrub);
    }
    requestAnimationFrame(renderVideoScrub);

    // Botão de alternar modo (Contínuo vs Scroll)
    if (videoModeBtn) {
      videoModeBtn.addEventListener('click', function () {
        if (!isVideoActive) return;
        isScrollSyncMode = !isScrollSyncMode;
        if (isScrollSyncMode) {
          video.pause();
          videoModeBtn.textContent = 'Modo: Scroll';
        } else {
          video.play();
          videoModeBtn.textContent = 'Modo: Rodando';
        }
      });
    }

    // Input file picker
    if (videoInput) {
      videoInput.addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (file) {
          var url = URL.createObjectURL(file);
          loadVideoSource(url, file.name);
        }
      });
    }

    // Drag & Drop no navegador
    window.addEventListener('dragover', function (e) {
      e.preventDefault();
      if (dropOverlay) dropOverlay.classList.add('is-active');
    });

    window.addEventListener('dragleave', function (e) {
      if (e.relatedTarget === null && dropOverlay) {
        dropOverlay.classList.remove('is-active');
      }
    });

    window.addEventListener('drop', function (e) {
      e.preventDefault();
      if (dropOverlay) dropOverlay.classList.remove('is-active');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        var file = e.dataTransfer.files[0];
        if (file.type.indexOf('video') !== -1 || file.name.match(/\.(mp4|webm|mov|ogg)$/i)) {
          var url = URL.createObjectURL(file);
          loadVideoSource(url, file.name);
        }
      }
    });
  }

  // 2. TECH MESH CANVAS (Fundo Sóbrio & Chic em Tons Prateados)
  var canvas = document.getElementById('techMeshCanvas');
  function initTechCanvas() {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var width = (canvas.width = window.innerWidth);
    var height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', function () {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    var numPoints = Math.min(Math.floor((width * height) / 22000), 55);
    var points = [];

    for (var i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.2 + 0.8
      });
    }

    function drawMesh() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';

      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (var j = i + 1; j < points.length; j++) {
          var p2 = points[j];
          var dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawMesh);
    }
    drawMesh();
  }

  // 3. HORIZONTAL SCROLL FOR MÉTODO COPENHAGEN SECTION (FLUIDO COM INÉRCIA LERP)
  function initCopenhagenHorizontalScroll() {
    var section = document.querySelector('.copenhagen-scroll-section');
    var track = document.querySelector('.copenhagen-track');
    var progressFill = document.getElementById('copenhagenProgress');
    if (!section || !track) return;

    var currentX = 0;
    var targetX = 0;
    var isTicking = false;

    function renderTrack() {
      if (window.innerWidth <= 800) {
        track.style.transform = 'none';
        isTicking = false;
        return;
      }

      var rect = section.getBoundingClientRect();
      var sectionHeight = section.offsetHeight;
      var windowHeight = window.innerHeight;

      // Progresso preciso de rolagem (0 a 1)
      var totalScrollable = sectionHeight - windowHeight;
      var currentScroll = -rect.top;
      var progress = totalScrollable > 0 ? Math.min(Math.max(currentScroll / totalScrollable, 0), 1) : 0;

      // Distância horizontal total confortável para os 6 cards
      var maxTranslate = Math.max(track.scrollWidth - window.innerWidth + 160, 900);
      targetX = -progress * maxTranslate;

      // Suavização por interpolação linear (lerp)
      currentX += (targetX - currentX) * 0.11;
      track.style.transform = 'translate3d(' + currentX.toFixed(2) + 'px, 0, 0)';

      if (progressFill) {
        progressFill.style.width = (progress * 100).toFixed(1) + '%';
      }

      if (Math.abs(targetX - currentX) > 0.15 || (progress > 0 && progress < 1)) {
        requestAnimationFrame(renderTrack);
      } else {
        isTicking = false;
      }
    }

    function onScroll() {
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(renderTrack);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    renderTrack();
  }

  // 4. TEXT ROLL ANIMATION (Elegante & Sutil)
  function initTextRoll() {
    var POWER3_OUT = 'cubic-bezier(0.215, 0.61, 0.355, 1)';

    // --- Botões CTA (já existente) ---
    var rollButtons = document.querySelectorAll('.btn-w[data-anim="text-hover"]');
    rollButtons.forEach(function (btn) {
      var textEl = btn.querySelector('.btn-text');
      if (!textEl || textEl.dataset.split) return;
      textEl.dataset.split = 'true';

      var rawText = textEl.textContent.trim();
      textEl.textContent = '';
      var chars = [];

      Array.prototype.forEach.call(rawText, function (ch) {
        var span = document.createElement('span');
        span.className = 'char';
        span.style.display = 'inline-block';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        textEl.appendChild(span);
        chars.push(span);
      });

      btn.addEventListener('mouseenter', function () {
        chars.forEach(function (c, i) {
          c.getAnimations().forEach(function (a) { a.cancel(); });
          c.animate(
            [
              { transform: 'translateY(0)' },
              { transform: 'translateY(-100%)' }
            ],
            { duration: 350, delay: i * 15, easing: POWER3_OUT, fill: 'forwards' }
          );
        });
      });

      btn.addEventListener('mouseleave', function () {
        chars.forEach(function (c, i) {
          c.getAnimations().forEach(function (a) { a.cancel(); });
          c.animate(
            [
              { transform: 'translateY(-100%)' },
              { transform: 'translateY(0)' }
            ],
            { duration: 350, delay: i * 15, easing: POWER3_OUT, fill: 'forwards' }
          );
        });
      });
    });
  }

  // 5. MOBILE MENU
  var hamBtn = document.querySelector('.nav-ham');
  var navLinks = document.querySelector('.nav-links');

  if (hamBtn && navLinks) {
    hamBtn.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
      });
    });
  }

  // 6. NAVBAR SCROLL (TRANSPARENTE NO TOPO, FOSCO AO ROLAR)
  function initNavbarScroll() {
    var nav = document.querySelector('.nav-wrap');
    if (!nav) return;
    function updateNav() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > 40) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // 7. SCROLL REVEAL CASCADE (TEXTOS E ELEMENTOS SE REVELANDO AO SUBIR E DESCER A PÁGINA)
  function initScrollReveal() {
    var revealSelectors = [
      '.hero-layout > *',
      '.hero-content > *',
      '.statement-section .statement-content > *',
      '.etec-highlight-media',
      '.etec-eyebrow-wrap',
      '.etec-highlight-content h2',
      '.etec-highlight-content p',
      '.etec-pill',
      '.editorial-gallery-section .section-head-layout > *',
      '.gallery-bento-grid > article',
      '.gallery-side-col > article',
      '.gallery-split-row > article',
      '.cards-fan-section .section-head-layout > *',
      '.cards-fan-wrapper',
      '.copenhagen-scroll-section .section-head-layout > *',
      '#off-track .section-head-layout > *',
      '.split-card',
      '.split-item',
      '.contact-headline-wrap > *',
      '.cta-box > div',
      '.contact-info-card'
    ];

    var elements = document.querySelectorAll(revealSelectors.join(', '));
    if (!elements || elements.length === 0) return;

    elements.forEach(function (el) {
      el.classList.add('reveal-on-scroll');
    });

    var staggerContainers = [
      '.hero-content',
      '.etec-highlight-content',
      '.etec-badges-row',
      '.section-head-layout',
      '.split-items',
      '.split-cards',
      '.contact-info-panel',
      '.gallery-split-row',
      '.gallery-side-col',
      '.cards-fan-wrapper',
      '.statement-content',
      '.contact-headline-wrap'
    ];

    staggerContainers.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (container) {
        var items = container.querySelectorAll(':scope > .reveal-on-scroll, :scope > * > .reveal-on-scroll');
        items.forEach(function (item, idx) {
          var delay = (idx * 0.12).toFixed(2) + 's';
          item.dataset.staggerDelay = delay;
          item.style.transitionDelay = delay;
        });
      });
    });

    // Motor de revelação bidirecional contínua (sobe e desce)
    function checkReveal() {
      var windowH = window.innerHeight || document.documentElement.clientHeight;

      elements.forEach(function (el) {
        var rect = el.getBoundingClientRect();

        // O elemento está visível no viewport (com margem de ativação confortável)
        var inView = (rect.top < windowH * 0.92) && (rect.bottom > windowH * 0.05);

        if (inView) {
          if (!el.classList.contains('is-revealed')) {
            if (el.dataset.staggerDelay) {
              el.style.transitionDelay = el.dataset.staggerDelay;
            }
            el.classList.add('is-revealed');
          }
        } else {
          // Quando o usuário rola para longe (subindo ou descendo e o elemento sai da tela),
          // remove a classe para reanimar imediatamente quando entrar de novo!
          if (el.classList.contains('is-revealed')) {
            el.style.transitionDelay = '0s';
            el.classList.remove('is-revealed');
          }
        }
      });
    }

    var isTicking = false;
    function onScrollCheck() {
      if (!isTicking) {
        requestAnimationFrame(function () {
          checkReveal();
          isTicking = false;
        });
        isTicking = true;
      }
    }

    window.addEventListener('scroll', onScrollCheck, { passive: true });
    window.addEventListener('resize', onScrollCheck, { passive: true });
    
    // Executa imediatamente e logo após o carregamento inicial dos assets
    checkReveal();
    setTimeout(checkReveal, 100);
    setTimeout(checkReveal, 400);
  }

  // DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    initSignatureIntro();
    initScrollVideo();
    initTechCanvas();
    initCopenhagenHorizontalScroll();
    initTextRoll();
    initNavbarScroll();
    initScrollReveal();
  });

})();
