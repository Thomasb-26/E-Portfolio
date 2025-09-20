const root = document.documentElement;
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const themeToggle = document.querySelector('.theme-toggle');
const stats = document.querySelectorAll('.stat');
const sections = document.querySelectorAll('.reveal');
const yearSpan = document.getElementById('year');
const copyButtons = document.querySelectorAll('[data-copy]');
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
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

const runDecryptEffect = (element) => {
  const originalText = element.dataset.decrypt || element.textContent || '';
  const originalHtml = element.dataset.originalHtml || element.innerHTML;
  const totalFrames = Math.max(originalText.length * 4, 48);
  let frame = 0;

  element.dataset.animating = 'true';

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

    element.textContent = nextValue;
    frame += 1;

    if (frame <= totalFrames) {
      requestAnimationFrame(animate);
    } else {
      element.innerHTML = originalHtml;
      element.dataset.animating = 'false';
    }
  };

  requestAnimationFrame(animate);
};

decryptElements.forEach((element) => {
  const originalHtml = element.innerHTML;
  const fallbackText = element.dataset.decrypt || element.textContent || '';
  if (!fallbackText.trim()) return;
  element.dataset.originalHtml = originalHtml;
  element.dataset.decrypt = fallbackText;

  if (prefersReducedMotion.matches) {
    element.innerHTML = originalHtml;
    return;
  }

  runDecryptEffect(element);

  element.addEventListener('pointerenter', () => {
    if (element.dataset.animating === 'true') return;
    runDecryptEffect(element);
  });

  element.addEventListener('focus', () => {
    if (element.dataset.animating === 'true') return;
    runDecryptEffect(element);
  });
});

// --- Theme toggle ---
const THEME_KEY = 'tb-portfolio-theme';
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme) {
  root.setAttribute('data-theme', savedTheme);
}

themeToggle?.addEventListener('click', () => {
  const currentTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', currentTheme);
  localStorage.setItem(THEME_KEY, currentTheme);
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
const SPARK_COLOR = '#7c4dff';
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

// --- Animated particle background ---
const particles = [];
const particleCount = 60;
let animationFrameId;

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

const createParticles = () => {
  particles.length = 0;
  for (let i = 0; i < particleCount; i += 1) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.6,
      speedY: (Math.random() - 0.5) * 0.6,
    });
  }
};

const drawParticles = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 245, 212, 0.6)';
  particles.forEach((particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = 'rgba(0, 245, 212, 0.15)';
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      if (distance < 120) {
        ctx.globalAlpha = 1 - distance / 120;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
};

const updateParticles = () => {
  particles.forEach((particle) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < 0 || particle.x > canvas.width) {
      particle.speedX *= -1;
    }
    if (particle.y < 0 || particle.y > canvas.height) {
      particle.speedY *= -1;
    }
  });
};

const animate = () => {
  drawParticles();
  updateParticles();
  animationFrameId = requestAnimationFrame(animate);
};

const initCanvas = () => {
  resizeCanvas();
  createParticles();
  cancelAnimationFrame(animationFrameId);
  animate();
};

window.addEventListener('resize', () => {
  resizeCanvas();
  createParticles();
});

if (canvas && ctx) {
  initCanvas();
}
