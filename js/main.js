document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollAnimations();
  initCounters();
  initActiveNavLink();
  initCropFilters();
  initProductFilters();
  initContactForm();
  initLoginForm();
  initDashboardUser();
  initDashboardChart();
  initNewsletterForm();
  initAddToCartRedirect();
});

/* --- Mobile Menu Toggle --- */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
      
      // Transform hamburger to X
      const spans = hamburger.querySelectorAll('span');
      if (navMenu.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close menu when clicking links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => s.style.transform = 'none');
        hamburger.querySelectorAll('span')[1].style.opacity = '1';
      });
    });
  }
}

/* --- Scroll Animations (Reveal on Scroll) --- */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once animated
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => revealOnScroll.observe(el));
}

/* --- Stats Counter Countup Animation --- */
function initCounters() {
  const counters = document.querySelectorAll('.counter-val');
  if (counters.length === 0) return;

  const countUp = (entryVal) => {
    const target = +entryVal.getAttribute('data-target');
    const suffix = entryVal.getAttribute('data-suffix') || '';
    const speed = 200; // lower is faster
    
    let count = 0;
    const increment = target / speed;

    const updateCount = () => {
      count += increment;
      if (count < target) {
        entryVal.innerText = Math.ceil(count) + suffix;
        setTimeout(updateCount, 1);
      } else {
        entryVal.innerText = target + suffix;
      }
    };
    updateCount();
  };

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
}

/* --- Highlight Current Page Nav Link --- */
function initActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* --- Crops Page Filter System --- */
function initCropFilters() {
  const categoryButtons = document.querySelectorAll('.crop-cat-btn');
  const cropCards = document.querySelectorAll('.crop-card-item');
  const seasonSelect = document.querySelector('#season-select');
  const sortSelect = document.querySelector('#crop-sort-select');
  const resetBtn = document.querySelector('#reset-crops-filters');
  
  if (cropCards.length === 0) return;

  let currentCategory = 'all';
  let currentSeason = 'all';

  const filterCrops = () => {
    if (currentCategory !== 'all' && currentSeason !== 'all') {
      window.location.href = '404.html';
      return;
    }
    let visibleCount = 0;
    cropCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardSeason = card.getAttribute('data-season');
      
      const matchCategory = currentCategory === 'all' || cardCategory === currentCategory;
      const matchSeason = currentSeason === 'all' || cardSeason === currentSeason;
      
      if (matchCategory && matchSeason) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const resultsText = document.querySelector('#crops-results-count');
    if (resultsText) {
      resultsText.innerText = `Showing 1-${visibleCount} of ${visibleCount} results`;
    }
  };

  // Category selection click
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      categoryButtons.forEach(b => b.parentElement.classList.remove('active'));
      btn.parentElement.classList.add('active');
      currentCategory = btn.getAttribute('data-filter');
      filterCrops();
    });
  });

  // Season dropdown select
  if (seasonSelect) {
    seasonSelect.addEventListener('change', (e) => {
      currentSeason = e.target.value;
      filterCrops();
    });
  }

  // Sort dropdown sorting
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const criteria = e.target.value;
      const parentGrid = document.querySelector('.catalog-grid');
      const cardsArray = Array.from(cropCards);

      if (criteria === 'name-asc') {
        cardsArray.sort((a, b) => {
          return a.querySelector('.product-title').innerText.localeCompare(b.querySelector('.product-title').innerText);
        });
      } else if (criteria === 'name-desc') {
        cardsArray.sort((a, b) => {
          return b.querySelector('.product-title').innerText.localeCompare(a.querySelector('.product-title').innerText);
        });
      }

      cardsArray.forEach(card => parentGrid.appendChild(card));
    });
  }

  // Reset Filters click
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentCategory = 'all';
      currentSeason = 'all';
      categoryButtons.forEach(b => b.parentElement.classList.remove('active'));
      categoryButtons[0].parentElement.classList.add('active');
      if (seasonSelect) seasonSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'default';
      filterCrops();
    });
  }
}

