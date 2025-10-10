const root = document.documentElement;
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const themeToggle = document.querySelector('.theme-toggle');
const themeToggleLabel = themeToggle?.querySelector('.theme-toggle__label');
const stats = document.querySelectorAll('.stat');
const sections = document.querySelectorAll('.reveal');
const yearSpan = document.getElementById('year');
const copyButtons = document.querySelectorAll('[data-copy]');
const backgroundRoot = document.querySelector('.site-background');
const decryptElements = document.querySelectorAll('[data-decrypt]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// --- Responsive navigation ---
navToggle?.addEventListener('click', () => {
  nav?.classList.toggle('open');
  navToggle.classList.toggle('open');
});

document.addEventListener('click', (event) => {
  if (!nav?.contains(event.target) && !navToggle?.contains(event.target)) {
    nav?.classList.remove('open');
    navToggle?.classList.remove('open');
  }
});

// --- Scroll-based header state ---
const toggleScrolledHeader = () => {
  if (window.scrollY > 40) {
    header?.classList.add('scrolled');
  } else {
    header?.classList.remove('scrolled');
  }
};
window.addEventListener('scroll', toggleScrolledHeader);

toggleScrolledHeader();

// --- Smooth active link indicator ---
const observerOptions = {
  threshold: 0.3,
};

const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const id = entry.target.getAttribute('id');
    const link = navLinks.find((navLink) => navLink.getAttribute('href') === `#${id}`);
    if (!link) return;

    if (entry.isIntersecting) {
      navLinks.forEach((navLink) => navLink.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, observerOptions);

sections.forEach((section) => sectionObserver.observe(section));

// --- Reveal animations ---
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

sections.forEach((section) => revealObserver.observe(section));

// --- Animated statistics ---
const statObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const stat = entry.target;
      const valueEl = stat.querySelector('.stat-value');
      const target = Number(stat.dataset.target || 0);
      let current = 0;
      const step = Math.max(1, Math.round(target / 50));

      const updateValue = () => {
        current += step;
        if (current >= target) {
          current = target;
          stat.classList.add('active');
          valueEl.textContent = `${target}%`;
          return;
        }
        valueEl.textContent = `${current}%`;
        requestAnimationFrame(updateValue);
      };

      requestAnimationFrame(updateValue);
      observer.unobserve(stat);
    });
  },
  { threshold: 0.5 }
);

stats.forEach((stat) => statObserver.observe(stat));

// --- Decrypted text effect ---
const scrambleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+-=?';

const lockDecryptHeight = (element) => {
  const rect = element.getBoundingClientRect();
  element.style.setProperty('--decrypt-min-height', `${rect.height}px`);
  element.classList.add('decrypt-locked');
};

const ensureDecryptStructure = (element, fallbackText) => {
  let contentWrapper = element.querySelector('.decrypt-content');
  if (!contentWrapper) {
    contentWrapper = document.createElement('span');
    contentWrapper.className = 'decrypt-content';
    const fragment = document.createDocumentFragment();
    while (element.firstChild) {
      fragment.appendChild(element.firstChild);
    }
    contentWrapper.appendChild(fragment);
    element.appendChild(contentWrapper);
  }

  let overlay = element.querySelector('.decrypt-overlay');
  if (!overlay) {
    overlay = document.createElement('span');
    overlay.className = 'decrypt-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    element.appendChild(overlay);
  }

  overlay.textContent = fallbackText;

  return { contentWrapper, overlay };
};

const runDecryptEffect = (element) => {
  if (element.dataset.played === 'true') return;
  const overlay = element.querySelector('.decrypt-overlay');
  const originalText = element.dataset.decrypt || overlay?.textContent || '';
  if (!overlay || !originalText) return;

  const totalFrames = Math.max(Math.floor(originalText.length * 1.3), 20);
  let frame = 0;

  element.dataset.animating = 'true';
  element.classList.add('decrypt-animating');

  const animate = () => {
    const progress = frame / totalFrames;
    const revealCount = Math.floor(progress * originalText.length);
    const nextValue = originalText
      .split('')
      .map((char, index) => {
        if (char === ' ') {
          return ' ';
        }
        if (index < revealCount) {
          return char;
        }
        return scrambleCharacters.charAt(
          Math.floor(Math.random() * scrambleCharacters.length)
        );
      })
      .join('');

    overlay.textContent = nextValue;
    frame += 1;

    if (frame <= totalFrames) {
      requestAnimationFrame(animate);
    } else {
      overlay.textContent = originalText;
      element.dataset.animating = 'false';
      element.classList.remove('decrypt-animating');
      element.dataset.played = 'true';
    }
  };

  requestAnimationFrame(animate);
};

decryptElements.forEach((element) => {
  const fallbackText = element.dataset.decrypt || element.textContent || '';
  if (!fallbackText.trim()) return;
  element.dataset.decrypt = fallbackText;
  ensureDecryptStructure(element, fallbackText);
  lockDecryptHeight(element);

  if (prefersReducedMotion.matches) {
    return;
  }

  runDecryptEffect(element);
});

// --- Theme toggle ---
const THEME_KEY = 'tb-portfolio-theme';
const DEFAULT_THEME = 'dark';
const savedTheme = localStorage.getItem(THEME_KEY);
const initialTheme = savedTheme || root.getAttribute('data-theme') || DEFAULT_THEME;

const updateThemeToggleLabel = (theme) => {
  const nextTheme = theme === 'light' ? 'dark' : 'light';
  const labelText = nextTheme === 'dark' ? 'Mode sombre' : 'Mode clair';
  if (themeToggleLabel) {
    themeToggleLabel.textContent = labelText;
  }
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', `Activer le ${labelText.toLowerCase()}`);
    themeToggle.setAttribute('title', `Activer le ${labelText.toLowerCase()}`);
  }
};

