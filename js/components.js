/* =========================================================================
   1. COMPONENT LOADER
   Fetches HTML snippets and injects them, then triggers specific logic.
   ========================================================================= */
async function loadComponent(elementId, filePath) {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Cache busting prevents the browser from loading old versions of your menu
    const cacheBuster = `?v=${new Date().getTime()}`;
    const response = await fetch(filePath + cacheBuster);

    if (!response.ok) {
      console.error(`Error loading ${filePath}: ${response.statusText}`);
      return;
    }

    const html = await response.text();
    element.innerHTML = html;

    // --- Component Specific Initialization ---

    // 1. If we just loaded the Navbar, wire up the mobile menu & theme toggle
    if (elementId === "navbar-placeholder") {
      initNavbar();
    }

    // 2. If we just loaded Reviews, render the data (assuming reviewsData exists)
    if (elementId === "reviews-placeholder") {
      renderReviews();
    }

  } catch (error) {
    console.error(`Fetch error for ${elementId}:`, error);
  }
}

/* =========================================================================
   2. NAVBAR LOGIC (Mobile Menu & Theme)
   This runs automatically after navbar.html is injected.
   ========================================================================= */
function initNavbar() {
  const hamburger = document.getElementById('hamburgerBtn');
  const menuOverlay = document.getElementById('mobileMenu');
  const themeToggles = document.querySelectorAll('.theme-toggle');
  const mobileLinks = document.querySelectorAll('.m-link');
  const body = document.body;

  function toggleMenu(forceClose = false) {
    if (!hamburger || !menuOverlay) return;
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    const shouldClose = forceClose || isExpanded;

    if (shouldClose) {
      menuOverlay.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false'); // This triggers the icon swap CSS
      body.classList.remove('menu-open');
    } else {
      menuOverlay.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true'); // This triggers the icon swap CSS
      body.classList.add('menu-open');
    }
  }

  if (hamburger) hamburger.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
  
  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
  });

  mobileLinks.forEach(link => link.addEventListener('click', () => toggleMenu(true)));
  
  if (menuOverlay) menuOverlay.addEventListener('click', (e) => { if (e.target === menuOverlay) toggleMenu(true); });
}

/* =========================================================================
   3. REVIEWS LOGIC
   Renders stars and text from the reviewsData array.
   ========================================================================= */
function renderReviews() {
  const container = document.getElementById("reviews-container");
  
  // Safety check: Ensure container exists and reviewsData (global) is defined
  if (!container || typeof reviewsData === 'undefined') {
    return;
  }

  const bestReviews = reviewsData.filter(review => review.rating >= 4);

  const reviewsHTML = bestReviews.map(review => {
    const stars = '★'.repeat(review.rating);
    const sizeClass = review.size === 'large' ? 'large' : '';
    const avatarClass = review.color || 'white';
    const initial = review.name ? review.name.charAt(0) : '?';

    return `
      <div class="review-card ${sizeClass}">
        <div class="stars">${stars}</div>
        <p class="review-text">"${review.text}"</p>
        <div class="review-author">
          <div class="avatar ${avatarClass}">${initial}</div>
          <div>
            <span class="name">${review.name}</span>
            <span class="source">${review.source}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = reviewsHTML;
}

/* =========================================================================
   4. INITIALIZATION
   Runs when the DOM is ready.
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Restore Theme immediately (prevents white flash on dark mode)
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // 2. Load Components
  loadComponent("navbar-placeholder", "components/navbar.html");
  loadComponent("hero-placeholder", "components/hero.html");
  loadComponent("reviews-placeholder", "components/reviews.html");
  loadComponent("footer-placeholder", "components/footer.html");
});