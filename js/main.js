document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initPublications();
  initBlogTeaser();
});

// ============================================
// NAVIGATION
// ============================================

function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (toggle) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const icon = toggle.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-xmark');
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      links.classList.remove('open');
      const icon = toggle?.querySelector('i');
      if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-xmark');
      }
    });
  });

  const sections = document.querySelectorAll('.section, .hero, .footer');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--nav-height')} 0px 0px 0px` });

  sections.forEach(s => { if (s.id) observer.observe(s); });
}

// ============================================
// SCROLL REVEAL
// ============================================

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

// ============================================
// PUBLICATIONS
// ============================================

let publicationsData = [];

async function initPublications() {
  const container = document.getElementById('publications-list');
  const filterContainer = document.getElementById('publications-filter');
  if (!container) return;

  try {
    const basePath = document.querySelector('meta[name="base-path"]')?.content || '.';
    const res = await fetch(`${basePath}/data/publications.json`);
    publicationsData = await res.json();
    publicationsData.sort((a, b) => b.year - a.year);

    const years = [...new Set(publicationsData.map(p => p.year))].sort((a, b) => b - a);
    renderFilters(filterContainer, years);
    renderPublications(container, publicationsData);
  } catch (e) {
    container.innerHTML = '<p style="color: var(--text-muted);">Failed to load publications.</p>';
  }
}

function renderFilters(container, years) {
  if (!container) return;
  container.innerHTML = `
    <button class="filter-btn active" data-filter="all">All</button>
    ${years.map(y => `<button class="filter-btn" data-filter="${y}">${y}</button>`).join('')}
  `;

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const filtered = filter === 'all'
        ? publicationsData
        : publicationsData.filter(p => p.year === parseInt(filter));
      renderPublications(document.getElementById('publications-list'), filtered);
    });
  });
}

function renderPublications(container, pubs) {
  container.innerHTML = pubs.map((pub, i) => {
    const authors = pub.authors.map(a =>
      a === 'Georgios Albanis'
        ? `<span class="me">${a}</span>`
        : a
    ).join(', ');

    const links = [];
    if (pub.links?.pdf) links.push(`<a href="${pub.links.pdf}" target="_blank" class="pub-link"><i class="fas fa-file-pdf"></i> PDF</a>`);
    if (pub.links?.project) links.push(`<a href="${pub.links.project}" target="_blank" class="pub-link"><i class="fas fa-globe"></i> Project</a>`);
    if (pub.links?.doi) links.push(`<a href="https://doi.org/${pub.links.doi}" target="_blank" class="pub-link"><i class="fas fa-link"></i> DOI</a>`);
    if (pub.bibtex) links.push(`<button class="pub-link" onclick="showBibtex('${pub.id}')"><i class="fas fa-quote-right"></i> BibTeX</button>`);

    return `
      <div class="pub-card${pub.featured ? ' pub-featured' : ''}" style="animation-delay: ${i * 0.05}s">
        <div class="pub-card-header">
          <span class="pub-type ${pub.type}">${pub.type}</span>
          <span class="pub-title">${pub.title}</span>
        </div>
        <div class="pub-authors">${authors}</div>
        ${pub.venue ? `<div class="pub-venue">${pub.venue} · ${pub.year}</div>` : `<div class="pub-year">${pub.year}</div>`}
        ${links.length ? `<div class="pub-links">${links.join('')}</div>` : ''}
      </div>
    `;
  }).join('');
}

function showBibtex(id) {
  const pub = publicationsData.find(p => p.id === id);
  if (!pub?.bibtex) return;

  const modal = document.getElementById('bibtex-modal');
  document.getElementById('bibtex-text').textContent = pub.bibtex;
  modal.classList.add('active');

  document.getElementById('bibtex-copy-btn').onclick = () => {
    navigator.clipboard.writeText(pub.bibtex).then(() => {
      const btn = document.getElementById('bibtex-copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy to clipboard', 2000);
    });
  };
}

function closeBibtex() {
  document.getElementById('bibtex-modal').classList.remove('active');
}

