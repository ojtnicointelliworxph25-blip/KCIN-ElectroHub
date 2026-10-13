/* =====================================================
   KCIN ElectroHub - script.js
   1  Settings and product data  (EDIT THESE)
   2  Helpers
   3  Product display, search and filters
   4  Shopping cart
   5  Product details pop-up
   6  Navigation (mobile menu)
   7  Contact form
   8  Scroll animations, footer year, start-up
   ===================================================== */
'use strict';

/* ---------- 1. SETTINGS AND PRODUCT DATA ---------- */

// Basic store settings you can change
const STORE_CONFIG = {
  // Paste your Facebook Messenger link here, e.g. 'https://m.me/YourPageName'
  // While it is empty, the Messenger button just shows a reminder message.
  messengerUrl: '',
  // The name used to save the cart in the browser
  cartStorageKey: 'kcin-electrohub-cart'
};

// PRODUCT LIST. All prices are SAMPLE PLACEHOLDERS in Philippine pesos (₱).
// To add a product, copy one block, give it a new unique "id", and edit the values.
// To remove a product, delete its block.
const products = [
  {
    id: 'refrigerator',
    name: 'Refrigerator',
    category: 'Kitchen',
    price: 24990,
    image: 'images/refrigerator.jpg',
    imageAlt: 'Two-door refrigerator with yellow handles',
    description: 'Two-door inverter refrigerator with generous fresh and freezer space.',
    details: ['Capacity: about 9 cu. ft. (sample)', 'Inverter compressor (sample)', 'Frost-free cooling (sample)']
  },
  {
    id: 'washing-machine',
    name: 'Washing Machine',
    category: 'Laundry',
    price: 18490,
    image: 'images/washing-machine.jpg',
    imageAlt: 'Front-loading washing machine',
    description: 'Front-load washer with multiple wash programs for everyday laundry.',
    details: ['Capacity: about 8 kg (sample)', 'Multiple wash programs (sample)', 'Quiet motor (sample)']
  },
  {
    id: 'smart-tv',
    name: 'Smart Television',
    category: 'Entertainment',
    price: 15990,
    image: 'images/smart-tv.jpg',
    imageAlt: 'Flat-screen smart television',
    description: '43-inch smart TV with built-in apps and sharp 4K picture.',
    details: ['Screen: 43 inches, 4K (sample)', 'Built-in Wi-Fi and streaming apps (sample)', '3 HDMI ports (sample)']
  },
  {
    id: 'air-conditioner',
    name: 'Air Conditioner',
    category: 'Cooling',
    price: 28990,
    image: 'images/air-conditioner.jpg',
    imageAlt: 'Wall-mounted split-type air conditioner',
    description: 'Energy-saving split-type inverter aircon that cools rooms quickly.',
    details: ['Capacity: 1.5 HP (sample)', 'Inverter, energy saving (sample)', 'Remote control included (sample)']
  },
  {
    id: 'microwave-oven',
    name: 'Microwave Oven',
    category: 'Kitchen',
    price: 5490,
    image: 'images/microwave-oven.jpg',
    imageAlt: 'Countertop microwave oven',
    description: 'Compact microwave for quick reheating, defrosting and cooking.',
    details: ['Capacity: 20 liters (sample)', '700 W power (sample)', 'Defrost function (sample)']
  },
  {
    id: 'electric-fan',
    name: 'Electric Fan',
    category: 'Cooling',
    price: 1890,
    image: 'images/electric-fan.jpg',
    imageAlt: 'Stand electric fan',
    description: 'Adjustable stand fan with three speeds and wide oscillation.',
    details: ['16-inch blade (sample)', '3 speed settings (sample)', 'Adjustable height (sample)']
  },
  {
    id: 'rice-cooker',
    name: 'Rice Cooker',
    category: 'Kitchen',
    price: 2290,
    image: 'images/rice-cooker.jpg',
    imageAlt: 'Electric rice cooker',
    description: 'Easy one-touch rice cooker that keeps rice warm until you eat.',
    details: ['Capacity: 1.8 liters (sample)', 'Keep-warm function (sample)', 'Non-stick inner pot (sample)']
  },
  {
    id: 'water-dispenser',
    name: 'Water Dispenser',
    category: 'Kitchen',
    price: 7990,
    image: 'images/water-dispenser.jpg',
    imageAlt: 'Hot and cold water dispenser with top bottle',
    description: 'Hot and cold water dispenser with a handy storage cabinet.',
    details: ['Hot and cold taps (sample)', 'Child safety lock on hot tap (sample)', 'Bottom storage cabinet (sample)']
  }
];

