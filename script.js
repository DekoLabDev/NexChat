/* NexChat — интерактив сайта */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Хедер: тень при скролле ---------- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Ripple на кнопках ---------- */
  document.querySelectorAll('[data-ripple]').forEach(el => {
    el.addEventListener('pointerdown', e => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.1;
      const wave = document.createElement('span');
      wave.className = 'ripple-wave';
      wave.style.width = wave.style.height = size + 'px';
      wave.style.left = (e.clientX - rect.left - size / 2) + 'px';
      wave.style.top = (e.clientY - rect.top - size / 2) + 'px';
      el.appendChild(wave);
      wave.addEventListener('animationend', () => wave.remove());
    });
  });

  /* ---------- Scroll-reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ---------- Ротатор слов в заголовке ---------- */
  const rotator = document.getElementById('rotator');
  const words = ['порядок', 'движ', 'уют', 'огонь'];
  if (rotator && !reducedMotion) {
    let wi = 0;
    setInterval(() => {
      wi = (wi + 1) % words.length;
      rotator.classList.add('swap');
      setTimeout(() => {
        rotator.textContent = words[wi];
      }, 210);
      setTimeout(() => rotator.classList.remove('swap'), 430);
    }, 2800);
  }

  /* ---------- Мокап чата: сообщения появляются по кругу ---------- */
  const chatBody = document.getElementById('chatBody');
  const typingMsg = document.getElementById('typingMsg');
  if (chatBody) {
    const msgs = [...chatBody.querySelectorAll('.msg')];
    const loopMs = reducedMotion ? 0 : 5200;

    const showAll = () => {
      msgs.forEach((m, i) => setTimeout(() => m.classList.add('show'), 350 + i * 650));
    };
    showAll();

    if (!reducedMotion) {
      setInterval(() => {
        msgs.forEach(m => m.classList.remove('show'));
        setTimeout(showAll, 700);
      }, loopMs);
    }

    // после «печатает…» показываем финальную реплику (уже в разметке — просто стилистическая пауза)
    if (typingMsg) typingMsg.addEventListener('transitionend', () => {}, { once: true });
  }

  /* ---------- Счётчики статистики ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = el => {
    const target = +el.dataset.count;
    const dur = 1300;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    if (reducedMotion) { el.textContent = target; return; }
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        runCounter(en.target);
        cio.unobserve(en.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(el => cio.observe(el));

  /* ---------- Табы команд ---------- */
  const tabs = document.querySelectorAll('.cmd-tab');
  const panels = document.querySelectorAll('.cmd-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.cat));
    });
  });

  /* ---------- Копирование команд по клику ---------- */
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = text => {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  document.querySelectorAll('.cmd-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd || chip.textContent.trim();
      navigator.clipboard?.writeText(cmd)
        .then(() => showToast('> ' + cmd + ' — скопировано'))
        .catch(() => showToast('> ' + cmd));
    });
  });

  /* ---------- FAQ: закрываем остальные ---------- */
  const faqs = document.querySelectorAll('.faq');
  faqs.forEach(d => {
    d.addEventListener('toggle', () => {
      if (d.open) faqs.forEach(o => { if (o !== d) o.open = false; });
    });
  });
})();
