async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        // --- THE FIX: ADDING TIMESTAMP TO FORCE FRESH LOAD ---
        const cacheBuster = `?v=${new Date().getTime()}`;
        const response = await fetch(filePath + cacheBuster);
        
        if (response.ok) {
            const html = await response.text();
            element.innerHTML = html;

            // SPECIAL TRIGGER: If we just loaded reviews, render the data
            if (elementId === "reviews-placeholder") {
                renderReviews();
            }
        } else {
            console.error(`Error loading ${filePath}`);
        }
    } catch (error) {
        console.error(`Fetch error: ${error}`);
    }
}

function renderReviews() {
    const container = document.getElementById("reviews-container");
    if (!container) return;

    const bestReviews = reviewsData.filter(review => review.rating >= 4);

    const reviewsHTML = bestReviews.map(review => {
        const stars = '★'.repeat(review.rating);
        const sizeClass = review.size === 'large' ? 'large' : '';
        const avatarClass = review.color || 'white';

        return `
            <div class="review-card ${sizeClass}">
                <div class="stars">${stars}</div>
                <p class="review-text">"${review.text}"</p>
                <div class="review-author">
                    <div class="avatar ${avatarClass}">${review.name.charAt(0)}</div>
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

function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('active');
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    // Save preference to LocalStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadComponent("navbar-placeholder", "components/navbar.html");
    loadComponent("hero-placeholder", "components/hero.html");
    loadComponent("reviews-placeholder", "components/reviews.html");
    loadComponent("footer-placeholder", "components/footer.html");

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
});