/* ---------- 2. HELPERS ---------- */

// Grab an element by its id (shorter to type)
const byId = (id) => document.getElementById(id);

// Format a number as pesos: 24990 -> "₱24,990"
const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency', currency: 'PHP', maximumFractionDigits: 0
});
const formatPrice = (amount) => pesoFormatter.format(amount);

// Find a product by its id
const findProduct = (id) => products.find((product) => product.id === id);

// Turn on the "js" class so CSS knows JavaScript is running (used by scroll animations)
document.documentElement.classList.add('js');

// If a picture fails to load, swap in a local placeholder (works for every <img> on the page)
document.addEventListener('error', (event) => {
  const element = event.target;
  if (element.tagName === 'IMG' && !element.dataset.fallbackUsed) {
    element.dataset.fallbackUsed = 'true';   // prevents an endless loop if the fallback fails too
    element.src = 'images/placeholder.svg';
  }
}, true);

// Small pop-up message (toast)
let toastTimer;
function showToast(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- 3. PRODUCT DISPLAY, SEARCH AND FILTERS ---------- */

const productGrid = byId('product-grid');
const noResults = byId('no-results');
const resultCount = byId('result-count');
const searchInput = byId('search-input');
const filterContainer = byId('category-filters');

// The current search text and category choice
const filterState = { query: '', category: 'All' };

// Build the category buttons from the products list (so new categories appear automatically)
function renderFilterButtons() {
  const categories = ['All', ...new Set(products.map((product) => product.category))];
  filterContainer.innerHTML = categories.map((category) => `
    <button type="button" class="filter-btn" data-category="${category}"
            aria-pressed="${category === filterState.category}">${category}</button>
  `).join('');
}

// Create the HTML for one product card
function createProductCard(product) {
  return `
    <article class="product-card">
      <div class="product-media">
        <img src="${product.image}" alt="${product.imageAlt}" width="400" height="300" loading="lazy">
      </div>
      <div class="product-body">
        <p class="product-category">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${formatPrice(product.price)}</p>
        <p class="product-desc">${product.description}</p>
        <div class="product-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-action="details" data-id="${product.id}">View Details</button>
          <button type="button" class="btn btn-primary btn-sm" data-action="add" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

// Show only the products that match the search text AND the chosen category
function renderProducts() {
  const query = filterState.query.trim().toLowerCase();

  const visibleProducts = products.filter((product) => {
    const matchesCategory = filterState.category === 'All' || product.category === filterState.category;
    const matchesSearch = product.name.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = visibleProducts.map(createProductCard).join('');
  noResults.hidden = visibleProducts.length > 0;
  resultCount.textContent = visibleProducts.length === 1
    ? 'Showing 1 product'
    : `Showing ${visibleProducts.length} products`;
}

searchInput.addEventListener('input', () => {
  filterState.query = searchInput.value;
  renderProducts();
});

filterContainer.addEventListener('click', (event) => {
  const button = event.target.closest('.filter-btn');
  if (!button) return;
  filterState.category = button.dataset.category;
  renderFilterButtons();
  renderProducts();
});

byId('reset-filters').addEventListener('click', () => {
  filterState.query = '';
  filterState.category = 'All';
  searchInput.value = '';
  renderFilterButtons();
  renderProducts();
});

// One click listener on the whole grid handles every card's buttons ("event delegation")
productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const productId = button.dataset.id;

  if (button.dataset.action === 'add') {
    addToCart(productId);
    flashButton(button);
  } else if (button.dataset.action === 'details') {
    openProductDialog(productId);
  }
});

// Briefly change a button's text to confirm the click
function flashButton(button) {
  const originalText = button.textContent;
  button.textContent = 'Added ✓';
  button.disabled = true;
  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 900);
}

/* ---------- 4. SHOPPING CART ---------- */

// The cart is a list of { id, quantity } objects. We only store ids and quantities
// (not prices), so price changes in the products list always apply.
let cart = loadCart();

const cartDrawer = byId('cart-drawer');
const overlay = byId('overlay');
const cartToggle = byId('cart-toggle');
const cartClose = byId('cart-close');
const cartItemsList = byId('cart-items');
const cartEmptyMessage = byId('cart-empty');
const cartSubtotal = byId('cart-subtotal');
const cartCount = byId('cart-count');
const checkoutMessage = byId('checkout-message');

// Read the saved cart from localStorage (try/catch protects against blocked or corrupted storage)
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_CONFIG.cartStorageKey));
    if (!Array.isArray(saved)) return [];
    // Keep only valid items for products that still exist
    return saved.filter((item) => findProduct(item.id) && Number.isInteger(item.quantity) && item.quantity > 0);
  } catch (error) {
    return [];
  }
}

// Save the cart to localStorage so it survives a page refresh
function saveCart() {
  try {
    localStorage.setItem(STORE_CONFIG.cartStorageKey, JSON.stringify(cart));
  } catch (error) {
    // Storage may be full or blocked. The cart still works for this visit.
  }
}

function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  updateCart();
  showToast(`${findProduct(productId).name} added to cart`);

  // Make the cart icon bounce
  cartToggle.classList.remove('bump');
  void cartToggle.offsetWidth;          // restarts the animation
  cartToggle.classList.add('bump');
}

function changeQuantity(productId, change) {
  const item = cart.find((cartItem) => cartItem.id === productId);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  updateCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCart();
}

function clearCart() {
  cart = [];
  updateCart();
}

// Redraw everything that depends on the cart: list, counter, subtotal
function updateCart() {
  saveCart();
  checkoutMessage.hidden = true;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + findProduct(item.id).price * item.quantity, 0);

  cartCount.textContent = totalItems;
  cartSubtotal.textContent = formatPrice(subtotal);
  cartEmptyMessage.hidden = cart.length > 0;

  cartItemsList.innerHTML = cart.map((item) => {
    const product = findProduct(item.id);
    return `
      <li class="cart-item">
        <img src="${product.image}" alt="${product.imageAlt}" width="64" height="64">
        <div>
          <p class="cart-item-name">${product.name}</p>
          <p class="cart-item-price">${formatPrice(product.price)} each</p>
          <div class="qty-controls">
            <button type="button" class="qty-btn" data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity of ${product.name}">&minus;</button>
            <span class="qty-value" aria-label="Quantity">${item.quantity}</span>
            <button type="button" class="qty-btn" data-action="increase" data-id="${product.id}" aria-label="Increase quantity of ${product.name}">+</button>
          </div>
        </div>
        <div class="cart-item-side">
          <p class="cart-line-total">${formatPrice(product.price * item.quantity)}</p>
          <button type="button" class="remove-btn" data-action="remove" data-id="${product.id}" aria-label="Remove ${product.name} from cart">Remove</button>
        </div>
      </li>
    `;
  }).join('');
}

// Handle quantity and remove buttons inside the cart
cartItemsList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const productId = button.dataset.id;

  if (button.dataset.action === 'increase') changeQuantity(productId, 1);
  if (button.dataset.action === 'decrease') changeQuantity(productId, -1);
  if (button.dataset.action === 'remove') removeFromCart(productId);
});

byId('clear-cart-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Your cart is already empty');
    return;
  }
  clearCart();
  showToast('Cart cleared');
});

// Demo checkout: no payment is processed
byId('checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Add a product before checking out');
    return;
  }
  checkoutMessage.textContent = 'This is a demo checkout. No payment was taken and no order was placed. Real online payments need a backend and a payment provider.';
  checkoutMessage.hidden = false;
});

// Open and close the cart drawer
function openCart() {
  cartDrawer.classList.add('open');
  overlay.classList.add('open');
  cartToggle.setAttribute('aria-expanded', 'true');
  cartClose.focus();
}

function closeCart() {
  cartDrawer.classList.remove('open');
  overlay.classList.remove('open');
  cartToggle.setAttribute('aria-expanded', 'false');
  cartToggle.focus();
}

cartToggle.addEventListener('click', () => {
  cartDrawer.classList.contains('open') ? closeCart() : openCart();
});
cartClose.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

/* ---------- 5. PRODUCT DETAILS POP-UP ---------- */

const productDialog = byId('product-dialog');
const dialogContent = byId('dialog-content');

function openProductDialog(productId) {
  const product = findProduct(productId);
  if (!product) return;

  dialogContent.innerHTML = `
    <div class="dialog-grid">
      <div class="dialog-media">
        <img src="${product.image}" alt="${product.imageAlt}" width="400" height="300">
      </div>
      <div class="dialog-body">
        <button type="button" class="icon-btn dialog-close" data-action="close-dialog" aria-label="Close details">&times;</button>
        <p class="product-category">${product.category}</p>
        <h2 id="dialog-title">${product.name}</h2>
        <p class="product-price">${formatPrice(product.price)}</p>
        <p>${product.description}</p>
        <ul class="dialog-specs">
          ${product.details.map((detail) => `<li>${detail}</li>`).join('')}
        </ul>
        <button type="button" class="btn btn-primary" data-action="add-from-dialog" data-id="${product.id}">Add to Cart</button>
        <p class="dialog-note">Sample price and specifications. Replace them with your real details.</p>
      </div>
    </div>
  `;

  if (typeof productDialog.showModal === 'function') {
    productDialog.showModal();
  } else {
    productDialog.setAttribute('open', '');   // very old browsers
  }
}

productDialog.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');

  if (button && button.dataset.action === 'close-dialog') {
    productDialog.close();
  } else if (button && button.dataset.action === 'add-from-dialog') {
    addToCart(button.dataset.id);
    productDialog.close();
  } else if (event.target === productDialog) {
    productDialog.close();   // clicking the dark background closes the pop-up
  }
});

/* ---------- 6. NAVIGATION (MOBILE MENU) ---------- */

const menuToggle = byId('menu-toggle');
const siteNav = byId('site-nav');

function setMenuOpen(isOpen) {
  siteNav.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
}

menuToggle.addEventListener('click', () => {
  setMenuOpen(!siteNav.classList.contains('open'));
});

// Close the menu after choosing a link
siteNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});

// Escape closes the menu and the cart
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  setMenuOpen(false);
  if (cartDrawer.classList.contains('open')) closeCart();
});

/* ---------- 7. CONTACT FORM ---------- */

const contactForm = byId('contact-form');
const formStatus = byId('form-status');

// Show or clear an error message under a field
function setFieldError(fieldId, message) {
  const input = byId(fieldId);
  byId(`${input.name}-error`).textContent = message;
  input.closest('.field').classList.toggle('has-error', message !== '');
  input.setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
}

// Check every field. Returns true only if all are valid.
function validateContactForm() {
  const name = byId('contact-name').value.trim();
  const email = byId('contact-email').value.trim();
  const message = byId('contact-message').value.trim();
  let isValid = true;

  if (name.length < 2) {
    setFieldError('contact-name', 'Please enter your name.');
    isValid = false;
  } else {
    setFieldError('contact-name', '');
  }

  // A simple email pattern: something@something.something
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    setFieldError('contact-email', 'Please enter a valid email address, like name@example.com.');
    isValid = false;
  } else {
    setFieldError('contact-email', '');
  }

  if (message.length < 10) {
    setFieldError('contact-message', 'Please write a message of at least 10 characters.');
    isValid = false;
  } else {
    setFieldError('contact-message', '');
  }

  return isValid;
}

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();          // stop the page from reloading
  formStatus.textContent = '';

  if (!validateContactForm()) return;

  // DEMO ONLY: a real site would send the data to a backend or a form service here.
  formStatus.textContent = 'Thank you! This is a demo, so your message was not actually sent.';
  contactForm.reset();
});

// Clear an error as soon as the person starts fixing it
contactForm.addEventListener('input', (event) => {
  if (event.target.id) setFieldError(event.target.id, '');
});

// Messenger button
byId('messenger-btn').addEventListener('click', () => {
  if (STORE_CONFIG.messengerUrl) {
    window.open(STORE_CONFIG.messengerUrl, '_blank', 'noopener');
  } else {
    showToast('Messenger link not set yet. Add it in script.js.');
  }
});

/* ---------- 8. SCROLL ANIMATIONS, FOOTER YEAR, START-UP ---------- */

// Fade sections in as they scroll into view
function setupRevealAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);     // animate only once
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => observer.observe(element));
}

// Footer copyright year
byId('year').textContent = new Date().getFullYear();

// Draw everything when the page loads
renderFilterButtons();
renderProducts();
updateCart();
setupRevealAnimations();