const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeToggleLabel(theme);
};

applyTheme(initialTheme);

themeToggle?.addEventListener('click', () => {
  const currentTheme = root.getAttribute('data-theme') || DEFAULT_THEME;
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(nextTheme);
});

// --- Footer year ---
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// --- Copy to clipboard ---
const feedback = document.querySelector('.copy-feedback');
copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const text = button.dataset.copy;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (feedback) {
        feedback.textContent = 'Adresse copiée dans le presse-papiers !';
        setTimeout(() => {
          feedback.textContent = '';
        }, 2500);
      }
    } catch (error) {
      if (feedback) {
        feedback.textContent = 'Impossible de copier automatiquement. Sélectionnez le texte.';
      }
    }
  });
});

// --- Click spark animation ---
const SPARK_COLOR = '#ff2d20';
const SPARK_SIZE = 26;
const SPARK_RADIUS = 115;
const SPARK_COUNT = 10;
const SPARK_DURATION = 500;
const SPARK_EXTRA_SCALE = 1;

const spawnClickSpark = (x, y) => {
  if (prefersReducedMotion.matches) return;

  for (let index = 0; index < SPARK_COUNT; index += 1) {
    const spark = document.createElement('span');
    const angle = (Math.PI * 2 * index) / SPARK_COUNT + Math.random() * 0.3;
    const distance = SPARK_RADIUS * (0.9 + Math.random() * 0.2);
    const translateX = Math.cos(angle) * distance;
    const translateY = Math.sin(angle) * distance;

    spark.className = 'click-spark';
    spark.style.setProperty('--spark-color', SPARK_COLOR);
    spark.style.setProperty('--spark-size', `${SPARK_SIZE}px`);
    spark.style.setProperty('--spark-duration', `${SPARK_DURATION}ms`);
    spark.style.setProperty('--spark-x', `${x}px`);
    spark.style.setProperty('--spark-y', `${y}px`);
    spark.style.setProperty('--spark-tx', `${translateX}px`);
    spark.style.setProperty('--spark-ty', `${translateY}px`);
    spark.style.setProperty('--spark-scale', SPARK_EXTRA_SCALE);

    document.body.appendChild(spark);

    requestAnimationFrame(() => {
      spark.classList.add('active');
    });

    setTimeout(() => {
      spark.remove();
    }, SPARK_DURATION + 60);
  }
};

window.addEventListener('pointerdown', (event) => {
  if (prefersReducedMotion.matches) return;
  if (!event.isPrimary) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  if (event.clientX === 0 && event.clientY === 0) return;

  spawnClickSpark(event.clientX, event.clientY);
});

// --- Prevent default form submission ---
const contactForm = document.querySelector('.contact-form');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formNote = contactForm.querySelector('.form-note');
  if (formNote) {
    formNote.textContent = 'Merci pour votre message ! Je vous répondrai rapidement.';
  }
  contactForm.reset();
});

// --- Animated portfolio backdrop ---
const ORB_COUNT = 0;

const clearOrbs = () => {
  if (!backgroundRoot) return;
  backgroundRoot.querySelectorAll('.bg-orb').forEach((orb) => orb.remove());
};

const createOrb = () => {
  if (!backgroundRoot) return null;
  const orb = document.createElement('span');
  const size = 160 + Math.random() * 240;
  const duration = 16 + Math.random() * 26;
  const driftX = (Math.random() - 0.5) * 110;
  const driftY = (Math.random() - 0.5) * 60;
  const isYellowHighlight = Math.random() > 0.76;
  const hueBase = isYellowHighlight ? 45 + Math.random() * 10 : 6 + Math.random() * 12;
  const opacity = isYellowHighlight ? 0.18 + Math.random() * 0.2 : 0.3 + Math.random() * 0.28;
  const rotation = (Math.random() - 0.5) * 36;
  const scale = 1.25 + Math.random() * 0.7;
  const thickness = isYellowHighlight ? 0.24 + Math.random() * 0.08 : 0.3 + Math.random() * 0.12;

  orb.className = 'bg-orb';
  orb.style.setProperty('--orb-size', `${size}px`);
  orb.style.setProperty('--orb-duration', `${duration}s`);
  orb.style.setProperty('--orb-delay', `${Math.random() * -duration}s`);
  orb.style.setProperty('--orb-x', `${Math.random() * 100}%`);
  orb.style.setProperty('--orb-y', `${Math.random() * 100}%`);
  orb.style.setProperty('--orb-drift-x', `${driftX}px`);
  orb.style.setProperty('--orb-drift-y', `${driftY}px`);
  orb.style.setProperty('--orb-hue', `${hueBase}`);
  orb.style.setProperty('--orb-opacity', `${opacity}`);
  orb.style.setProperty('--orb-rotation', `${rotation}deg`);
  orb.style.setProperty('--orb-scale', `${scale}`);
  orb.style.setProperty('--orb-thickness', `${thickness}`);

  backgroundRoot.appendChild(orb);
  return orb;
};

const buildBackgroundOrbs = () => {
  if (!backgroundRoot) return;
  clearOrbs();
  if (prefersReducedMotion.matches) return;
  for (let index = 0; index < ORB_COUNT; index += 1) {
    createOrb();
  }
};

if (backgroundRoot) {
  buildBackgroundOrbs();
  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', buildBackgroundOrbs);
  } else if (typeof prefersReducedMotion.addListener === 'function') {
    prefersReducedMotion.addListener(buildBackgroundOrbs);
  }
}