/* --- Products Page Filters & Price Slider --- */
function initProductFilters() {
  const productCards = document.querySelectorAll('.product-card-item');
  const priceInput = document.querySelector('#price-range-slider');
  const priceLabel = document.querySelector('#price-max-val');
  const brandChecks = document.querySelectorAll('.brand-filter-check');
  const categoryItems = document.querySelectorAll('.prod-cat-item');
  const applyBtn = document.querySelector('#apply-filters-btn');
  const resetBtn = document.querySelector('#reset-products-filters');

  if (productCards.length === 0) return;

  let maxPrice = 5000;
  let selectedBrands = [];
  let selectedCategory = 'all';

  if (priceInput && priceLabel) {
    priceInput.addEventListener('input', (e) => {
      maxPrice = +e.target.value;
      priceLabel.innerText = `₹${maxPrice}`;
    });
  }

  const applyProductFilters = () => {
    const isCategoryFiltered = selectedCategory !== 'all';
    const isBrandFiltered = selectedBrands.length > 0;
    const isPriceFiltered = maxPrice < 5000;
    if (isCategoryFiltered && isBrandFiltered && isPriceFiltered) {
      window.location.href = '404.html';
      return;
    }
    let visibleCount = 0;
    productCards.forEach(card => {
      const price = parseFloat(card.getAttribute('data-price'));
      const brand = card.getAttribute('data-brand');
      const category = card.getAttribute('data-category');

      const matchPrice = price <= maxPrice;
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(brand);
      const matchCategory = selectedCategory === 'all' || category === selectedCategory;

      if (matchPrice && matchBrand && matchCategory) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const resultsText = document.querySelector('#prod-results-count');
    if (resultsText) {
      resultsText.innerText = `Showing 1-${visibleCount} of ${visibleCount} results`;
    }
  };

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      selectedBrands = Array.from(brandChecks)
        .filter(c => c.checked)
        .map(c => c.value);
      applyProductFilters();
    });
  }

  categoryItems.forEach(item => {
    const btn = item.querySelector('button');
    if (btn) {
      btn.addEventListener('click', () => {
        categoryItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        selectedCategory = btn.getAttribute('data-filter');
        applyProductFilters();
      });
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const isCategoryFiltered = selectedCategory !== 'all';
      const isBrandFiltered = selectedBrands.length > 0;
      const isPriceFiltered = maxPrice < 5000;
      
      if (isCategoryFiltered || isBrandFiltered || isPriceFiltered) {
        window.location.href = '404.html';
        return;
      }

      maxPrice = 5000;
      selectedBrands = [];
      selectedCategory = 'all';
      if (priceInput) priceInput.value = 5000;
      if (priceLabel) priceLabel.innerText = `₹5000`;
      brandChecks.forEach(c => c.checked = false);
      categoryItems.forEach(i => i.classList.remove('active'));
      categoryItems[0].classList.add('active');
      applyProductFilters();
    });
  }

  // Wishlist icon toggler
  document.querySelectorAll('.product-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('active');
      const icon = btn.querySelector('svg');
      if (btn.classList.contains('active')) {
        icon.style.fill = '#ff5a5f';
        icon.style.stroke = '#ff5a5f';
      } else {
        icon.style.fill = 'none';
        icon.style.stroke = 'currentColor';
      }
    });
  });

  // Sort dropdown handler
  const sortSelect = document.querySelector('#prod-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const criteria = e.target.value;
      const parentGrid = document.querySelector('.catalog-grid');
      const cardsArray = Array.from(productCards);

      if (criteria === 'price-low') {
        cardsArray.sort((a, b) => parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price')));
      } else if (criteria === 'price-high') {
        cardsArray.sort((a, b) => parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price')));
      } else if (criteria === 'featured') {
        cardsArray.sort((a, b) => parseFloat(a.getAttribute('data-id')) - parseFloat(b.getAttribute('data-id')));
      }

      cardsArray.forEach(card => parentGrid.appendChild(card));
    });
  }
}

/* --- Contact Form Handler --- */
function initContactForm() {
  const contactForm = document.querySelector('#contact-us-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simple verification
    const name = contactForm.querySelector('[name="name"]').value;
    const email = contactForm.querySelector('[name="email"]').value;
    const message = contactForm.querySelector('[name="message"]').value;
    const terms = contactForm.querySelector('[name="privacy_agreement"]');
    
    if (!name || !email || !message) {
      alert('Please fill out all required fields.');
      return;
    }

    if (terms && !terms.checked) {
      alert('You must agree to the privacy policy.');
      return;
    }

    alert(`Thank you, ${name}! Your message has been sent successfully.`);
    window.location.href = '404.html';
  });
}

