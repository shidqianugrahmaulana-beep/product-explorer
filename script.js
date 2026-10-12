// State Aplikasi
let products = [];
let categories = [];

// DOM Elements
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');
const resetBtn = document.getElementById('reset-btn');
const productCounter = document.getElementById('product-counter');
const productGrid = document.getElementById('product-grid');
const stateMessage = document.getElementById('state-message');
const productModal = document.getElementById('product-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalBody = document.getElementById('modal-body');

// 1. Fetch Data Produk dan Kategori dari DummyJSON API
async function fetchProducts() {
  showStateMessage('⏳ Memuat data produk...');
  try {
    const response = await fetch('https://dummyjson.com/products?limit=100');
    if (!response.ok) throw new Error('Gagal mengambil data dari server.');
    
    const data = await response.json();
    products = data.products;

    populateCategories();
    hideStateMessage();
    applyFilters();
  } catch (error) {
    showStateMessage(`❌ Error: ${error.message}`);
  }
}

// 2. Isi Opsi Dropdown Kategori secara Dinamis
function populateCategories() {
  const categorySet = new Set(products.map(p => p.category));
  categories = Array.from(categorySet).sort();

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    // Format nama kategori agar huruf depan kapital
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
}

// 3. Fungsi Utama: Filter, Search, Sort (Berjalan Bersamaan)
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;
  const selectedSort = sortSelect.value;

  // A. Filter (Search + Category)
  let result = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // B. Sorting
  if (selectedSort === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (selectedSort === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (selectedSort === 'rating-desc') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (selectedSort === 'name-asc') {
    result.sort((a, b) => a.title.localeCompare(b.title));
  }

  // C. Update Counter & Render UI
  updateCounter(result.length, products.length);
  renderProductGrid(result);
}

// 4. Render Grid Produk ke DOM
function renderProductGrid(productList) {
  productGrid.innerHTML = '';

  if (productList.length === 0) {
    showStateMessage('🔍 Produk tidak ditemukan. Coba kata kunci atau filter lain.');
    return;
  }

  hideStateMessage();

  productList.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" />
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.title}</h3>
        <div class="product-meta">
          <span class="product-price">$${product.price}</span>
          <span class="product-rating">⭐ ${product.rating}</span>
        </div>
        <button class="btn btn-detail" onclick="openModal(${product.id})">Lihat Detail</button>
      </div>
    `;

    productGrid.appendChild(card);
  });
}

// 5. Update Text Product Counter
function updateCounter(currentCount, totalCount) {
  productCounter.textContent = `${currentCount} dari ${totalCount} product ditampilkan.`;
}

// 6. Reset Seluruh Filter ke Default
function resetFilters() {
  searchInput.value = '';
  categoryFilter.value = '';
  sortSelect.value = 'default';
  applyFilters();
}

// 7. Modal Detail Produk
function openModal(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  modalBody.innerHTML = `
    <div class="modal-detail">
      <img src="${product.thumbnail}" alt="${product.title}" />
      <h2>${product.title}</h2>
      <p class="modal-brand">Brand: <strong>${product.brand || 'N/A'}</strong> | Category: <strong>${product.category}</strong></p>
      <p class="modal-description">${product.description}</p>
      <div class="modal-grid">
        <div><strong>Harga:</strong> $${product.price}</div>
        <div><strong>Rating:</strong> ⭐ ${product.rating}</div>
        <div><strong>Stok:</strong> ${product.stock} pcs</div>
        <div><strong>Diskon:</strong> ${product.discountPercentage}%</div>
      </div>
    </div>
  `;

  productModal.classList.remove('hidden');
}

function closeModal() {
  productModal.classList.add('hidden');
}

// Helper State Message (Loading/Error/Empty)
function showStateMessage(message) {
  stateMessage.textContent = message;
  stateMessage.classList.remove('hidden');
}

function hideStateMessage() {
  stateMessage.classList.add('hidden');
}

// 8. Event Listeners
searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
sortSelect.addEventListener('change', applyFilters);
resetBtn.addEventListener('click', resetFilters);

closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Event Listener Bonus: Close Modal dengan tombol ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !productModal.classList.contains('hidden')) {
    closeModal();
  }
});

// Jalankan Panggilan API Pertama Kali
fetchProducts();