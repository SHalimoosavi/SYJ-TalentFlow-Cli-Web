/**
 * SYJ TalentFlow CLI — site behavior.
 * Vanilla ES module, no build step, no dependencies.
 */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----------------------------------------------------------------------
   Footer year
   ---------------------------------------------------------------------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ----------------------------------------------------------------------
   Mobile nav toggle
   ---------------------------------------------------------------------- */
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('primary-nav');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ----------------------------------------------------------------------
   Copy-to-clipboard (install snippet)
   ---------------------------------------------------------------------- */
const copyBtn = document.getElementById('copy-install');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const text = copyBtn.getAttribute('data-copy') || '';
    const label = copyBtn.querySelector('[data-label]');
    try {
      await navigator.clipboard.writeText(text);
      if (label) {
        const original = label.textContent;
        label.textContent = 'Copied!';
        setTimeout(() => {
          label.textContent = original;
        }, 1800);
      }
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently,
      // the command is still visible and selectable in the snippet.
    }
  });
}

/* ----------------------------------------------------------------------
   Hero terminal typing animation
   ---------------------------------------------------------------------- */
function typeHeroTerminal() {
  const typedEl = document.getElementById('hero-typed');
  const caretEl = document.getElementById('hero-caret');
  const outputEl = document.getElementById('hero-output');
  if (!typedEl || !outputEl) return;

  const command = 'talentflow screen --jd jobs/backend.txt --resumes resumes/';

  if (prefersReducedMotion) {
    typedEl.textContent = command;
    outputEl.classList.add('show');
    if (caretEl) caretEl.style.display = 'none';
    return;
  }

  let i = 0;
  const speed = 32;

  function step() {
    if (i <= command.length) {
      typedEl.textContent = command.slice(0, i);
      i += 1;
      setTimeout(step, speed);
    } else {
      setTimeout(() => {
        outputEl.classList.add('show');
        if (caretEl) caretEl.style.opacity = '0.4';
      }, 400);
    }
  }

  // Only start once the terminal is scrolled into view.
  const terminal = document.getElementById('hero-terminal');
  if (!terminal || !('IntersectionObserver' in window)) {
    step();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          step();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  observer.observe(terminal);
}
typeHeroTerminal();

/* ----------------------------------------------------------------------
   CLI demo tabs (accessible tablist pattern)
   ---------------------------------------------------------------------- */
function initCliTabs() {
  const tabs = Array.from(document.querySelectorAll('.cli-tab'));
  const panels = Array.from(document.querySelectorAll('.cli-panel'));
  if (!tabs.length) return;

  function activate(tab) {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.setAttribute('data-active', String(panel.id === tab.getAttribute('data-target')));
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (e) => {
      let newIndex = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') newIndex = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') newIndex = (index - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') newIndex = 0;
      if (e.key === 'End') newIndex = tabs.length - 1;
      if (newIndex !== null) {
        e.preventDefault();
        tabs[newIndex].focus();
        activate(tabs[newIndex]);
      }
    });
  });
}
initCliTabs();

/* ----------------------------------------------------------------------
   GitHub live repository stats (progressive enhancement)
   Fails silently and keeps static fallback values if offline / rate-limited.
   ---------------------------------------------------------------------- */
async function loadGithubStats() {
  const container = document.getElementById('gh-stats');
  if (!container) return;
  const repo = container.getAttribute('data-repo');
  if (!repo) return;

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return;
    const data = await res.json();

    setStat('stars', formatCount(data.stargazers_count));
    setStat('forks', formatCount(data.forks_count));
    setStat('issues', formatCount(data.open_issues_count));
    if (data.license && data.license.spdx_id) setStat('license', data.license.spdx_id);

    // Latest release (separate endpoint; tolerate 404 for pre-release repos)
    try {
      const relRes = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (relRes.ok) {
        const rel = await relRes.json();
        if (rel.tag_name) setStat('release', rel.tag_name);
      }
    } catch {
      /* keep static fallback */
    }

    // Contributor count (approximate via header pagination, tolerate failure)
    try {
      const contribRes = await fetch(`https://api.github.com/repos/${repo}/contributors?per_page=1&anon=true`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (contribRes.ok) {
        const link = contribRes.headers.get('link');
        if (link) {
          const match = link.match(/&page=(\d+)>; rel="last"/);
          if (match) setStat('contributors', match[1]);
        } else {
          const arr = await contribRes.json();
          if (Array.isArray(arr)) setStat('contributors', String(arr.length));
        }
      }
    } catch {
      /* keep static fallback */
    }
  } catch {
    // Offline, rate-limited, or blocked — static fallback values remain.
  }
}

function setStat(key, value) {
  const el = document.querySelector(`[data-stat="${key}"]`);
  if (el) el.textContent = value;
}

function formatCount(n) {
  if (typeof n !== 'number') return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
loadGithubStats();

/* ----------------------------------------------------------------------
   Site search (backs the WebSite SearchAction: ?q=term)
   Filters/highlights FAQ + section headings and scrolls to first match.
   ---------------------------------------------------------------------- */
function runSiteSearch(term) {
  const query = term.trim().toLowerCase();
  if (!query) return;

  const candidates = Array.from(document.querySelectorAll('main section, .faq-item'));
  let firstMatch = null;

  for (const node of candidates) {
    const text = node.textContent.toLowerCase();
    if (text.includes(query)) {
      firstMatch = node;
      break;
    }
  }

  if (firstMatch) {
    if (firstMatch.tagName === 'DETAILS') firstMatch.open = true;
    firstMatch.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    firstMatch.style.transition = 'box-shadow 0.4s ease';
    firstMatch.style.boxShadow = '0 0 0 2px rgba(34,211,238,0.6)';
    setTimeout(() => {
      firstMatch.style.boxShadow = '';
    }, 1600);
  }
}

const searchForm = document.getElementById('site-search-form');
if (searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('site-search');
    if (input) runSiteSearch(input.value);
  });
}

// Support deep links from the WebSite SearchAction (?q=term)
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get('q');
if (initialQuery) {
  const input = document.getElementById('site-search');
  if (input) input.value = initialQuery;
  window.addEventListener('load', () => runSiteSearch(initialQuery));
}

/* ----------------------------------------------------------------------
   Scroll-reveal for cards (respects reduced motion)
   ---------------------------------------------------------------------- */
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll(
    '.feature-card, .provider-card, .pipeline-node, .callout, .roadmap-item, .faq-item'
  );
  revealTargets.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}
