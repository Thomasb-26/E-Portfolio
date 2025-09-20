const root = document.documentElement;
const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const themeToggle = document.querySelector('.theme-toggle');
const stats = document.querySelectorAll('.stat');
const sections = document.querySelectorAll('.reveal');
const projectCards = document.querySelectorAll('.project-card');
const yearSpan = document.getElementById('year');
const copyButtons = document.querySelectorAll('[data-copy]');
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

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

// --- Gradual blur hover for projects ---
projectCards.forEach((card) => {
  const updatePosition = (event) => {
    const rect = card.getBoundingClientRect();
    const relativeX = event?.clientX != null ? event.clientX - rect.left : rect.width / 2;
    const relativeY = event?.clientY != null ? event.clientY - rect.top : rect.height / 2;
    card.style.setProperty('--x', `${relativeX}px`);
    card.style.setProperty('--y', `${relativeY}px`);
  };

  const activate = (event) => {
    updatePosition(event);
    card.classList.add('active');
  };

  const resetActiveState = () => {
    card.classList.remove('active');
  };

  const clearPosition = () => {
    card.style.removeProperty('--x');
    card.style.removeProperty('--y');
  };

  card.addEventListener('pointerenter', activate);
  card.addEventListener('pointerdown', activate);
  card.addEventListener('pointermove', activate);
  card.addEventListener('focus', activate);
  card.addEventListener('pointerup', resetActiveState);
  card.addEventListener('pointercancel', () => {
    resetActiveState();
    clearPosition();
  });
  card.addEventListener('blur', () => {
    resetActiveState();
    clearPosition();
  });

  card.addEventListener('pointerleave', () => {
    resetActiveState();
    clearPosition();
  });
});

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