// ============================================
// BLOG TEASER (HOME PAGE)
// ============================================

async function initBlogTeaser() {
  const container = document.getElementById('blog-teaser');
  if (!container) return;

  try {
    const basePath = document.querySelector('meta[name="base-path"]')?.content || '.';
    const res = await fetch(`${basePath}/blog/posts/posts.json`);
    const posts = await res.json();

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="blog-empty">
          <i class="fas fa-pen-nib"></i>
          <p>Blog posts coming soon. Stay tuned.</p>
        </div>
      `;
      return;
    }

    const latest = posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    container.innerHTML = `<div class="blog-grid">${latest.map(post => blogCardHTML(post)).join('')}</div>`;
  } catch {
    container.innerHTML = `
      <div class="blog-empty">
        <i class="fas fa-pen-nib"></i>
        <p>Blog posts coming soon. Stay tuned.</p>
      </div>
    `;
  }
}

function blogCardHTML(post) {
  const slug = encodeURIComponent(post.slug);
  const href = post.type === 'html'
    ? `/blog/posts/${post.slug}/index.html`
    : `/blog/viewer.html?post=${slug}`;

  const date = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const tags = (post.tags || []).map(t => `<span class="blog-tag">${t}</span>`).join('');

  return `
    <a href="${href}" class="blog-card">
      <div class="blog-card-date">${date}</div>
      <div class="blog-card-title">${post.title}</div>
      <div class="blog-card-excerpt">${post.excerpt || ''}</div>
      <div class="blog-card-tags">${tags}</div>
    </a>
  `;
}

// ============================================
// BLOG LISTING PAGE
// ============================================

async function initBlogListing() {
  const container = document.getElementById('blog-listing-grid');
  if (!container) return;

  try {
    const res = await fetch('./posts/posts.json');
    const posts = await res.json();

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="blog-empty" style="grid-column: 1 / -1;">
          <i class="fas fa-pen-nib"></i>
          <p>No posts yet. Check back soon.</p>
        </div>
      `;
      return;
    }

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = posts.map(post => blogCardHTML(post)).join('');
  } catch {
    container.innerHTML = '<p style="color: var(--text-muted);">Failed to load posts.</p>';
  }
}

// ============================================
// BLOG VIEWER (MARKDOWN RENDERER)
// ============================================

async function initBlogViewer() {
  const titleEl = document.getElementById('post-title');
  const dateEl = document.getElementById('post-date');
  const tagsEl = document.getElementById('post-tags');
  const excerptEl = document.getElementById('post-excerpt');
  const bodyEl = document.getElementById('post-body');

  if (!bodyEl) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('post');

  if (!slug) {
    bodyEl.innerHTML = '<p>Post not found.</p>';
    return;
  }

  try {
    const metaRes = await fetch(`./posts/posts.json`);
    const posts = await metaRes.json();
    const meta = posts.find(p => p.slug === slug);

    if (meta) {
      if (titleEl) titleEl.textContent = meta.title;
      if (dateEl) dateEl.textContent = new Date(meta.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      if (excerptEl) excerptEl.textContent = meta.excerpt || '';
      if (tagsEl && meta.tags) {
        tagsEl.innerHTML = meta.tags.map(t => `<span class="blog-tag">${t}</span>`).join('');
      }
      document.title = `${meta.title} — Georgios Albanis`;
    }

    const mdRes = await fetch(`./posts/${slug}/index.md`);
    if (!mdRes.ok) throw new Error('Post not found');
    let md = await mdRes.text();

    const frontMatterMatch = md.match(/^---\n([\s\S]*?)\n---/);
    if (frontMatterMatch) {
      md = md.slice(frontMatterMatch[0].length).trim();
    }

    if (typeof marked !== 'undefined') {
      bodyEl.innerHTML = marked.parse(md);
    } else {
      bodyEl.innerHTML = md.replace(/\n/g, '<br>');
    }
  } catch {
    bodyEl.innerHTML = '<p style="color: var(--text-muted);">Could not load this post.</p>';
  }
}
