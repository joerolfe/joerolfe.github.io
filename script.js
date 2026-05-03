// Enable JS styling
document.documentElement.classList.remove("no-js");

// ===== Theme Toggle =====
const root = document.documentElement;
const toggle = document.getElementById("themeToggle");
const sun = toggle.querySelector('[data-icon="sun"]');
const moon = toggle.querySelector('[data-icon="moon"]');

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  if (theme === "dark") {
    sun.style.display = "inline-grid";
    moon.style.display = "none";
  } else {
    sun.style.display = "none";
    moon.style.display = "inline-grid";
  }
}

const saved = localStorage.getItem("theme");
const prefersDark =
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

setTheme(saved || (prefersDark ? "dark" : "dark"));

toggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});

// Switch to light theme for printing, restore after
window.onbeforeprint = () => root.setAttribute("data-theme", "light");
window.onafterprint = () => setTheme(localStorage.getItem("theme") || "dark");

// ===== Mobile Menu =====
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");

burger?.addEventListener("click", () => {
  mobileMenu.classList.toggle("show");
  const open = mobileMenu.classList.contains("show");
  mobileMenu.setAttribute("aria-hidden", String(!open));
});

mobileMenu?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    mobileMenu.classList.remove("show");
    mobileMenu.setAttribute("aria-hidden", "true");
  });
});

// ===== Sliding Nav Indicator (Apple style) =====
const navContainer = document.querySelector(".nav-links");
const navIndicator = document.querySelector(".nav-indicator");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));

function updateNavIndicator() {
  if (!navContainer || !navIndicator) return;

  const active = navContainer.querySelector("a.active");
  if (!active) {
    navIndicator.style.opacity = "0";
    navIndicator.style.width = "0px";
    return;
  }

  const navRect = navContainer.getBoundingClientRect();
  const linkRect = active.getBoundingClientRect();

  const left = linkRect.left - navRect.left;
  const width = linkRect.width;

  navIndicator.style.opacity = "1";
  navIndicator.style.width = `${width}px`;
  navIndicator.style.transform = `translateX(${left}px)`;
}

function setActive(hash) {
  navLinks.forEach((a) =>
    a.classList.toggle("active", a.getAttribute("href") === hash)
  );
  updateNavIndicator();
}

// ===== Section tracking (fixes missing About/Experience/Contact) =====
const sectionIds = ["about", "projects", "skills", "experience", "education", "certifications", "contact"];
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

// 1) IntersectionObserver (more forgiving)
const obs = new IntersectionObserver(
  (entries) => {
    // choose the visible section closest to the top
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

    if (!visible) return;
    setActive(`#${visible.target.id}`);
  },
  {
    root: null,
    rootMargin: "-20% 0px -70% 0px", // softer than before
    threshold: [0, 0.01, 0.1, 0.2],
  }
);

sections.forEach((s) => obs.observe(s));

// 2) Fallback: on scroll, pick closest section to the header
function setActiveOnScrollFallback() {
  const header = document.querySelector(".header");
  const headerHeight = header ? header.offsetHeight : 64;

  const line = headerHeight + 12; // a point just under the sticky header

  let best = null;
  let bestDist = Infinity;

  for (const s of sections) {
    const top = s.getBoundingClientRect().top;
    const dist = Math.abs(top - line);

    if (dist < bestDist) {
      bestDist = dist;
      best = s;
    }
  }

  if (best) setActive(`#${best.id}`);
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    setActiveOnScrollFallback();
    ticking = false;
  });
}, { passive: true });

// Keep indicator correct on resize + initial load
window.addEventListener("resize", updateNavIndicator);
window.addEventListener("load", () => {
  // set initial active state
  setActiveOnScrollFallback();
  updateNavIndicator();
});

// ===== Contact form: FormSubmit.co (no signup needed) =====
const FORMSPREE_ENDPOINT = "https://formsubmit.co/ajax/jrolfe477@gmail.com";

const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const formStatus = document.getElementById("formStatus");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      form.reset();
      formStatus.textContent = "Message sent! I'll get back to you soon.";
      formStatus.style.display = "block";
      formStatus.style.background = "rgba(255,106,61,.08)";
      formStatus.style.border = "1px solid rgba(255,106,61,.25)";
      formStatus.style.color = "var(--accent)";
      submitBtn.textContent = "Sent!";
    } else {
      throw new Error("Failed");
    }
  } catch {
    formStatus.textContent = "Something went wrong. Please email me directly at jrolfe477@gmail.com";
    formStatus.style.display = "block";
    formStatus.style.background = "rgba(255,80,80,.08)";
    formStatus.style.border = "1px solid rgba(255,80,80,.25)";
    formStatus.style.color = "#ff6b6b";
    submitBtn.disabled = false;
    submitBtn.innerHTML = `Send Message <span class="btn-ic"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg></span>`;
  }
});

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Dynamic cert count — counts cards on certifications.html, caches in localStorage
const certCards = document.querySelectorAll('.cert-card-full');
if (certCards.length) {
  localStorage.setItem('certCount', certCards.length);
}
const certCountEl = document.querySelector('.cert-count');
if (certCountEl) {
  const cached = localStorage.getItem('certCount');
  if (cached) certCountEl.textContent = cached;
}

// ===== Reading progress % =====
const readProgress = document.getElementById("readProgress");
if (readProgress) {
  window.addEventListener("scroll", () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.round((window.scrollY / docHeight) * 100) : 0;
    if (pct > 0) {
      readProgress.style.display = "inline";
      readProgress.textContent = pct + "%";
    } else {
      readProgress.style.display = "none";
    }
  }, { passive: true });
}

// ===== Back to top =====
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  backToTop.classList.toggle("visible", window.scrollY > 400);
}, { passive: true });
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== Scroll animations =====
document.querySelectorAll(".section, .card, .cert-grid .card").forEach(el => {
  el.classList.add("fade-up");
});
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("in-view");
      fadeObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll(".fade-up").forEach(el => fadeObs.observe(el));