/* --- SVG Chart Rendering on Dashboard --- */
function initDashboardChart() {
  const container = document.getElementById('yield-chart-container');
  if (!container) return;

  // Insert responsive custom SVG Line & Bar chart representing Stackly productivity
  container.innerHTML = `
    <svg viewBox="0 0 500 220" width="100%" height="100%" class="chart-svg">
      <defs>
        <linearGradient id="chart-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0b6635" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#0b6635" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <!-- Grid lines -->
      <line x1="40" y1="20" x2="480" y2="20" stroke="#f0f4f2" stroke-width="1" />
      <line x1="40" y1="70" x2="480" y2="70" stroke="#f0f4f2" stroke-width="1" />
      <line x1="40" y1="120" x2="480" y2="120" stroke="#f0f4f2" stroke-width="1" />
      <line x1="40" y1="170" x2="480" y2="170" stroke="#f0f4f2" stroke-width="1" />
      <line x1="40" y1="170" x2="480" y2="170" stroke="#cbe3db" stroke-width="2" />
      
      <!-- Y-Axis labels -->
      <text x="30" y="25" fill="#5c6f65" font-size="9" text-anchor="end">100%</text>
      <text x="30" y="75" fill="#5c6f65" font-size="9" text-anchor="end">75%</text>
      <text x="30" y="125" fill="#5c6f65" font-size="9" text-anchor="end">50%</text>
      <text x="30" y="175" fill="#5c6f65" font-size="9" text-anchor="end">25%</text>

      <!-- Bar charts representing Crop Yield comparison -->
      <!-- Rice -->
      <rect x="70" y="60" width="18" height="110" fill="#cbe3db" rx="2" />
      <rect x="70" y="80" width="18" height="90" fill="#0b6635" rx="2" />
      
      <!-- Wheat -->
      <rect x="150" y="40" width="18" height="130" fill="#cbe3db" rx="2" />
      <rect x="150" y="55" width="18" height="115" fill="#0b6635" rx="2" />

      <!-- Maize -->
      <rect x="230" y="50" width="18" height="120" fill="#cbe3db" rx="2" />
      <rect x="230" y="70" width="18" height="100" fill="#0b6635" rx="2" />

      <!-- Cotton -->
      <rect x="310" y="30" width="18" height="140" fill="#cbe3db" rx="2" />
      <rect x="310" y="45" width="18" height="125" fill="#0b6635" rx="2" />

      <!-- Vegetables -->
      <rect x="390" y="45" width="18" height="125" fill="#cbe3db" rx="2" />
      <rect x="390" y="60" width="18" height="110" fill="#0b6635" rx="2" />

      <!-- X-Axis Labels -->
      <text x="79" y="192" fill="#0a1c12" font-size="10" font-weight="600" text-anchor="middle">Rice</text>
      <text x="159" y="192" fill="#0a1c12" font-size="10" font-weight="600" text-anchor="middle">Wheat</text>
      <text x="239" y="192" fill="#0a1c12" font-size="10" font-weight="600" text-anchor="middle">Maize</text>
      <text x="319" y="192" fill="#0a1c12" font-size="10" font-weight="600" text-anchor="middle">Cotton</text>
      <text x="399" y="192" fill="#0a1c12" font-size="10" font-weight="600" text-anchor="middle">Veges</text>
    </svg>
  `;
}

/* --- Login Form Router --- */
function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('l-email');
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    // Get username from email if "@" exists, otherwise use input string
    let username = email.split('@')[0];
    if (!username) {
      username = email;
    }
    
    localStorage.setItem('username', username);
    localStorage.setItem('userEmail', email);
    
    // Get selected role
    const selectedRoleEl = loginForm.querySelector('input[name="login-role"]:checked');
    const role = selectedRoleEl ? selectedRoleEl.value : 'client';
    
    alert('Signed In successfully!');
    if (role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'client-dashboard.html';
    }
  });
}

/* --- Dashboard User Personalization --- */
function initDashboardUser() {
  const welcomeHeading = document.querySelector('.db-welcome h2');
  if (!welcomeHeading) return;

  const rawUser = localStorage.getItem('username');
  if (!rawUser) return;

  // Format: ramesh.patel -> Ramesh Patel
  const formattedName = rawUser.split(/[\._-]/)
                               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                               .join(' ');

  // 1. Update Welcome Message
  if (welcomeHeading) {
    welcomeHeading.innerText = `Welcome Back, ${formattedName}!`;
  }

  // 2. Update Sidebar Name
  const sidebarName = document.querySelector('.db-user-profile h4');
  if (sidebarName) {
    sidebarName.innerText = formattedName;
  }

  // 3. Update Header Name
  const headerName = document.querySelector('.db-header-right span');
  if (headerName) {
    headerName.innerText = formattedName;
  }

  // 4. Update Admin Initials if applicable
  const adminAvatar = document.querySelector('.db-header-right div[style*="width: 36px"]');
  if (adminAvatar && adminAvatar.innerText.length <= 2) {
    const parts = formattedName.split(' ');
    let initials = parts[0].charAt(0);
    if (parts.length > 1) {
      initials += parts[1].charAt(0);
    } else {
      initials += parts[0].charAt(1) || '';
    }
    adminAvatar.innerText = initials.toUpperCase();
  }
}

