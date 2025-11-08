// Global variables
let currentOrderId = null;
let currentOrderTableId = null;
let allProducts = []; // Tüm ürünleri saklamak için
let salesChart = null;
let paymentChart = null;

// DOM Ready
$(document).ready(function() {
    // Kullanıcı girişi kontrolü
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Kullanıcı bilgilerini göster
    const user = JSON.parse(currentUser);
    $('#currentUserName').text(user.fullName);
    
    // Load initial data
    loadDashboard();
    loadTables();
    loadProducts();
    loadCategoryFilter();
    loadOrders();
    
    // Düşük stok kontrolü
    setTimeout(() => checkLowStockOnLoad(), 2000);
    
    // Event listeners for navigation tabs
    $('#tables-tab').on('click', function() {
        loadTables();
    });
    
    $('#products-tab').on('click', function() {
        loadProducts();
        loadCategoryFilter();
    });
    
    $('#orders-tab').on('click', function() {
        loadOrders();
    });
    
    $('#order-history-tab').on('click', function() {
        loadOrderHistory();
    });
    
    $('#dashboard-tab').on('click', function() {
        loadDashboard();
    });
    
    // Event listeners for add buttons
    $('#addTableBtn').on('click', function() {
        $('#addTableModal').modal('show');
    });
    
    $('#addProductBtn').on('click', function() {
        $('#addProductModal').modal('show');
    });
    
    $('#addCategoryBtn').on('click', function() {
        $('#addCategoryModal').modal('show');
    });

    $('#showLowStockBtn').on('click', function() {
        showLowStockAlert();
    });
    
    $('#bulkStockEntryBtn').on('click', function() {
        bulkStockEntry();
    });
    
    // Event listeners for save buttons
    $('#saveTableBtn').on('click', function() {
        saveTable();
    });
    
    $('#saveProductBtn').on('click', function() {
        saveProduct();
    });
    
    $('#updateProductBtn').on('click', function() {
        updateProduct();
    });
    
    $('#saveCategoryBtn').on('click', function() {
        saveCategory();
    });
    
    // Event listeners for payment
    $('#payOrderBtn').on('click', function() {
        payOrder();
    });
    
    // Event listeners for cancel order
    $('#cancelOrderBtn').on('click', function() {
        cancelOrder();
    });
    
    // Event listeners for transfer order
    $('#transferOrderBtn').on('click', function() {
        transferOrder();
    });
    
    // Event listeners for print
    $('#printReceiptBtn').on('click', function() {
        printReceipt();
    });
    
    $('#printKitchenBtn').on('click', function() {
        printKitchenOrder();
    });
    
    $('#printZReportBtn').on('click', function() {
        printZReport();
    });
    
    // Event listeners are now attached directly to buttons when they are created

// Kategori yükleme fonksiyonu
async function loadCategories() {
    try {
        const products = await window.api.getProducts();
        const productCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
        
        // localStorage'dan kaydedilmiş kategorileri al
        const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        // Tüm kategorileri birleştir ve tekrarları kaldır
        const allCategories = [...new Set([...productCategories, ...savedCategories])];
        
        // localStorage'ı güncelle
        localStorage.setItem('categories', JSON.stringify(allCategories));
        
        const categorySelect = $('#productCategory');
        categorySelect.empty();
        categorySelect.append('<option value="">Kategori Seçin</option>');
        
        allCategories.forEach(category => {
            categorySelect.append(`<option value="${category}">${category}</option>`);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Kategori kaydetme fonksiyonu
async function saveCategory() {
    const categoryName = $('#categoryName').val().trim();
    
    if (!categoryName || categoryName === '') {
        await Swal.fire({
            icon: 'warning',
            title: 'Uyarı',
            text: 'Lütfen bir kategori adı girin',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    try {
        // localStorage'dan mevcut kategorileri al
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        // Kategori zaten varsa uyarı ver
        if (categories.includes(categoryName)) {
            await Swal.fire({
                icon: 'info',
                title: 'Bilgi',
                text: 'Bu kategori zaten mevcut',
                confirmButtonText: 'Tamam'
            });
            return;
        }
        
        // Kategoriyi ekle
        categories.push(categoryName);
        localStorage.setItem('categories', JSON.stringify(categories));
        
        // Modal'ı kapat ve formu temizle
        $('#addCategoryModal').modal('hide');
        $('#addCategoryForm')[0].reset();
        
        // Kategorileri yeniden yükle
        loadCategories();
        loadCategoryFilter();
        
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Kategori başarıyla eklendi',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error saving category:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Kategori eklenirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Ürün ekleme modalı açıldığında kategorileri yükle
$('#addProductModal').on('show.bs.modal', function () {
    loadCategories();
});

// Ürün düzenleme modalı açıldığında kategorileri yükle
$('#editProductModal').on('show.bs.modal', function () {
    loadCategories();
    
    // Edit modal için de kategorileri edit select'e yükle
    const products = window.api.getProducts();
    products.then(prods => {
        const productCategories = [...new Set(prods.map(p => p.category).filter(Boolean))];
        const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
        const allCategories = [...new Set([...productCategories, ...savedCategories])].sort();
        
        const categorySelect = $('#editProductCategory');
        const currentValue = categorySelect.data('current-value');
        categorySelect.empty();
        categorySelect.append('<option value="">Kategori Seçin</option>');
        
        allCategories.forEach(category => {
            const selected = category === currentValue ? 'selected' : '';
            categorySelect.append(`<option value="${category}" ${selected}>${category}</option>`);
        });
    });
});

// Kategori ekleme modalı açıldığında formu temizle
$('#addCategoryModal').on('show.bs.modal', function () {
    $('#addCategoryForm')[0].reset();
});

// Ürün arama
$('#productSearchInput').on('keyup', function() {
    filterAndSortProducts();
});

// Kategori filtresi
$('#categoryFilter').on('change', function() {
    filterAndSortProducts();
});

// Ürün sıralaması
$('#productSort').on('change', function() {
    filterAndSortProducts();
});

// Rapor dönemi değişimi
$('#reportPeriod').on('change', function() {
    loadDashboard();
});

// Çıkış butonu
$('#logoutBtn').on('click', function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

});

// Load dashboard
async function loadDashboard() {
    try {
        const period = $('#reportPeriod').val() || 'today';
        const orders = await window.api.getOrders();
        const products = await window.api.getProducts();
        
        // Periyoda göre siparişleri filtrele
        const filteredOrders = filterOrdersByPeriod(orders, period);
        
        // Sadece ödenmiş siparişleri al
        const paidOrders = filteredOrders.filter(order => order.status === 'paid');
        
        // Toplam gelir hesapla
        const totalRevenue = paidOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
        
        // Ortalama hesap
        const avgOrder = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
        
        // İstatistikleri güncelle
        $('#totalRevenue').text(totalRevenue.toFixed(2));
        $('#totalOrders').text(paidOrders.length);
        $('#avgOrder').text(avgOrder.toFixed(2));
        $('#totalProducts').text(products.length);
        
        // En çok satan ürünleri hesapla
        await loadTopProducts(paidOrders);
        
        // Grafikleri yükle
        await loadSalesChart(paidOrders, period);
        await loadPaymentChart(paidOrders);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Periyoda göre siparişleri filtrele
function filterOrdersByPeriod(orders, period) {
    if (period === 'all') {
        return orders;
    }
    
    const now = new Date();
    let startDate;
    
    switch(period) {
        case 'today':
            // Bugün saat 00:00:00
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            break;
        case 'week':
            // 7 gün önce
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'month':
            // 30 gün önce
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            break;
        default:
            return orders;
    }
    
    return orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate;
    });
}

// En çok satan ürünleri yükle
async function loadTopProducts(paidOrders) {
    try {
        const productStats = {};
        
        // Her sipariş için ürünleri say
        for (const order of paidOrders) {
            const items = await window.api.getOrderItems(order.id);
            
            items.forEach(item => {
                const productId = item.productId;
                const productName = item.Product ? item.Product.name : 'Bilinmeyen';
                const category = item.Product ? item.Product.category : '-';
                const quantity = parseInt(item.quantity) || 0;
                const revenue = parseFloat(item.price) * quantity;
                
                if (!productStats[productId]) {
                    productStats[productId] = {
                        name: productName,
                        category: category || 'Diğer',
                        quantity: 0,
                        revenue: 0
                    };
                }
                
                productStats[productId].quantity += quantity;
                productStats[productId].revenue += revenue;
            });
        }
        
        // Ürünleri satış adedine göre sırala
        const sortedProducts = Object.values(productStats)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10); // İlk 10 ürün
        
        // Tabloyu doldur
        const tableBody = $('#topProductsTable');
        tableBody.empty();
        
        if (sortedProducts.length === 0) {
            tableBody.append('<tr><td colspan="5" class="text-center">Henüz satış yapılmamış</td></tr>');
            return;
        }
        
        sortedProducts.forEach((product, index) => {
            tableBody.append(`
                <tr>
                    <td><strong>${index + 1}</strong></td>
                    <td>${product.name}</td>
                    <td><span class="badge bg-secondary">${product.category}</span></td>
                    <td><strong>${product.quantity}</strong> adet</td>
                    <td><strong>₺${product.revenue.toFixed(2)}</strong></td>
                </tr>
            `);
        });
        
    } catch (error) {
        console.error('Error loading top products:', error);
    }
}

// Satış grafiğini yükle
async function loadSalesChart(paidOrders, period) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    // Eski grafiği temizle
    if (salesChart) {
        salesChart.destroy();
    }
    
    // Tarihe göre satışları grupla
    const salesByDate = {};
    const now = new Date();
    
    // Periyoda göre label'ları hazırla
    if (period === 'today') {
        // 24 saat için başlangıç değerleri
        for (let i = 0; i < 24; i++) {
            salesByDate[`${i}:00`] = 0;
        }
    } else if (period === 'week') {
        // 7 gün için başlangıç değerleri
        const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
        days.forEach(day => {
            salesByDate[day] = 0;
        });
    } else if (period === 'month') {
        // Son 30 gün için başlangıç değerleri
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = `${d.getDate()}/${d.getMonth() + 1}`;
            salesByDate[key] = 0;
        }
    }
    
    // Siparişleri gruplara ekle
    paidOrders.forEach(order => {
        if (!order.createdAt) return;
        
        const date = new Date(order.createdAt);
        let dateKey;
        
        if (period === 'today') {
            dateKey = `${date.getHours()}:00`;
        } else if (period === 'week') {
            const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
            dateKey = days[date.getDay()];
        } else if (period === 'month') {
            dateKey = `${date.getDate()}/${date.getMonth() + 1}`;
        } else {
            // Tüm zamanlar için günlük gruplama
            dateKey = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        }
        
        if (!salesByDate[dateKey]) {
            salesByDate[dateKey] = 0;
        }
        
        salesByDate[dateKey] += parseFloat(order.totalAmount || 0);
    });
    
    const labels = Object.keys(salesByDate);
    const data = Object.values(salesByDate);
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Satış (₺)',
                data: data,
                borderColor: 'rgb(67, 97, 238)',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Gelir: ₺' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₺' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// Ödeme yöntemi grafiğini yükle
function loadPaymentChart(paidOrders) {
    const ctx = document.getElementById('paymentChart');
    if (!ctx) return;
    
    // Eski grafiği temizle
    if (paymentChart) {
        paymentChart.destroy();
    }
    
    // Ödeme yöntemlerine göre say
    const paymentMethods = {
        cash: 0,
        card: 0
    };
    
    paidOrders.forEach(order => {
        if (order.paymentMethod === 'cash') {
            paymentMethods.cash += parseFloat(order.totalAmount || 0);
        } else if (order.paymentMethod === 'card') {
            paymentMethods.card += parseFloat(order.totalAmount || 0);
        }
    });
    
    paymentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Nakit', 'Kart'],
            datasets: [{
                data: [paymentMethods.cash, paymentMethods.card],
                backgroundColor: [
                    'rgba(72, 187, 120, 0.8)',
                    'rgba(66, 153, 225, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ₺' + context.parsed.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Load tables from database
async function loadTables() {
    try {
        const tables = await window.api.getTables();
        const container = $('#tablesContainer');
        container.empty();
        
        if (tables.length === 0) {
            container.append('<div class="col-12"><p>Hiç masa bulunamadı. Başlamak için yeni bir masa ekleyin.</p></div>');
            return;
        }
        
        // Masa durumlarını kontrol et
        const orders = await window.api.getOrders();
        const occupiedTableIds = orders
            .filter(order => order.status === 'open')
            .map(order => order.tableId);
        
        tables.forEach(table => {
            // ID kontrolü - eğer undefined ise dataValues'dan almayı dene
            const tableId = table.id !== undefined ? table.id : (table.dataValues ? table.dataValues.id : null);
            
            if (!tableId) {
                console.error('Table ID bulunamadı:', table);
                return; // Bu tabloyu atla
            }
            
            const isOccupied = occupiedTableIds.includes(tableId);
            const statusClass = isOccupied ? 'closed' : 'open';
            const statusText = isOccupied ? 'Dolu' : 'Boş';
            
            const tableCard = `
                <div class="col-md-3">
                    <div class="card table-card">
                        <div class="card-body">
                            <div class="table-name"><i class="fas fa-table"></i> ${table.name}</div>
                            <div class="table-status ${statusClass}"><i class="fas fa-circle"></i> ${statusText}</div>
                            <div class="table-actions">
                                <button class="btn btn-danger btn-action" data-action="deleteTable" data-table-id="${tableId}" id="delete-table-${tableId}">
                                    <i class="fas fa-trash"></i> Sil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            const $tableCard = $(tableCard);
            container.append($tableCard);
            
            // Add event listeners to buttons - data attribute kullanarak daha güvenli
            $tableCard.find('[data-action="deleteTable"]').on('click', function() {
                const tableIdFromData = $(this).data('table-id');
                const buttonId = $(this).attr('id');
                
                // Önce data attribute'dan almayı dene, yoksa button ID'den çıkar
                const id = tableIdFromData || buttonId.replace('delete-table-', '');
                
                if (id && id !== 'undefined' && !isNaN(id)) {
                    deleteTable(id);
                } else {
                    console.error('Geçersiz masa ID:', id);
                    Swal.fire({
                        icon: 'error',
                        title: 'Hata',
                        text: 'Geçersiz masa ID',
                        confirmButtonText: 'Tamam'
                    });
                }
            });
        });
    } catch (error) {
        console.error('Error loading tables:', error);
        $('#tablesContainer').html('<div class="col-12"><p>Error loading tables. Please try again.</p></div>');
    }
}

// Load products from database
async function loadProducts() {
    try {
        allProducts = await window.api.getProducts();
        filterAndSortProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        $('#productsContainer').html('<div class="col-12"><p>Error loading products. Please try again.</p></div>');
    }
}

// Kategori filtresini yükle
async function loadCategoryFilter() {
    try {
        const products = await window.api.getProducts();
        const productCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
        const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
        const allCategories = [...new Set([...productCategories, ...savedCategories])].sort();
        
        const categoryFilterSelect = $('#categoryFilter');
        categoryFilterSelect.empty();
        categoryFilterSelect.append('<option value="">Tüm Kategoriler</option>');
        
        allCategories.forEach(category => {
            categoryFilterSelect.append(`<option value="${category}">${category}</option>`);
        });
    } catch (error) {
        console.error('Error loading category filter:', error);
    }
}

// Filter and sort products
function filterAndSortProducts() {
    const container = $('#productsContainer');
    container.empty();
    
    if (allProducts.length === 0) {
        container.append('<div class="col-12"><p>Hiç ürün bulunamadı. Başlamak için yeni bir ürün ekleyin.</p></div>');
        return;
    }
    
    // Arama değerini al
    const searchTerm = $('#productSearchInput').val().toLowerCase().trim();
    
    // Kategori filtresini al
    const selectedCategory = $('#categoryFilter').val();
    
    // Sıralama değerini al
    const sortValue = $('#productSort').val() || 'name-asc';
    
    // Ürünleri filtrele
    let filteredProducts = allProducts.filter(product => {
        // Arama filtresi
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.category && product.category.toLowerCase().includes(searchTerm));
        
        // Kategori filtresi
        const matchesCategory = !selectedCategory || 
            product.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    // Ürünleri sırala
    filteredProducts.sort((a, b) => {
        switch(sortValue) {
            case 'name-asc':
                return a.name.localeCompare(b.name, 'tr');
            case 'name-desc':
                return b.name.localeCompare(a.name, 'tr');
            case 'price-asc':
                return parseFloat(a.price) - parseFloat(b.price);
            case 'price-desc':
                return parseFloat(b.price) - parseFloat(a.price);
            default:
                return 0;
        }
    });
    
    if (filteredProducts.length === 0) {
        container.append('<div class="col-12"><p>Arama kriterlerine uygun ürün bulunamadı.</p></div>');
        return;
    }
    
    // Ürünleri kategorilere göre grupla
    const categories = {};
    filteredProducts.forEach(product => {
        const category = product.category || 'Diğer';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(product);
    });
    
    // Kategorilere göre ürünleri göster
    for (const [category, categoryProducts] of Object.entries(categories)) {
        container.append(`<div class="col-12 mt-4"><h3>${category}</h3></div>`);
        
        categoryProducts.forEach(product => {
            // ID kontrolü
            const productId = product.id !== undefined ? product.id : (product.dataValues ? product.dataValues.id : null);
            
            if (!productId) {
                console.error('Product ID bulunamadı:', product);
                return;
            }
            
            const stock = product.stock !== undefined ? parseInt(product.stock) : 0;
            const lowStockThreshold = product.lowStockThreshold !== undefined ? parseInt(product.lowStockThreshold) : 10;
            const isLowStock = stock <= lowStockThreshold && stock > 0;
            const stockClass = stock === 0 ? 'text-danger' : isLowStock ? 'text-warning' : 'text-success';
            const stockIcon = stock === 0 ? 'fa-times-circle' : isLowStock ? 'fa-exclamation-triangle' : 'fa-check-circle';
            
            const productCard = `
                <div class="col-md-4">
                    <div class="card product-card">
                        <div class="card-body">
                            <div class="product-name">${product.name}</div>
                            <div class="product-price">₺${parseFloat(product.price).toFixed(2)}</div>
                            <div class="product-category">${product.category || 'Kategori Yok'}</div>
                            <div class="product-stock ${stockClass} mb-2">
                                <i class="fas ${stockIcon}"></i> Stok: ${stock} adet
                            </div>
                            <div class="product-actions">
                                <button class="btn btn-primary btn-action btn-sm me-1" data-action="editProduct" data-product-id="${productId}" id="edit-product-${productId}">
                                    <i class="fas fa-edit"></i> Düzenle
                                </button>
                                <button class="btn btn-info btn-action btn-sm me-1" data-action="updateStock" data-product-id="${productId}" id="update-stock-${productId}">
                                    <i class="fas fa-boxes"></i> Stok
                                </button>
                                <button class="btn btn-danger btn-action btn-sm" data-action="deleteProduct" data-product-id="${productId}" id="delete-product-${productId}">
                                    <i class="fas fa-trash"></i> Sil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            const $productCard = $(productCard);
            container.append($productCard);
            
            // Add event listeners to buttons
            $productCard.find('[data-action="editProduct"]').on('click', function() {
                const productIdFromData = $(this).data('product-id');
                const id = productIdFromData || $(this).attr('id').replace('edit-product-', '');
                
                if (id && id !== 'undefined' && !isNaN(id)) {
                    editProduct(id, product);
                } else {
                    console.error('Geçersiz ürün ID:', id);
                }
            });
            
            $productCard.find('[data-action="updateStock"]').on('click', function() {
                const productIdFromData = $(this).data('product-id');
                const id = productIdFromData || $(this).attr('id').replace('update-stock-', '');
                
                if (id && id !== 'undefined' && !isNaN(id)) {
                    updateProductStock(id, product.name, product.stock);
                } else {
                    console.error('Geçersiz ürün ID:', id);
                }
            });
            
            $productCard.find('[data-action="deleteProduct"]').on('click', function() {
                const productIdFromData = $(this).data('product-id');
                const buttonId = $(this).attr('id');
                
                const id = productIdFromData || buttonId.replace('delete-product-', '');
                
                if (id && id !== 'undefined' && !isNaN(id)) {
                    deleteProduct(id);
                } else {
                    console.error('Geçersiz ürün ID:', id);
                    Swal.fire({
                        icon: 'error',
                        title: 'Hata',
                        text: 'Geçersiz ürün ID',
                        confirmButtonText: 'Tamam'
                    });
                }
            });
        });
    }
}

// Load orders from database - sadece masaları göster
async function loadOrders() {
    try {
        const orders = await window.api.getOrders();
        const tables = await window.api.getTables();
        const container = $('#ordersContainer');
        container.empty();
        
        if (tables.length === 0) {
            container.append('<div class="col-12"><p>Hiç masa bulunamadı.</p></div>');
            return;
        }
        
        // Masa durumlarını kontrol et
        const occupiedTableIds = orders
            .filter(order => order.status === 'open')
            .map(order => order.tableId);
        
        // Her masa için açık siparişleri bul
        for (const table of tables) {
            // ID kontrolü
            const tableId = table.id !== undefined ? table.id : (table.dataValues ? table.dataValues.id : null);
            
            if (!tableId) {
                console.error('Table ID bulunamadı:', table);
                continue; // Bu tabloyu atla
            }
            
            const isOccupied = occupiedTableIds.includes(tableId);
            const statusClass = isOccupied ? 'closed' : 'open';
            const statusText = isOccupied ? 'Dolu' : 'Boş';
            
            // Bu masaya ait açık siparişi bul
            const openOrder = orders.find(order => order.tableId === tableId && order.status === 'open');
            let orderItemsHtml = '';
            let orderTotal = 0;
            let orderId = null;
            
            if (openOrder) {
                orderId = openOrder.id !== undefined ? openOrder.id : (openOrder.dataValues ? openOrder.dataValues.id : null);
                
                if (orderId) {
                    try {
                        // Sipariş ürünlerini getir
                        const items = await window.api.getOrderItems(orderId);
                        
                        if (items && items.length > 0) {
                            orderItemsHtml = '<div class="order-items mt-3"><h6 class="mb-2"><i class="fas fa-list"></i> Sipariş Detayları:</h6><ul class="list-group list-group-flush">';
                            
                            items.forEach(item => {
                                const productName = item.Product ? item.Product.name : 'Bilinmeyen Ürün';
                                const quantity = parseInt(item.quantity) || 1;
                                const price = parseFloat(item.price) || 0;
                                const itemTotal = price * quantity;
                                orderTotal += itemTotal;
                                
                                orderItemsHtml += `
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <span>${productName} x${quantity}</span>
                                        <span class="badge bg-primary rounded-pill">₺${itemTotal.toFixed(2)}</span>
                                    </li>
                                `;
                            });
                            
                            orderItemsHtml += `</ul><div class="mt-2 text-end"><strong>Toplam: ₺${orderTotal.toFixed(2)}</strong></div>`;
                            
                            // Sipariş notu varsa göster
                            if (openOrder.note) {
                                orderItemsHtml += `<div class="mt-2"><small class="text-muted"><i class="fas fa-sticky-note"></i> Not: ${openOrder.note}</small></div>`;
                            }
                            
                            orderItemsHtml += '</div>';
                        }
                    } catch (error) {
                        console.error('Error loading order items:', error);
                    }
                }
            }
            
            const tableCard = `
                <div class="col-md-4 mb-4">
                    <div class="card table-card h-100">
                        <div class="card-body">
                            <div class="table-name mb-2"><i class="fas fa-table"></i> ${table.name}</div>
                            <div class="table-status ${statusClass} mb-3"><i class="fas fa-circle"></i> ${statusText}</div>
                            ${orderItemsHtml}
                            <div class="table-actions mt-3">
                                ${isOccupied && orderId ? `
                                    <button class="btn btn-info btn-sm me-2" data-action="viewOrder" data-order-id="${orderId}" id="view-order-${orderId}">
                                        <i class="fas fa-eye"></i> Detaylar
                                    </button>
                                    <button class="btn btn-success btn-sm me-2" data-action="openPayment" data-order-id="${orderId}" id="open-payment-${orderId}">
                                        <i class="fas fa-money-bill"></i> Öde
                                    </button>
                                    <button class="btn btn-danger btn-sm" data-action="cancelOrder" data-order-id="${orderId}" id="cancel-order-${orderId}">
                                        <i class="fas fa-times"></i> İptal
                                    </button>
                                ` : `
                                    <button class="btn btn-primary btn-action" data-action="selectTableForOrder" data-table-id="${tableId}" id="select-table-${tableId}">
                                        <i class="fas fa-cart-plus"></i> Sipariş Ver
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            const $tableCard = $(tableCard);
            container.append($tableCard);
            
            // Add event listeners to buttons
            if (isOccupied && orderId) {
                // Detaylar butonu
                $tableCard.find('[data-action="viewOrder"]').on('click', function() {
                    const orderIdFromData = $(this).data('order-id');
                    const buttonId = $(this).attr('id');
                    const id = orderIdFromData || buttonId.replace('view-order-', '');
                    
                    if (id && id !== 'undefined' && !isNaN(id)) {
                        viewOrder(id);
                    } else {
                        console.error('Geçersiz sipariş ID:', id);
                        Swal.fire({
                            icon: 'error',
                            title: 'Hata',
                            text: 'Geçersiz sipariş ID',
                            confirmButtonText: 'Tamam'
                        });
                    }
                });
                
                // Ödeme butonu
                $tableCard.find('[data-action="openPayment"]').on('click', function() {
                    const orderIdFromData = $(this).data('order-id');
                    const buttonId = $(this).attr('id');
                    const id = orderIdFromData || buttonId.replace('open-payment-', '');
                    
                    if (id && id !== 'undefined' && !isNaN(id)) {
                        openPayment(id);
                    } else {
                        console.error('Geçersiz sipariş ID:', id);
                        Swal.fire({
                            icon: 'error',
                            title: 'Hata',
                            text: 'Geçersiz sipariş ID',
                            confirmButtonText: 'Tamam'
                        });
                    }
                });
                
                // İptal butonu
                $tableCard.find('[data-action="cancelOrder"]').on('click', function() {
                    const orderIdFromData = $(this).data('order-id');
                    const buttonId = $(this).attr('id');
                    const id = orderIdFromData || buttonId.replace('cancel-order-', '');
                    
                    if (id && id !== 'undefined' && !isNaN(id)) {
                        cancelOrder(id);
                    } else {
                        console.error('Geçersiz sipariş ID:', id);
                        Swal.fire({
                            icon: 'error',
                            title: 'Hata',
                            text: 'Geçersiz sipariş ID',
                            confirmButtonText: 'Tamam'
                        });
                    }
                });
            } else {
                // Sipariş Ver butonu
                $tableCard.find('[data-action="selectTableForOrder"]').on('click', function() {
                    const tableIdFromData = $(this).data('table-id');
                    const buttonId = $(this).attr('id');
                    
                    const id = tableIdFromData || buttonId.replace('select-table-', '');
                    
                    if (id && id !== 'undefined' && !isNaN(id)) {
                        selectTableForOrder(id);
                    } else {
                        console.error('Geçersiz masa ID:', id);
                        Swal.fire({
                            icon: 'error',
                            title: 'Hata',
                            text: 'Geçersiz masa ID',
                            confirmButtonText: 'Tamam'
                        });
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        $('#ordersContainer').html('<div class="col-12"><p>Error loading orders. Please try again.</p></div>');
    }
}

// Load order history - tüm siparişleri göster (paid ve cancelled)
async function loadOrderHistory() {
    try {
        const orders = await window.api.getOrders();
        const container = $('#orderHistoryContainer');
        container.empty();
        
        // Sadece ödenmiş ve iptal edilmiş siparişleri göster
        const historyOrders = orders.filter(order => order.status === 'paid' || order.status === 'cancelled');
        
        if (historyOrders.length === 0) {
            container.append('<div class="col-12"><p>Henüz sipariş geçmişi bulunmuyor.</p></div>');
            return;
        }
        
        historyOrders.forEach(order => {
            // ID kontrolü
            const orderId = order.id !== undefined ? order.id : (order.dataValues ? order.dataValues.id : null);
            
            if (!orderId) {
                console.error('Order ID bulunamadı:', order);
                return;
            }
            
            const statusClass = order.status === 'paid' ? 'paid' : 'cancelled';
            const statusText = order.status === 'paid' ? 'Ödendi' : 'İptal';
            const orderTotal = parseFloat(order.totalAmount).toFixed(2);
            const paymentMethodText = order.paymentMethod === 'cash' ? 'Nakit' : order.paymentMethod === 'card' ? 'Kart' : '-';
            
            const orderCard = `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card order-card">
                        <div class="card-body">
                            <div class="order-table">
                                <i class="fas fa-table"></i> 
                                <span>${order.Table ? order.Table.name : 'Bilinmiyor'}</span>
                            </div>
                            <div class="order-info">
                                <div class="order-status ${statusClass}">${statusText}</div>
                                <div class="order-total">₺${orderTotal}</div>
                                <div class="order-payment">
                                    <i class="fas ${order.paymentMethod === 'cash' ? 'fa-money-bill-wave' : order.paymentMethod === 'card' ? 'fa-credit-card' : 'fa-minus'}"></i>
                                    ${paymentMethodText}
                                </div>
                            </div>
                            <div class="order-actions">
                                <button class="btn btn-info btn-action" data-action="viewOrder" data-order-id="${orderId}" id="view-order-history-${orderId}">
                                    <i class="fas fa-eye"></i> Detaylar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            const $orderCard = $(orderCard);
            container.append($orderCard);
            
            // Add event listener
            $orderCard.find('[data-action="viewOrder"]').on('click', function() {
                const orderIdFromData = $(this).data('order-id');
                const buttonId = $(this).attr('id');
                
                const id = orderIdFromData || buttonId.replace('view-order-history-', '');
                
                if (id && id !== 'undefined' && !isNaN(id)) {
                    viewOrder(id);
                } else {
                    console.error('Geçersiz sipariş ID:', id);
                    Swal.fire({
                        icon: 'error',
                        title: 'Hata',
                        text: 'Geçersiz sipariş ID',
                        confirmButtonText: 'Tamam'
                    });
                }
            });
        });
    } catch (error) {
        console.error('Error loading order history:', error);
        $('#orderHistoryContainer').html('<div class="col-12"><p>Error loading order history. Please try again.</p></div>');
    }
}

// Save new table
async function saveTable() {
    const tableName = $('#tableName').val();
    
    if (!tableName || tableName.trim() === '') {
        await Swal.fire({
            icon: 'warning',
            title: 'Uyarı',
            text: 'Lütfen bir masa adı girin',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    const trimmedName = tableName.trim();
    
    try {
        const result = await window.api.createTable(trimmedName);
        $('#addTableModal').modal('hide');
        $('#addTableForm')[0].reset();
        loadTables();
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Masa başarıyla eklendi',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error saving table:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Masa kaydedilirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Save new product
async function saveProduct() {
    const productName = $('#productName').val().trim();
    const productPrice = $('#productPrice').val();
    const productCategory = $('#productCategory').val();
    const productStock = $('#productStock').val();
    const productLowStockThreshold = $('#productLowStockThreshold').val();
    
    if (!productName || !productPrice) {
        await Swal.fire({
            icon: 'warning',
            title: 'Uyarı',
            text: 'Lütfen ürün adı ve fiyatını girin',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    const productData = {
        name: productName,
        price: parseFloat(productPrice),
        category: productCategory || null,
        stock: productStock ? parseInt(productStock) : 0,
        lowStockThreshold: productLowStockThreshold ? parseInt(productLowStockThreshold) : 10
    };
    
    try {
        const result = await window.api.createProduct(productData);
        $('#addProductModal').modal('hide');
        $('#addProductForm')[0].reset();
        loadProducts();
        loadCategories();
        loadCategoryFilter();
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Ürün başarıyla eklendi',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error saving product:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Ürün kaydedilirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Delete table
async function deleteTable(tableId) {
    // tableId'nin geçerli bir sayı olup olmadığını kontrol et
    if (!tableId || tableId === 'undefined') {
        console.error('Geçersiz masa ID (undefined):', tableId);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz masa ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    // Sayıya çevir ve kontrol et
    const numericId = parseInt(tableId);
    if (isNaN(numericId)) {
        console.error('Geçersiz masa ID (NaN):', tableId);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz masa ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Emin misiniz?',
        text: 'Bu masayı silmek istediğinizden emin misiniz?',
        showCancelButton: true,
        confirmButtonText: 'Evet, Sil',
        cancelButtonText: 'İptal',
        confirmButtonColor: '#d33'
    });
    
    if (!result.isConfirmed) {
        return;
    }
    
    try {
        await window.api.deleteTable(numericId);
        loadTables();
        loadOrders();
        loadDashboard();
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Masa başarıyla silindi',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error deleting table:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Masa silinirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Delete product
async function deleteProduct(productId) {
    // productId'nin geçerli bir sayı olup olmadığını kontrol et
    if (!productId || productId === 'undefined') {
        console.error('Geçersiz ürün ID (undefined):', productId);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz ürün ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    // Sayıya çevir ve kontrol et
    const numericId = parseInt(productId);
    if (isNaN(numericId)) {
        console.error('Geçersiz ürün ID (NaN):', productId);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz ürün ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Emin misiniz?',
        text: 'Bu ürünü silmek istediğinizden emin misiniz?',
        showCancelButton: true,
        confirmButtonText: 'Evet, Sil',
        cancelButtonText: 'İptal',
        confirmButtonColor: '#d33'
    });
    
    if (!result.isConfirmed) {
        return;
    }
    
    try {
        await window.api.deleteProduct(numericId);
        loadProducts();
        loadCategories();
        loadCategoryFilter();
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Ürün başarıyla silindi',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Ürün silinirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// openTableOrder fonksiyonu kaldırıldı - yeni sistem kullanılıyor

// Eski addToOrder fonksiyonu kaldırıldı - yeni sistem kullanılıyor

// View order details
async function viewOrder(orderId) {
    // orderId'nin geçerli bir sayı olup olmadığını kontrol et
    if (!orderId || isNaN(orderId)) {
        console.error('Geçersiz sipariş ID:', orderId);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz sipariş ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    // Set current order ID for transfer and other operations
    currentOrderId = parseInt(orderId);
    
    try {
        // Get order items
        const orderItems = await window.api.getOrderItems(parseInt(orderId));
        
        // Get order details
        const orders = await window.api.getOrders();
        const order = orders.find(o => o.id === parseInt(orderId));
        
        // Get table name
        const tables = await window.api.getTables();
        const table = tables.find(t => t.id === (order ? order.tableId : null));
        
        // Update modal with order details
        let total = 0;
        let itemsHtml = '';
        const isOpenOrder = order && order.status === 'open';
        
        orderItems.forEach(item => {
            // Fiyat ve miktar değerlerinin geçerli olup olmadığını kontrol et
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            
            if (isNaN(price) || isNaN(quantity)) {
                console.error('Geçersiz fiyat veya miktar:', item);
                return;
            }
            
            const itemTotal = price * quantity;
            total += itemTotal;
            
            itemsHtml += `
                <tr data-item-id="${item.id}">
                    <td>${item.Product ? item.Product.name : 'Bilinmeyen Ürün'}</td>
                    <td>${quantity}</td>
                    <td>₺${price.toFixed(2)}</td>
                    <td>₺${itemTotal.toFixed(2)}</td>
                    ${isOpenOrder ? `
                    <td>
                        <button class="btn btn-warning btn-sm me-1" onclick="changeOrderItemQuantity(${item.id}, ${quantity}, '${item.Product ? item.Product.name : 'Ürün'}', ${orderId})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteOrderItem(${item.id}, '${item.Product ? item.Product.name : 'Ürün'}', ${orderId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                    ` : '<td>-</td>'}
                </tr>
            `;
        });
        
        $('#orderItemsTable').html(itemsHtml);
        $('#orderTotal').text(total.toFixed(2));
        $('#orderTableName').text(table ? table.name : 'Bilinmiyor');
        $('#orderStatus').text(order && order.status === 'open' ? 'Açık' : order && order.status === 'paid' ? 'Ödendi' : 'İptal');
        
        // Handle order note
        const orderNote = order && order.note ? order.note : '';
        $('#orderNote').val(orderNote);
        
        if (isOpenOrder) {
            // Açık siparişlerde not düzenlenebilir
            $('#orderNote').prop('disabled', false);
            $('#saveOrderNoteBtn').show();
            $('#orderNoteDisplay').hide();
        } else {
            // Kapalı siparişlerde sadece görüntüleme
            $('#orderNote').prop('disabled', true);
            $('#saveOrderNoteBtn').hide();
            if (orderNote) {
                $('#orderNoteDisplay').text('Not: ' + orderNote).show();
            } else {
                $('#orderNoteDisplay').hide();
            }
        }
        
        // Save order note button handler
        $('#saveOrderNoteBtn').off('click').on('click', function() {
            saveOrderNote(orderId);
        });
        
        // Hide payment section and buttons when just viewing
        $('#paymentSection').hide();
        $('#payOrderBtn').hide();
        $('#cancelOrderBtn').hide();
        
        // Transfer butonu sadece açık siparişlerde görünsün
        if (isOpenOrder) {
            $('#transferOrderBtn').show();
            $('#printKitchenBtn').show(); // Mutfak adisyonu açık siparişlerde
            $('#printReceiptBtn').hide();
        } else {
            $('#transferOrderBtn').hide();
            $('#printKitchenBtn').hide();
            // Ödenmiş siparişlerde fiş yazdır göster
            if (order && order.status === 'paid') {
                $('#printReceiptBtn').show();
            } else {
                $('#printReceiptBtn').hide();
            }
        }
        
        // Show modal
        $('#orderDetailModal').modal('show');
    } catch (error) {
        console.error('Error viewing order:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Sipariş detayları görüntülenirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Open payment for an order
async function openPayment(orderId) {
    // orderId'nin geçerli bir sayı olup olmadığını kontrol et
    if (!orderId || isNaN(orderId)) {
        console.error('Geçersiz sipariş ID:', orderId);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz sipariş ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    currentOrderId = parseInt(orderId);
    
    // Load order details first
    await viewOrder(orderId);
    
    // Show payment section and buttons
    $('#paymentSection').show();
    $('#payOrderBtn').show();
    $('#cancelOrderBtn').show();
    $('#transferOrderBtn').hide(); // Ödeme modunda transfer gizli
    $('#printReceiptBtn').hide();
    $('#printKitchenBtn').hide();
}

// Pay order
async function payOrder() {
    // currentOrderId'nin geçerli bir sayı olup olmadığını kontrol et
    if (!currentOrderId || isNaN(currentOrderId)) {
        console.error('Geçersiz sipariş ID:', currentOrderId);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz sipariş ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    const paymentMethod = $('input[name="paymentMethod"]:checked').val();
    
    if (!paymentMethod) {
        await Swal.fire({
            icon: 'warning',
            title: 'Uyarı',
            text: 'Lütfen bir ödeme yöntemi seçin',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    try {
        await window.api.updateOrderStatus(parseInt(currentOrderId), 'paid', paymentMethod);
        $('#orderDetailModal').modal('hide');
        $('input[name="paymentMethod"]').prop('checked', false);
        
        // Masa durumunu güncelle - ödeme sonrası masayı boşalt
        const orders = await window.api.getOrders();
        const order = orders.find(o => o.id === parseInt(currentOrderId));
        if (order) {
            await window.api.updateTableStatus(order.tableId, 'available');
        }
        
        loadTables();
        loadOrders();
        loadOrderHistory();
        loadDashboard();
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Sipariş başarıyla ödendi ve masa boşaltıldı!',
            timer: 2000,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error paying order:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Ödeme işlemi sırasında hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Cancel order
async function cancelOrder(orderId = null) {
    const id = orderId || currentOrderId;
    
    // id'nin geçerli bir sayı olup olmadığını kontrol et
    if (!id || isNaN(id)) {
        console.error('Geçersiz sipariş ID:', id);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz sipariş ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Emin misiniz?',
        text: 'Bu siparişi iptal etmek istediğinizden emin misiniz?',
        showCancelButton: true,
        confirmButtonText: 'Evet, İptal Et',
        cancelButtonText: 'Vazgeç',
        confirmButtonColor: '#d33'
    });
    
    if (!result.isConfirmed) {
        return;
    }
    
    try {
        await window.api.updateOrderStatus(parseInt(id), 'cancelled');
        
        if (!orderId) {
            $('#orderDetailModal').modal('hide');
        }
        
        // Masa durumunu güncelle
        const orders = await window.api.getOrders();
        const order = orders.find(o => o.id === parseInt(id));
        if (order) {
            await window.api.updateTableStatus(order.tableId, 'available');
        }
        
        loadTables();
        loadOrders();
        loadOrderHistory();
        loadDashboard();
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Sipariş başarıyla iptal edildi ve masa boşaltıldı!',
            timer: 2000,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'İptal işlemi sırasında hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Select table for order
async function selectTableForOrder(tableId) {
    // tableId'nin geçerli bir sayı olup olmadığını kontrol et
    if (!tableId || tableId === 'undefined') {
        console.error('Geçersiz masa ID (undefined):', tableId);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz masa ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    // Sayıya çevir ve kontrol et
    const numericId = parseInt(tableId);
    if (isNaN(numericId)) {
        console.error('Geçersiz masa ID (NaN):', tableId);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz masa ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    try {
        // Önce açık bir sipariş olup olmadığını kontrol et
        const orders = await window.api.getOrders();
        const existingOrder = orders.find(order => order.tableId === numericId && order.status === 'open');
        
        let orderId;
        
        if (existingOrder) {
            // Eğer açık sipariş varsa onu kullan
            orderId = existingOrder.id;
        } else {
            // Yeni sipariş oluştur
            const orderData = {
                tableId: numericId,
                status: 'open',
                totalAmount: 0.00
            };
            
            const newOrder = await window.api.createOrder(orderData);
            orderId = newOrder.id;
        }
        
        // Ürün seçimi için ürün listesini göster
        loadProductsForOrder(orderId);
    } catch (error) {
        console.error('Error selecting table for order:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Sipariş oluşturulurken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Load products for order
async function loadProductsForOrder(orderId) {
    try {
        const products = await window.api.getProducts();
        const container = $('#productsContainer');
        container.empty();
        
        if (products.length === 0) {
            container.append('<div class="col-12"><p>Hiç ürün bulunamadı.</p></div>');
            return;
        }
        
        // Ürünleri kategorilere göre grupla
        const categories = {};
        products.forEach(product => {
            const category = product.category || 'Diğer';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(product);
        });
        
        // Kategorilere göre ürünleri göster
        for (const [category, categoryProducts] of Object.entries(categories)) {
            container.append(`<div class="col-12 mt-4"><h3>${category}</h3></div>`);
            
            categoryProducts.forEach(product => {
                // ID kontrolü - eğer undefined ise dataValues'dan almayı dene
                const productId = product.id !== undefined ? product.id : (product.dataValues ? product.dataValues.id : null);
                
                if (!productId) {
                    console.error('Product ID bulunamadı:', product);
                    return; // Bu ürünü atla
                }
                
                const productCard = `
                    <div class="col-md-4">
                        <div class="card product-card">
                            <div class="card-body">
                                <div class="product-name">${product.name}</div>
                                <div class="product-price">₺${parseFloat(product.price).toFixed(2)}</div>
                                <div class="product-actions">
                                    <button class="btn btn-primary btn-action" data-action="addProductToOrder" data-order-id="${orderId}" data-product-id="${productId}" data-product-name="${product.name}" data-price="${product.price}">
                                        <i class="fas fa-cart-plus"></i> Siparişe Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                const $productCard = $(productCard);
                container.append($productCard);
                
                // Add event listeners to buttons
                $productCard.find('[data-action="addProductToOrder"]').on('click', async function() {
                    const orderId = $(this).data('order-id');
                    const productId = $(this).data('product-id');
                    const productName = $(this).data('product-name');
                    const price = $(this).data('price');
                    if (orderId && productId && productName && price) {
                        // Adet sor
                        const { value: quantity } = await Swal.fire({
                            title: 'Adet Seçin',
                            text: `${productName} ürünü için adet girin`,
                            input: 'number',
                            inputValue: 1,
                            inputAttributes: {
                                min: 1,
                                step: 1
                            },
                            showCancelButton: true,
                            confirmButtonText: 'Ekle',
                            cancelButtonText: 'İptal',
                            inputValidator: (value) => {
                                if (!value || value < 1) {
                                    return 'Lütfen geçerli bir adet girin (en az 1)';
                                }
                            }
                        });
                        
                        if (quantity) {
                            addProductToOrder(orderId, productId, productName, parseFloat(price), parseInt(quantity));
                        }
                    }
                });
            });
        }
        
        // Ürünler sekmesine geç
        $('#products-tab').tab('show');
    } catch (error) {
        console.error('Error loading products for order:', error);
        $('#productsContainer').html('<div class="col-12"><p>Error loading products. Please try again.</p></div>');
    }
}

// Add product to order
async function addProductToOrder(orderId, productId, productName, price, quantity = 1) {
    // Parametrelerin geçerli olup olmadığını kontrol et
    if (!orderId || isNaN(orderId) || !productId || isNaN(productId) || !productName || !price || isNaN(price) || !quantity || isNaN(quantity) || quantity < 1) {
        console.error('Geçersiz parametreler:', { orderId, productId, productName, price, quantity });
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz parametreler',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    try {
        // Stok kontrolü
        const products = await window.api.getProducts();
        const product = products.find(p => p.id === parseInt(productId));
        
        if (product && product.stock < quantity) {
            await Swal.fire({
                icon: 'error',
                title: 'Yetersiz Stok',
                text: `${productName} ürününün stoğu yetersiz! Mevcut: ${product.stock}, İstenen: ${quantity}`,
                confirmButtonText: 'Tamam'
            });
            return;
        }
        
        // Sipariş öğesi oluştur
        const orderItemData = {
            orderId: parseInt(orderId),
            productId: parseInt(productId),
            quantity: parseInt(quantity),
            price: parseFloat(price)
        };
        
        await window.api.addOrderItem(orderItemData);
        
        // Stoktan düş
        if (product && product.stock > 0) {
            const stockResult = await window.api.decreaseProductStock(parseInt(productId), parseInt(quantity));
            
            // Düşük stok uyarısı
            if (stockResult.lowStock) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'warning',
                    title: `${productName} stoğu düşük!`,
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        }
        
        // Masa durumunu güncelle
        const orders = await window.api.getOrders();
        const order = orders.find(o => o.id === parseInt(orderId));
        if (order) {
            await window.api.updateTableStatus(order.tableId, 'occupied');
        }
        
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: `${quantity} adet ${productName} ürünü siparişe eklendi`,
            timer: 1500,
            showConfirmButton: false
        });
        loadTables();
        loadOrders();
        loadDashboard();
        loadProducts(); // Stok güncellemesi için
    } catch (error) {
        console.error('Error adding product to order:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Ürün siparişe eklenirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Delete order item from order
async function deleteOrderItem(orderItemId, productName, orderId) {
    if (!orderItemId || isNaN(orderItemId)) {
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz sipariş öğesi ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Emin misiniz?',
        text: `${productName} ürününü siparişten çıkarmak istediğinizden emin misiniz?`,
        showCancelButton: true,
        confirmButtonText: 'Evet, Çıkar',
        cancelButtonText: 'İptal',
        confirmButtonColor: '#d33'
    });
    
    if (!result.isConfirmed) {
        return;
    }
    
    try {
        await window.api.deleteOrderItem(parseInt(orderItemId));
        
        // Siparişi yeniden yükle
        await viewOrder(orderId);
        
        // Eğer sipariş boş kaldıysa kontrol et
        const orderItems = await window.api.getOrderItems(parseInt(orderId));
        if (orderItems.length === 0) {
            // Sipariş boş kaldıysa masayı boşalt
            const orders = await window.api.getOrders();
            const order = orders.find(o => o.id === parseInt(orderId));
            if (order) {
                await window.api.updateTableStatus(order.tableId, 'available');
            }
        }
        
        loadTables();
        loadOrders();
        loadOrderHistory();
        loadDashboard();
        
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Ürün siparişten çıkarıldı',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error deleting order item:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Ürün silinirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Change order item quantity
async function changeOrderItemQuantity(orderItemId, currentQuantity, productName, orderId) {
    if (!orderItemId || isNaN(orderItemId)) {
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz sipariş öğesi ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    const { value: newQuantity } = await Swal.fire({
        title: 'Adet Değiştir',
        text: `${productName} için yeni adet girin`,
        input: 'number',
        inputValue: currentQuantity,
        inputAttributes: {
            min: 1,
            step: 1
        },
        showCancelButton: true,
        confirmButtonText: 'Güncelle',
        cancelButtonText: 'İptal',
        inputValidator: (value) => {
            if (!value || value < 1) {
                return 'Lütfen geçerli bir adet girin (en az 1)';
            }
        }
    });
    
    if (!newQuantity || parseInt(newQuantity) === currentQuantity) {
        return;
    }
    
    try {
        await window.api.updateOrderItemQuantity(parseInt(orderItemId), parseInt(newQuantity));
        
        // Siparişi yeniden yükle
        await viewOrder(orderId);
        
        loadTables();
        loadOrders();
        loadOrderHistory();
        loadDashboard();
        
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Ürün adedi güncellendi',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error updating order item quantity:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Ürün adedi güncellenirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Save order note
async function saveOrderNote(orderId) {
    if (!orderId || isNaN(orderId)) {
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz sipariş ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    const note = $('#orderNote').val().trim();
    
    try {
        await window.api.updateOrderNote(parseInt(orderId), note);
        
        loadOrders();
        loadOrderHistory();
        loadDashboard();
        
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Sipariş notu kaydedildi',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error saving order note:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Sipariş notu kaydedilirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Transfer order to another table
async function transferOrder() {
    if (!currentOrderId || isNaN(currentOrderId)) {
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz sipariş ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    try {
        // Mevcut siparişi al
        const orders = await window.api.getOrders();
        const currentOrder = orders.find(o => o.id === parseInt(currentOrderId));
        
        if (!currentOrder) {
            throw new Error('Sipariş bulunamadı');
        }
        
        // Tüm masaları al
        const tables = await window.api.getTables();
        
        // Açık siparişleri al
        const openOrders = orders.filter(o => o.status === 'open');
        const occupiedTableIds = openOrders.map(o => o.tableId);
        
        // Mevcut masa hariç boş masaları listele
        const availableTables = tables.filter(t => 
            t.id !== currentOrder.tableId && !occupiedTableIds.includes(t.id)
        );
        
        if (availableTables.length === 0) {
            await Swal.fire({
                icon: 'info',
                title: 'Bilgi',
                text: 'Transfer yapılabilecek boş masa yok. Tüm diğer masalar dolu.',
                confirmButtonText: 'Tamam'
            });
            return;
        }
        
        // Masa seçimi için HTML oluştur (boş masalar)
        const tableOptions = availableTables.map(table => 
            `<option value="${table.id}">${table.name} (Boş)</option>`
        ).join('');
        
        const { value: newTableId } = await Swal.fire({
            title: 'Masa Transfer',
            html: `
                <div class="mb-3">
                    <p class="mb-3">Siparişi boş bir masaya transfer edin:</p>
                    <select id="transferTableSelect" class="form-select form-select-lg">
                        <option value="">Boş Masa Seçin</option>
                        ${tableOptions}
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Transfer Et',
            cancelButtonText: 'İptal',
            confirmButtonColor: '#f59e0b',
            width: '500px',
            preConfirm: () => {
                const selectedTable = document.getElementById('transferTableSelect').value;
                if (!selectedTable) {
                    Swal.showValidationMessage('Lütfen bir masa seçin');
                    return false;
                }
                return selectedTable;
            }
        });
        
        if (!newTableId) {
            return;
        }
        
        // Transfer işlemini gerçekleştir
        await window.api.transferOrder(parseInt(currentOrderId), parseInt(newTableId));
        
        // Modal'ı kapat
        $('#orderDetailModal').modal('hide');
        
        // Tüm görünümleri güncelle
        loadTables();
        loadOrders();
        loadOrderHistory();
        loadDashboard();
        
        // Yeni masanın adını al
        const newTable = tables.find(t => t.id === parseInt(newTableId));
        const newTableName = newTable ? newTable.name : 'Seçilen masa';
        
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: `Sipariş ${newTableName} masasına transfer edildi`,
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('Error transferring order:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: error.message || 'Sipariş transfer edilirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Print receipt (Fiş Yazdır)
async function printReceipt() {
    if (!currentOrderId || isNaN(currentOrderId)) {
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz sipariş ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    try {
        const orders = await window.api.getOrders();
        const order = orders.find(o => o.id === parseInt(currentOrderId));
        
        if (!order) {
            throw new Error('Sipariş bulunamadı');
        }
        
        const tables = await window.api.getTables();
        const table = tables.find(t => t.id === order.tableId);
        const orderItems = await window.api.getOrderItems(parseInt(currentOrderId));
        
        const now = new Date();
        const dateStr = now.toLocaleDateString('tr-TR');
        const timeStr = now.toLocaleTimeString('tr-TR');
        
        let itemsHtml = '';
        let total = 0;
        
        orderItems.forEach(item => {
            const quantity = parseInt(item.quantity);
            const price = parseFloat(item.price);
            const itemTotal = price * quantity;
            total += itemTotal;
            
            itemsHtml += `
                <tr>
                    <td>${item.Product ? item.Product.name : 'Ürün'}</td>
                    <td style="text-align: center;">${quantity}</td>
                    <td style="text-align: right;">₺${price.toFixed(2)}</td>
                    <td style="text-align: right;">₺${itemTotal.toFixed(2)}</td>
                </tr>
            `;
        });
        
        const paymentMethodText = order.paymentMethod === 'cash' ? 'Nakit' : 'Kredi Kartı';
        
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Fiş - Sipariş #${order.id}</title>
                <style>
                    @media print {
                        body { margin: 0; }
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        padding: 20px;
                        max-width: 300px;
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px dashed #000;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }
                    .header h2 {
                        margin: 5px 0;
                        font-size: 20px;
                    }
                    .info {
                        margin-bottom: 15px;
                        font-size: 12px;
                    }
                    .info div {
                        margin: 3px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                        font-size: 12px;
                    }
                    th, td {
                        padding: 5px 2px;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        text-align: left;
                        border-bottom: 2px solid #000;
                    }
                    .total-section {
                        border-top: 2px dashed #000;
                        padding-top: 10px;
                        margin-top: 10px;
                    }
                    .total {
                        font-size: 16px;
                        font-weight: bold;
                        text-align: right;
                        margin: 10px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        border-top: 2px dashed #000;
                        padding-top: 10px;
                        font-size: 11px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>MODERN POS SİSTEMİ</h2>
                    <div>Restoran Adı</div>
                </div>
                
                <div class="info">
                    <div><strong>Tarih:</strong> ${dateStr} ${timeStr}</div>
                    <div><strong>Masa:</strong> ${table ? table.name : 'Bilinmiyor'}</div>
                    <div><strong>Sipariş No:</strong> #${order.id}</div>
                    <div><strong>Ödeme:</strong> ${paymentMethodText}</div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Ürün</th>
                            <th style="text-align: center;">Adet</th>
                            <th style="text-align: right;">Fiyat</th>
                            <th style="text-align: right;">Toplam</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <div class="total">TOPLAM: ₺${total.toFixed(2)}</div>
                </div>
                
                <div class="footer">
                    <div>Bizi tercih ettiğiniz için teşekkürler!</div>
                    <div>Afiyet olsun!</div>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 100);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        
    } catch (error) {
        console.error('Error printing receipt:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Fiş yazdırılırken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Print kitchen order (Mutfak Adisyonu)
async function printKitchenOrder() {
    if (!currentOrderId || isNaN(currentOrderId)) {
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz sipariş ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    try {
        const orders = await window.api.getOrders();
        const order = orders.find(o => o.id === parseInt(currentOrderId));
        
        if (!order) {
            throw new Error('Sipariş bulunamadı');
        }
        
        const tables = await window.api.getTables();
        const table = tables.find(t => t.id === order.tableId);
        const orderItems = await window.api.getOrderItems(parseInt(currentOrderId));
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('tr-TR');
        
        let itemsHtml = '';
        
        orderItems.forEach(item => {
            const quantity = parseInt(item.quantity);
            itemsHtml += `
                <div class="item">
                    <div class="item-name">${item.Product ? item.Product.name : 'Ürün'}</div>
                    <div class="item-quantity">ADET: ${quantity}</div>
                </div>
            `;
        });
        
        const printWindow = window.open('', '', 'width=400,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mutfak Adisyonu - Sipariş #${order.id}</title>
                <style>
                    @media print {
                        body { margin: 0; }
                    }
                    body {
                        font-family: 'Arial Black', Arial, sans-serif;
                        padding: 15px;
                        max-width: 250px;
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px double #000;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .header .subtitle {
                        font-size: 14px;
                        margin-top: 5px;
                    }
                    .table-info {
                        background: #000;
                        color: #fff;
                        padding: 10px;
                        text-align: center;
                        font-size: 28px;
                        font-weight: bold;
                        margin-bottom: 15px;
                    }
                    .time {
                        text-align: center;
                        font-size: 14px;
                        margin-bottom: 15px;
                    }
                    .item {
                        margin-bottom: 15px;
                        padding-bottom: 15px;
                        border-bottom: 1px dashed #000;
                    }
                    .item-name {
                        font-size: 18px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-bottom: 5px;
                    }
                    .item-quantity {
                        font-size: 22px;
                        font-weight: bold;
                        margin-top: 5px;
                    }
                    .note {
                        background: #ffeb3b;
                        padding: 10px;
                        margin-top: 15px;
                        font-weight: bold;
                        border: 2px solid #000;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>MUTFAK</h1>
                    <div class="subtitle">Sipariş #${order.id}</div>
                </div>
                
                <div class="table-info">
                    ${table ? table.name : 'MASA ?'}
                </div>
                
                <div class="time">
                    Saat: ${timeStr}
                </div>
                
                ${itemsHtml}
                
                ${order.note ? `<div class="note">NOT: ${order.note}</div>` : ''}
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 100);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        
    } catch (error) {
        console.error('Error printing kitchen order:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Mutfak adisyonu yazdırılırken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Print Z Report (Gün Sonu Raporu)
async function printZReport() {
    try {
        const orders = await window.api.getOrders();
        const products = await window.api.getProducts();
        
        // Bugünün siparişlerini al
        const todayOrders = filterOrdersByPeriod(orders, 'today');
        const paidOrders = todayOrders.filter(o => o.status === 'paid');
        const cancelledOrders = todayOrders.filter(o => o.status === 'cancelled');
        
        // Toplam gelir
        const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
        
        // Ödeme yöntemlerine göre
        const cashTotal = paidOrders
            .filter(o => o.paymentMethod === 'cash')
            .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
        const cardTotal = paidOrders
            .filter(o => o.paymentMethod === 'card')
            .reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
        
        // Ürün satış istatistikleri
        const productStats = {};
        for (const order of paidOrders) {
            const items = await window.api.getOrderItems(order.id);
            items.forEach(item => {
                const productId = item.productId;
                const productName = item.Product ? item.Product.name : 'Bilinmeyen';
                const quantity = parseInt(item.quantity) || 0;
                const revenue = parseFloat(item.price) * quantity;
                
                if (!productStats[productId]) {
                    productStats[productId] = {
                        name: productName,
                        quantity: 0,
                        revenue: 0
                    };
                }
                
                productStats[productId].quantity += quantity;
                productStats[productId].revenue += revenue;
            });
        }
        
        const sortedProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
        
        let productStatsHtml = '';
        sortedProducts.forEach((p, index) => {
            productStatsHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${p.name}</td>
                    <td style="text-align: center;">${p.quantity}</td>
                    <td style="text-align: right;">₺${p.revenue.toFixed(2)}</td>
                </tr>
            `;
        });
        
        const now = new Date();
        const dateStr = now.toLocaleDateString('tr-TR');
        const timeStr = now.toLocaleTimeString('tr-TR');
        
        const printWindow = window.open('', '', 'width=800,height=1000');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Z Raporu - ${dateStr}</title>
                <style>
                    @media print {
                        body { margin: 0; }
                    }
                    body {
                        font-family: Arial, sans-serif;
                        padding: 30px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px solid #000;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }
                    .header h1 {
                        margin: 5px 0;
                        font-size: 28px;
                    }
                    .section {
                        margin: 20px 0;
                        padding: 15px;
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 5px;
                    }
                    .section h3 {
                        margin-top: 0;
                        color: #333;
                        border-bottom: 2px solid #007bff;
                        padding-bottom: 5px;
                    }
                    .stats-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin: 15px 0;
                    }
                    .stat-box {
                        background: white;
                        padding: 15px;
                        border-radius: 5px;
                        border: 1px solid #dee2e6;
                    }
                    .stat-label {
                        font-size: 12px;
                        color: #666;
                        margin-bottom: 5px;
                    }
                    .stat-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #007bff;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                        background: white;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background: #007bff;
                        color: white;
                        font-weight: bold;
                    }
                    .total-row {
                        background: #e9ecef;
                        font-weight: bold;
                        font-size: 16px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 15px;
                        border-top: 3px solid #000;
                        font-size: 12px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Z RAPORU (GÜN SONU)</h1>
                    <div>Modern POS Sistemi</div>
                    <div>${dateStr} - ${timeStr}</div>
                </div>
                
                <div class="section">
                    <h3>📊 Özet Bilgiler</h3>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-label">Toplam Satış</div>
                            <div class="stat-value">${paidOrders.length}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">İptal Edilen</div>
                            <div class="stat-value">${cancelledOrders.length}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Nakit</div>
                            <div class="stat-value">₺${cashTotal.toFixed(2)}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Kredi Kartı</div>
                            <div class="stat-value">₺${cardTotal.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h3>💰 Gelir Özeti</h3>
                    <table>
                        <tr>
                            <td>Nakit Toplam:</td>
                            <td style="text-align: right; font-weight: bold;">₺${cashTotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Kredi Kartı Toplam:</td>
                            <td style="text-align: right; font-weight: bold;">₺${cardTotal.toFixed(2)}</td>
                        </tr>
                        <tr class="total-row">
                            <td>TOPLAM GELİR:</td>
                            <td style="text-align: right;">₺${totalRevenue.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="section">
                    <h3>🍽️ Ürün Satış Detayları</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Ürün Adı</th>
                                <th style="text-align: center;">Satış Adedi</th>
                                <th style="text-align: right;">Gelir</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productStatsHtml || '<tr><td colspan="4" style="text-align: center;">Satış yapılmadı</td></tr>'}
                        </tbody>
                    </table>
                </div>
                
                <div class="footer">
                    <div>Bu rapor ${dateStr} tarihinde ${timeStr} saatinde oluşturulmuştur.</div>
                    <div>Modern POS Sistemi - Tüm hakları saklıdır.</div>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        
    } catch (error) {
        console.error('Error printing Z report:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Z raporu yazdırılırken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Update product stock
async function updateProductStock(productId, productName, currentStock) {
    if (!productId || isNaN(productId)) {
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz ürün ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    const { value: newStock } = await Swal.fire({
        title: 'Stok Güncelle',
        html: `
            <p><strong>${productName}</strong></p>
            <p class="mb-3">Mevcut Stok: <strong>${currentStock}</strong> adet</p>
            <label for="stockInput" class="form-label">Yeni Stok Miktarı:</label>
        `,
        input: 'number',
        inputValue: currentStock,
        inputAttributes: {
            min: 0,
            step: 1
        },
        showCancelButton: true,
        confirmButtonText: 'Güncelle',
        cancelButtonText: 'İptal',
        inputValidator: (value) => {
            if (value === '' || value < 0) {
                return 'Lütfen geçerli bir stok miktarı girin';
            }
        }
    });
    
    if (newStock === undefined) {
        return;
    }
    
    try {
        await window.api.updateProductStock(parseInt(productId), parseInt(newStock));
        
        loadProducts();
        loadDashboard();
        
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Stok başarıyla güncellendi',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: error.message || 'Stok güncellenirken hata oluştu',
            confirmButtonText: 'Tamam'
        });
    }
}

// Show low stock alert
async function showLowStockAlert() {
    try {
        const lowStockProducts = await window.api.getLowStockProducts();
        
        if (lowStockProducts.length === 0) {
            await Swal.fire({
                icon: 'success',
                title: 'Harika!',
                text: 'Tüm ürünlerin stoku yeterli seviyede',
                confirmButtonText: 'Tamam'
            });
            return;
        }
        
        let productsHtml = '<div class="list-group text-start">';
        lowStockProducts.forEach(product => {
            const stockClass = product.stock === 0 ? 'danger' : 'warning';
            productsHtml += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${product.name}</strong>
                        <small class="d-block text-muted">${product.category || 'Kategori Yok'}</small>
                    </div>
                    <span class="badge bg-${stockClass} rounded-pill">
                        ${product.stock} / ${product.lowStockThreshold}
                    </span>
                </div>
            `;
        });
        productsHtml += '</div>';
        
        await Swal.fire({
            icon: 'warning',
            title: 'Düşük Stok Uyarısı',
            html: `
                <p class="mb-3">${lowStockProducts.length} ürünün stoğu düşük:</p>
                ${productsHtml}
            `,
            width: '600px',
            confirmButtonText: 'Tamam'
        });
        
    } catch (error) {
        console.error('Error loading low stock products:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Stok bilgileri yüklenirken hata oluştu',
            confirmButtonText: 'Tamam'
        });
    }
}

// Check and show low stock notification on load
async function checkLowStockOnLoad() {
    try {
        const lowStockProducts = await window.api.getLowStockProducts();
        
        if (lowStockProducts.length > 0) {
            // Toast bildirimi göster
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: `${lowStockProducts.length} ürünün stoğu düşük!`,
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true
            });
        }
    } catch (error) {
        console.error('Error checking low stock:', error);
    }
}

// Edit product
async function editProduct(productId, product) {
    if (!productId || isNaN(productId)) {
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Geçersiz ürün ID',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    // Form alanlarını doldur
    $('#editProductId').val(productId);
    $('#editProductName').val(product.name);
    $('#editProductPrice').val(product.price);
    $('#editProductCategory').data('current-value', product.category);
    $('#editProductCategory').val(product.category);
    $('#editProductLowStockThreshold').val(product.lowStockThreshold || 10);
    
    // Modal'ı aç
    $('#editProductModal').modal('show');
}

// Update product
async function updateProduct() {
    const productId = $('#editProductId').val();
    const productName = $('#editProductName').val().trim();
    const productPrice = $('#editProductPrice').val();
    const productCategory = $('#editProductCategory').val();
    const productLowStockThreshold = $('#editProductLowStockThreshold').val();
    
    if (!productName || !productPrice) {
        await Swal.fire({
            icon: 'warning',
            title: 'Uyarı',
            text: 'Lütfen ürün adı ve fiyatını girin',
            confirmButtonText: 'Tamam'
        });
        return;
    }
    
    const productData = {
        name: productName,
        price: parseFloat(productPrice),
        category: productCategory || null,
        lowStockThreshold: productLowStockThreshold ? parseInt(productLowStockThreshold) : 10
    };
    
    try {
        await window.api.updateProduct(parseInt(productId), productData);
        $('#editProductModal').modal('hide');
        $('#editProductForm')[0].reset();
        loadProducts();
        loadCategories();
        loadCategoryFilter();
        
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: 'Ürün başarıyla güncellendi',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error updating product:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Ürün güncellenirken hata oluştu. Lütfen tekrar deneyin.',
            confirmButtonText: 'Tamam'
        });
    }
}

// Bulk stock entry
async function bulkStockEntry() {
    try {
        const products = await window.api.getProducts();
        
        if (products.length === 0) {
            await Swal.fire({
                icon: 'info',
                title: 'Bilgi',
                text: 'Henüz ürün eklenmemiş',
                confirmButtonText: 'Tamam'
            });
            return;
        }
        
        // Ürün listesi HTML'i oluştur
        let productsHtml = '<div class="stock-entry-list">';
        products.forEach(product => {
            const stock = parseInt(product.stock) || 0;
            productsHtml += `
                <div class="stock-entry-item mb-3 p-3 border rounded">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <strong>${product.name}</strong>
                            <small class="d-block text-muted">${product.category || 'Kategori Yok'}</small>
                        </div>
                        <span class="badge bg-primary">Mevcut: ${stock}</span>
                    </div>
                    <div class="input-group">
                        <span class="input-group-text">Yeni Stok</span>
                        <input type="number" class="form-control stock-input" 
                               data-product-id="${product.id}" 
                               value="${stock}" 
                               min="0"
                               placeholder="Stok miktarı">
                    </div>
                </div>
            `;
        });
        productsHtml += '</div>';
        
        const result = await Swal.fire({
            title: 'Toplu Stok Girişi',
            html: productsHtml,
            width: '700px',
            showCancelButton: true,
            confirmButtonText: 'Tümünü Kaydet',
            cancelButtonText: 'İptal',
            customClass: {
                container: 'stock-entry-modal'
            },
            preConfirm: () => {
                const stockUpdates = [];
                document.querySelectorAll('.stock-input').forEach(input => {
                    const productId = input.getAttribute('data-product-id');
                    const newStock = parseInt(input.value) || 0;
                    stockUpdates.push({ productId, newStock });
                });
                return stockUpdates;
            }
        });
        
        if (!result.isConfirmed || !result.value) {
            return;
        }
        
        // Tüm stok güncellemelerini yap
        let successCount = 0;
        for (const update of result.value) {
            try {
                await window.api.updateProductStock(parseInt(update.productId), update.newStock);
                successCount++;
            } catch (error) {
                console.error('Error updating stock:', error);
            }
        }
        
        loadProducts();
        loadDashboard();
        
        await Swal.fire({
            icon: 'success',
            title: 'Başarılı',
            text: `${successCount} ürünün stoğu güncellendi`,
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('Error in bulk stock entry:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: 'Stok girişi yapılırken hata oluştu',
            confirmButtonText: 'Tamam'
        });
    }
}