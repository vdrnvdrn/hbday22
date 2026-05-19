document.addEventListener('DOMContentLoaded', () => {
  /* ===== DOM ELEMENTS ===== */
  const scrollContainer = document.getElementById('scrollContainer');
  const screens = document.querySelectorAll('.screen');
  const dotsContainer = document.getElementById('progressDots');
  const musicControl = document.getElementById('musicControl');
  const musicIconOn = document.getElementById('musicIconOn');
  const musicIconOff = document.getElementById('musicIconOff');
  const bgMusic = document.getElementById('bgMusic');
  const cake = document.getElementById('cake');
  const blowInstruction = document.getElementById('blowInstruction');
  const wishMessage = document.getElementById('wishMessage');
  const typewriterText = document.getElementById('typewriterText');
  const fireworksCanvas = document.getElementById('fireworksCanvas');

  const totalScreens = screens.length;
  let currentScreen = 0;
  let confettiStarted = false;
  let musicPlaying = false;
  let candlesBlown = false;
  let typewriterStarted = false;
  let musicTriggered = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== PROGRESS DOTS ===== */
  for (let i = 0; i < totalScreens; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-label', `Экран ${i + 1}`);
    dot.setAttribute('tabindex', '0');
    dotsContainer.appendChild(dot);
  }
  const dots = dotsContainer.querySelectorAll('.dot');

  /* ===== SCROLL TRACKING ===== */
  const updateActiveScreen = () => {
    const scrollTop = scrollContainer.scrollTop;
    const screenHeight = scrollContainer.clientHeight;
    const index = Math.round(scrollTop / screenHeight);
    if (index !== currentScreen && index >= 0 && index < totalScreens) {
      currentScreen = index;
      dots.forEach((d, i) => d.classList.toggle('active', i === currentScreen));
      if (currentScreen === totalScreens - 1 && !confettiStarted) {
        confettiStarted = true;
        if (!prefersReducedMotion) {
          startConfettiFinal();
        }
      }
      // Try to start music on first swipe/scroll interaction
      if (!musicTriggered && currentScreen > 0) {
        musicTriggered = true;
        tryPlayMusic();
      }
    }
  };
  scrollContainer.addEventListener('scroll', updateActiveScreen, { passive: true });

  /* ===== INTERSECTION OBSERVER ===== */
  const observerOptions = { root: scrollContainer, threshold: 0.4 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Start typewriter if this is chatbox screen
        if (entry.target.querySelector('.typewriter-text') && !typewriterStarted) {
          typewriterStarted = true;
          runTypewriter();
        }
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, observerOptions);
  screens.forEach(screen => observer.observe(screen));

  /* ===== TYPEWRITER ===== */
  const typewriterMessage = 'Алена! Я хотел сказать тебе кое-что важное... Ты самая удивительная девушка на свете, и я так рад, что ты есть в моей жизни. Спасибо за каждую минуту вместе.';
  function runTypewriter() {
    if (!typewriterText) return;
    typewriterText.classList.remove('done');
    typewriterText.textContent = '';
    let i = 0;
    const speed = prefersReducedMotion ? 15 : 45;
    function type() {
      if (i < typewriterMessage.length) {
        typewriterText.textContent += typewriterMessage.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        typewriterText.classList.add('done');
      }
    }
    type();
  }

  /* ===== NAVIGATION ===== */
  const goToScreen = (index) => {
    if (index >= 0 && index < totalScreens) {
      screens[index].scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToScreen(index));
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToScreen(index);
      }
    });
  });

  /* ===== KEYBOARD ===== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      goToScreen(currentScreen + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      goToScreen(currentScreen - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToScreen(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToScreen(totalScreens - 1);
    }
  });

  /* ===== TOUCH SWIPE ===== */
  let touchStartY = 0;
  scrollContainer.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  scrollContainer.addEventListener('touchend', (e) => {
    const deltaY = touchStartY - e.changedTouches[0].screenY;
    if (Math.abs(deltaY) > 50) {
      goToScreen(deltaY > 0 ? currentScreen + 1 : currentScreen - 1);
    }
  }, { passive: true });

  /* ===== CAKE INTERACTION ===== */
  if (cake) {
    cake.addEventListener('click', () => {
      if (candlesBlown) return;
      candlesBlown = true;
      const candles = cake.querySelectorAll('.candle');
      candles.forEach((c, i) => {
        setTimeout(() => c.classList.add('out'), i * 200);
      });
      setTimeout(() => {
        blowInstruction.style.display = 'none';
        wishMessage.classList.add('show');
        if (!prefersReducedMotion) {
          for (let i = 0; i < 5; i++) {
            setTimeout(() => createFirework(), i * 300);
          }
        }
      }, 900);
    });
  }

  /* ===== FIREWORKS ===== */
  function createFirework() {
    if (!fireworksCanvas) return;
    const ctx = fireworksCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    fireworksCanvas.width = fireworksCanvas.offsetWidth * dpr;
    fireworksCanvas.height = fireworksCanvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#c41e3a', '#ffb7c5', '#ffd54f', '#ff6b81', '#ffffff'];
    const particles = [];
    const originX = Math.random() * fireworksCanvas.offsetWidth * 0.6 + fireworksCanvas.offsetWidth * 0.2;
    const originY = Math.random() * fireworksCanvas.offsetHeight * 0.4 + fireworksCanvas.offsetHeight * 0.1;

    for (let i = 0; i < 36; i++) {
      const angle = (Math.PI * 2 * i) / 36;
      const velocity = 2 + Math.random() * 2.5;
      particles.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        size: 2 + Math.random() * 2
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, fireworksCanvas.offsetWidth, fireworksCanvas.offsetHeight);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.alpha -= 0.012;
        if (p.alpha > 0) {
          alive = true;
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      frame++;
      if (alive && frame < 120) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, fireworksCanvas.offsetWidth, fireworksCanvas.offsetHeight);
      }
    }
    animate();
  }

  /* ===== CONFETTI FINAL ===== */
  function startConfettiFinal() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const colors = ['#ffb7c5', '#ff6b81', '#ffd700', '#ffffff', '#c41e3a', '#ffc0cb', '#e85d75'];
    const particles = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight - canvas.offsetHeight,
        size: Math.random() * 6 + 3,
        speedY: Math.random() * 1.5 + 0.8,
        speedX: (Math.random() - 0.5) * 1.2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.4 + 0.6,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }

    let duration = 0;
    const maxDuration = 480;
    let active = true;

    function draw() {
      if (!active) return;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      duration++;
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.offsetHeight) {
          p.y = -20;
          p.x = Math.random() * canvas.offsetWidth;
        }
        const fade = duration > maxDuration - 90 ? Math.max(0, (maxDuration - duration) / 90) : 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = fade * p.opacity;
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      });
      if (duration < maxDuration) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        active = false;
      }
    }
    draw();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) active = false;
    });
  }

  /* ===== AMBIENT CONFETTI (light) ===== */
  function startConfettiAmbient() {
    const colors = ['#c41e3a', '#ffb7c5', '#ffd54f'];
    const interval = setInterval(() => {
      if (document.hidden) return;
      const c = document.createElement('div');
      c.style.position = 'absolute';
      c.style.width = '6px';
      c.style.height = '6px';
      c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      c.style.left = Math.random() * 90 + 5 + '%';
      c.style.top = '-10px';
      c.style.zIndex = '40';
      c.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      c.style.pointerEvents = 'none';
      c.style.animation = `confetti-fall ${3 + Math.random() * 2}s linear forwards`;
      scrollContainer.appendChild(c);
      setTimeout(() => c.remove(), 6000);
    }, 500);
    // Stop after 30 seconds
    setTimeout(() => clearInterval(interval), 30000);
  }

  /* Add confetti-fall keyframes dynamically */
  const confettiStyle = document.createElement('style');
  confettiStyle.textContent = `
    @keyframes confetti-fall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100dvh) rotate(720deg); opacity: 0; }
    }
  `;
  document.head.appendChild(confettiStyle);

  /* ===== MUSIC CONTROL ===== */
  function updateMusicIcon() {
    if (musicPlaying) {
      musicIconOn.style.display = 'block';
      musicIconOff.style.display = 'none';
    } else {
      musicIconOn.style.display = 'none';
      musicIconOff.style.display = 'block';
    }
  }

  function tryPlayMusic() {
    bgMusic.volume = 0.6;
    bgMusic.play().then(() => {
      musicPlaying = true;
      updateMusicIcon();
    }).catch(() => {
      // Autoplay blocked, user can tap music button
    });
  }

  musicControl.addEventListener('click', () => {
    if (musicPlaying) {
      bgMusic.pause();
      musicPlaying = false;
    } else {
      bgMusic.play().then(() => {
        musicPlaying = true;
      }).catch(() => {});
    }
    updateMusicIcon();
  });

  musicControl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      musicControl.click();
    }
  });

  /* ===== BALLOONS ===== */
  function startBalloons() {
    const balloonImages = [
      'pngs/62c6e7528aac2835a0a2dae848223eb3.png',
      'pngs/0e29da21bfc055c2dbacd19f055c58eb.png',
      'pngs/8f0e7ae7bb8598b129c1e5a7b7aeec5b.png',
      'pngs/3191e9787e1c2ab519bd0a203c6f3c56.png'
    ];
    const interval = setInterval(() => {
      if (document.hidden) return;
      const b = document.createElement('div');
      b.className = 'balloon';
      const img = document.createElement('img');
      img.src = balloonImages[Math.floor(Math.random() * balloonImages.length)];
      img.alt = '';
      b.appendChild(img);
      b.style.left = Math.random() * 80 + 10 + '%';
      b.style.animationDuration = (10 + Math.random() * 8) + 's';
      b.style.animationDelay = (Math.random() * 2) + 's';
      scrollContainer.appendChild(b);
      setTimeout(() => b.remove(), 20000);
    }, 2500);
    // Stop after 60 seconds
    setTimeout(() => clearInterval(interval), 60000);
  }

  /* ===== RESIZE ===== */
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => goToScreen(currentScreen), 150);
  });

  /* ===== INITIAL ===== */
  musicControl.classList.add('visible');
  startBalloons();
  if (!prefersReducedMotion) {
    startConfettiAmbient();
  }
  updateActiveScreen();
  if (screens.length > 0) screens[0].classList.add('in-view');
});
