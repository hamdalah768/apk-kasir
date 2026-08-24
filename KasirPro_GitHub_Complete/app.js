const $ = (selector) => document.querySelector(selector);

const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);

const defaultProducts = [
    {
        id: "P001",
        name: "Kemeja Oxford",
        sku: "KM-001",
        category: "Kemeja",
        price: 149000,
        cost: 90000,
        stock: 18,
        photo: ""
    },
    {
        id: "P002",
        name: "T-Shirt Basic",
        sku: "TS-001",
        category: "T-Shirt",
        price: 89000,
        cost: 45000,
        stock: 25,
        photo: ""
    },
    {
        id: "P003",
        name: "Hoodie Premium",
        sku: "HD-001",
        category: "Hoodie",
        price: 219000,
        cost: 130000,
        stock: 8,
        photo: ""
    },
    {
        id: "P004",
        name: "Celana Chino",
        sku: "CN-001",
        category: "Celana",
        price: 179000,
        cost: 105000,
        stock: 12,
        photo: ""
    }
];

let products = JSON.parse(localStorage.getItem("kasirpro_products")) || defaultProducts;
let transactions = JSON.parse(localStorage.getItem("kasirpro_transactions")) || [];
let cart = [];
let currentPhoto = "";
let salesChart = null;

/* LOGIN */

$("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const username = $("#username").value.trim();
    const password = $("#password").value;

    if (username === "admin" && password === "admin123") {
        $("#loginPage").classList.add("hidden");
        $("#app").classList.remove("hidden");
        openPage("dashboard");
    } else {
        alert("Username atau password salah.");
    }
});

/* NAVIGATION */

document.querySelectorAll(".nav-button[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
        openPage(button.dataset.page);
    });
});

document.querySelectorAll("[data-open-page]").forEach((button) => {
    button.addEventListener("click", () => {
        openPage(button.dataset.openPage);
    });
});

$("#logoutButton").addEventListener("click", () => {
    $("#app").classList.add("hidden");
    $("#loginPage").classList.remove("hidden");
});

function openPage(pageName) {
    document.querySelectorAll(".page").forEach((page) => {
        page.classList.add("hidden");
    });

    const selectedPage = $(`#${pageName}Page`);

    if (selectedPage) {
        selectedPage.classList.remove("hidden");
    }

    document.querySelectorAll(".nav-button[data-page]").forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    const titles = {
        dashboard: "Dashboard",
        kasir: "Kasir",
        produk: "Produk & Stok",
        transaksi: "Transaksi",
        laporan: "Laporan Laba"
    };

    $("#pageTitle").textContent = titles[pageName];

    if (pageName === "dashboard") {
        renderDashboard();
    }

    if (pageName === "kasir") {
        renderProducts();
    }

    if (pageName === "produk") {
        renderProductTable();
    }

    if (pageName === "transaksi") {
        renderTransactionTable();
    }

    if (pageName === "laporan") {
        renderProfitReport();
    }
}

/* STORAGE */

function saveData() {
    localStorage.setItem(
        "kasirpro_products",
        JSON.stringify(products)
    );

    localStorage.setItem(
        "kasirpro_transactions",
        JSON.stringify(transactions)
    );
}

/* DASHBOARD */

function renderDashboard() {
    const today = new Date().toDateString();

    const todayTransactions = transactions.filter(
        (transaction) =>
            new Date(transaction.date).toDateString() === today
    );

    const todaySales = todayTransactions.reduce(
        (total, transaction) => total + transaction.total,
        0
    );

    $("#todaySales").textContent = formatRupiah(todaySales);
    $("#todayTransactions").textContent =
        `${todayTransactions.length} transaksi`;

    $("#totalProducts").textContent = products.length;

    $("#lowStock").textContent = products.filter(
        (product) => product.stock <= 5
    ).length;

    $("#totalTransactions").textContent = transactions.length;

    renderSalesChart();
}

function renderSalesChart() {
    const labels = [];
    const values = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();

        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - i);

        labels.push(
            date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short"
            })
        );

        const total = transactions
            .filter(
                (transaction) =>
                    new Date(transaction.date).toDateString() ===
                    date.toDateString()
            )
            .reduce(
                (sum, transaction) => sum + transaction.total,
                0
            );

        values.push(total);
    }

    const context = $("#salesChart");

    if (salesChart) {
        salesChart.destroy();
    }

    salesChart = new Chart(context, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Penjualan",
                    data: values,
                    borderWidth: 3,
                    tension: 0.35
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => formatRupiah(value)
                    }
                }
            }
        }
    });
}

/* PRODUCTS */

function getCategories() {
    return [...new Set(products.map((product) => product.category))]
        .sort();
}

function renderCategoryFilter() {
    const selected = $("#categoryFilter").value;

    $("#categoryFilter").innerHTML =
        `<option value="">Semua kategori</option>` +
        getCategories()
            .map(
                (category) =>
                    `<option value="${escapeHtml(category)}">
                        ${escapeHtml(category)}
                    </option>`
            )
            .join("");

    $("#categoryFilter").value = selected;
}

function renderProducts() {
    renderCategoryFilter();

    const search = $("#searchProduct").value.toLowerCase();
    const category = $("#categoryFilter").value;

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(search) ||
            product.sku.toLowerCase().includes(search);

        const matchesCategory =
            !category || product.category === category;

        return matchesSearch && matchesCategory;
    });

    if (filteredProducts.length === 0) {
        $("#productGrid").innerHTML =
            `<div class="empty">Produk tidak ditemukan.</div>`;

        return;
    }

    $("#productGrid").innerHTML = filteredProducts
        .map(
            (product) => `
                <div class="product-card">
                    ${productImage(product)}
                    <span class="sku">
                        ${escapeHtml(product.sku)} ·
                        ${escapeHtml(product.category)}
                    </span>

                    <h4>${escapeHtml(product.name)}</h4>

                    <div class="price">
                        ${formatRupiah(product.price)}
                    </div>

                    <div class="stock ${product.stock <= 5 ? "low" : ""}">
                        Stok ${product.stock}
                    </div>

                    <button
                        class="btn btn-secondary btn-full"
                        onclick="addToCart('${product.id}')"
                    >
                        Tambah
                    </button>
                </div>
            `
        )
        .join("");

    renderCart();
}

function productImage(product) {
    if (product.photo) {
        return `
            <img
                class="product-photo"
                src="${product.photo}"
                alt="${escapeHtml(product.name)}"
            >
        `;
    }

    return `
        <div class="product-photo product-placeholder">
            BAJU
        </div>
    `;
}

/* CART */

window.addToCart = function (productId) {
    const product = products.find(
        (item) => item.id === productId
    );

    if (!product || product.stock <= 0) {
        alert("Stok produk habis.");
        return;
    }

    const existing = cart.find(
        (item) => item.id === productId
    );

    if (existing) {
        if (existing.quantity >= product.stock) {
            alert("Jumlah melebihi stok.");
            return;
        }

        existing.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    renderCart();
};

window.changeQuantity = function (productId, change) {
    const cartItem = cart.find(
        (item) => item.id === productId
    );

    const product = products.find(
        (item) => item.id === productId
    );

    if (!cartItem || !product) {
        return;
    }

    cartItem.quantity += change;

    if (cartItem.quantity <= 0) {
        cart = cart.filter(
            (item) => item.id !== productId
        );
    }

    if (cartItem.quantity > product.stock) {
        cartItem.quantity = product.stock;
    }

    renderCart();
};

function calculateCart() {
    const subtotal = cart.reduce((total, item) => {
        const product = products.find(
            (productItem) => productItem.id === item.id
        );

        return total + product.price * item.quantity;
    }, 0);

    const discount = Math.max(
        0,
        Number($("#discount").value) || 0
    );

    const total = Math.max(
        0,
        subtotal - discount
    );

    const payment = Math.max(
        0,
        Number($("#payment").value) || 0
    );

    const change = Math.max(
        0,
        payment - total
    );

    return {
        subtotal,
        discount,
        total,
        payment,
        change
    };
}

function renderCart() {
    if (cart.length === 0) {
        $("#cartItems").innerHTML =
            `<div class="empty">Keranjang masih kosong.</div>`;
    } else {
        $("#cartItems").innerHTML = cart
            .map((item) => {
                const product = products.find(
                    (productItem) =>
                        productItem.id === item.id
                );

                return `
                    <div class="cart-line">
                        <div>
                            <strong>
                                ${escapeHtml(product.name)}
                            </strong>
                            <br>
                            <small>
                                ${formatRupiah(product.price)}
                                × ${item.quantity}
                            </small>
                        </div>

                        <div class="qty-controls">
                            <button
                                onclick="changeQuantity('${product.id}', -1)"
                            >
                                −
                            </button>

                            <span>${item.quantity}</span>

                            <button
                                onclick="changeQuantity('${product.id}', 1)"
                            >
                                +
                            </button>
                        </div>
                    </div>
                `;
            })
            .join("");
    }

    const totals = calculateCart();

    $("#subtotal").textContent =
        formatRupiah(totals.subtotal);

    $("#grandTotal").textContent =
        formatRupiah(totals.total);

    $("#change").textContent =
        formatRupiah(totals.change);
}

$("#clearCart").addEventListener("click", () => {
    cart = [];
    renderCart();
});

$("#discount").addEventListener(
    "input",
    renderCart
);

$("#payment").addEventListener(
    "input",
    renderCart
);

$("#searchProduct").addEventListener(
    "input",
    renderProducts
);

$("#categoryFilter").addEventListener(
    "change",
    renderProducts
);

/* PRODUCT TABLE */

function renderProductTable() {
    if (products.length === 0) {
        $("#productTable").innerHTML =
            `<tr><td colspan="7" class="empty">
                Belum ada produk.
            </td></tr>`;

        return;
    }

    $("#productTable").innerHTML = products
        .map(
            (product) => `
                <tr>
                    <td>
                        <div class="product-cell">
                            ${productImage(product)}
                            <strong>
                                ${escapeHtml(product.name)}
                            </strong>
                        </div>
                    </td>

                    <td>${escapeHtml(product.sku)}</td>
                    <td>${escapeHtml(product.category)}</td>
                    <td>${formatRupiah(product.price)}</td>
                    <td>${formatRupiah(product.cost)}</td>
                    <td>${product.stock}</td>

                    <td>
                        <div class="actions">
                            <button
                                class="btn btn-secondary"
                                onclick="editProduct('${product.id}')"
                            >
                                Edit
                            </button>

                            <button
                                class="btn btn-secondary danger"
                                onclick="deleteProduct('${product.id}')"
                            >
                                Hapus
                            </button>
                        </div>
                    </td>
                </tr>
            `
        )
        .join("");
}

window.editProduct = function (productId) {
    const product = products.find(
        (item) => item.id === productId
    );

    if (!product) {
        return;
    }

    $("#modalTitle").textContent = "Edit Produk";

    $("#editProductId").value = product.id;
    $("#productName").value = product.name;
    $("#productSku").value = product.sku;
    $("#productCategory").value = product.category;
    $("#productPrice").value = product.price;
    $("#productCost").value = product.cost;
    $("#productStock").value = product.stock;

    currentPhoto = product.photo || "";

    showPhotoPreview(currentPhoto);

    $("#productModal").classList.remove("hidden");
};

window.deleteProduct = function (productId) {
    const confirmed = confirm(
        "Yakin ingin menghapus produk ini?"
    );

    if (!confirmed) {
        return;
    }

    products = products.filter(
        (product) => product.id !== productId
    );

    saveData();
    renderProductTable();
    renderProducts();
    renderDashboard();
};

$("#addProductButton").addEventListener(
    "click",
    () => {
        $("#modalTitle").textContent =
            "Tambah Produk";

        $("#productForm").reset();
        $("#editProductId").value = "";

        currentPhoto = "";
        showPhotoPreview("");

        $("#productModal").classList.remove("hidden");
    }
);

/* PHOTO */

$("#productPhoto").addEventListener(
    "change",
    (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        if (file.size > 1500000) {
            alert(
                "Ukuran foto terlalu besar. Maksimal 1,5 MB."
            );

            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            currentPhoto = reader.result;
            showPhotoPreview(currentPhoto);
        };

        reader.readAsDataURL(file);
    }
);

function showPhotoPreview(photo) {
    if (!photo) {
        $("#photoPreview").innerHTML = "";
        $("#photoPreview").classList.add("hidden");
        return;
    }

    $("#photoPreview").innerHTML =
        `<img src="${photo}" alt="Preview foto produk">`;

    $("#photoPreview").classList.remove("hidden");
}

/* PRODUCT FORM */

$("#productForm").addEventListener(
    "submit",
    (event) => {
        event.preventDefault();

        const id = $("#editProductId").value;

        const productData = {
            name: $("#productName").value.trim(),
            sku: $("#productSku").value.trim(),
            category: $("#productCategory").value.trim(),
            price: Number($("#productPrice").value),
            cost: Number($("#productCost").value),
            stock: Number($("#productStock").value),
            photo: currentPhoto
        };

        if (
            !productData.name ||
            !productData.sku ||
            !productData.category
        ) {
            alert("Lengkapi data produk.");
            return;
        }

        if (
            productData.price < 0 ||
            productData.cost < 0 ||
            productData.stock < 0
        ) {
            alert("Harga dan stok tidak boleh negatif.");
            return;
        }

        if (id) {
            const product = products.find(
                (item) => item.id === id
            );

            if (product) {
                Object.assign(product, productData);
            }
        } else {
            products.push({
                id: `P${Date.now()}`,
                ...productData
            });
        }

        saveData();
        closeModal();

        renderProductTable();
        renderProducts();
        renderDashboard();
    }
);

/* MODAL */

function closeModal() {
    $("#productModal").classList.add("hidden");
    currentPhoto = "";
}

$("#closeModal").addEventListener(
    "click",
    closeModal
);

$("#cancelModal").addEventListener(
    "click",
    closeModal
);

/* CHECKOUT */

$("#checkoutButton").addEventListener(
    "click",
    () => {
        if (cart.length === 0) {
            alert("Keranjang masih kosong.");
            return;
        }

        const totals = calculateCart();

        if (totals.payment < totals.total) {
            alert("Uang cash masih kurang.");
            return;
        }

        const snapshot = cart.map((item) => {
            const product = products.find(
                (productItem) =>
                    productItem.id === item.id
            );

            return {
                id: product.id,
                name: product.name,
                price: product.price,
                cost: product.cost,
                quantity: item.quantity
            };
        });

        cart.forEach((item) => {
            const product = products.find(
                (productItem) =>
                    productItem.id === item.id
            );

            product.stock -= item.quantity;
        });

        const transaction = {
            id: `TRX-${Date.now()}`,
            date: new Date().toISOString(),
            method: "Cash",
            items: snapshot,
            subtotal: totals.subtotal,
            discount: totals.discount,
            total: totals.total,
            payment: totals.payment,
            change: totals.change
        };

        transactions.push(transaction);

        saveData();
        printReceipt(transaction);

        cart = [];

        $("#discount").value = 0;
        $("#payment").value = 0;

        renderCart();
        renderDashboard();
    }
);

/* RECEIPT */

function printReceipt(transaction) {
    const rows = transaction.items
        .map(
            (item) => `
                <tr>
                    <td>
                        ${escapeHtml(item.name)}
                        × ${item.quantity}
                    </td>
                    <td>
                        ${formatRupiah(
                            item.price * item.quantity
                        )}
                    </td>
                </tr>
            `
        )
        .join("");

    const receiptWindow = window.open(
        "",
        "_blank",
        "width=420,height=650"
    );

    if (!receiptWindow) {
        alert(
            "Popup diblokir browser. Izinkan popup untuk mencetak struk."
        );
        return;
    }

    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${transaction.id}</title>
            <style>
                body {
                    width: 300px;
                    margin: 20px auto;
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                }

                h2 {
                    text-align: center;
                    margin-bottom: 5px;
                }

                p {
                    text-align: center;
                    margin: 4px;
                }

                .line {
                    border-top: 1px dashed #000;
                    margin: 10px 0;
                }

                table {
                    width: 100%;
                }

                td {
                    padding: 4px 0;
                }

                .total {
                    font-weight: bold;
                    font-size: 14px;
                }
            </style>
        </head>

        <body>
            <h2>FASHION STORE</h2>
            <p>Struk Penjualan</p>
            <p>${new Date(transaction.date).toLocaleString("id-ID")}</p>
            <p>${transaction.id}</p>
            <p>Metode: CASH</p>

            <div class="line"></div>

            <table>
                ${rows}
            </table>

            <div class="line"></div>

            <table>
                <tr>
                    <td>Subtotal</td>
                    <td>${formatRupiah(transaction.subtotal)}</td>
                </tr>
                <tr>
                    <td>Diskon</td>
                    <td>${formatRupiah(transaction.discount)}</td>
                </tr>
                <tr class="total">
                    <td>Total</td>
                    <td>${formatRupiah(transaction.total)}</td>
                </tr>
                <tr>
                    <td>Bayar</td>
                    <td>${formatRupiah(transaction.payment)}</td>
                </tr>
                <tr>
                    <td>Kembali</td>
                    <td>${formatRupiah(transaction.change)}</td>
                </tr>
            </table>

            <p style="margin-top:20px;">
                Terima kasih telah berbelanja.
            </p>

            <script>
                window.onload = function () {
                    window.print();
                };
            <\/script>
        </body>
        </html>
    `);

    receiptWindow.document.close();
}

/* TRANSACTIONS */

function renderTransactionTable() {
    if (transactions.length === 0) {
        $("#transactionTable").innerHTML =
            `<tr>
                <td colspan="7" class="empty">
                    Belum ada transaksi.
                </td>
            </tr>`;

        return;
    }

    $("#transactionTable").innerHTML =
        [...transactions]
            .reverse()
            .map(
                (transaction) => `
                    <tr>
                        <td>
                            ${new Date(
                                transaction.date
                            ).toLocaleString("id-ID")}
                        </td>
                        <td>${transaction.id}</td>
                        <td>${transaction.method}</td>
                        <td>
                            ${transaction.items.reduce(
                                (total, item) =>
                                    total + item.quantity,
                                0
                            )}
                        </td>
                        <td>${formatRupiah(transaction.total)}</td>
                        <td>${formatRupiah(transaction.payment)}</td>
                        <td>${formatRupiah(transaction.change)}</td>
                    </tr>
                `
            )
            .join("");
}

/* PROFIT REPORT */

function renderProfitReport() {
    let revenue = 0;
    let cost = 0;
    const productReport = {};

    transactions.forEach((transaction) => {
        revenue += transaction.total;

        transaction.items.forEach((item) => {
            const itemRevenue =
                item.price * item.quantity;

            const itemCost =
                item.cost * item.quantity;

            cost += itemCost;

            if (!productReport[item.id]) {
                productReport[item.id] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0,
                    cost: 0
                };
            }

            productReport[item.id].quantity +=
                item.quantity;

            productReport[item.id].revenue +=
                itemRevenue;

            productReport[item.id].cost +=
                itemCost;
        });
    });

    const profit = revenue - cost;

    $("#reportRevenue").textContent =
        formatRupiah(revenue);

    $("#reportCost").textContent =
        formatRupiah(cost);

    $("#reportProfit").textContent =
        formatRupiah(profit);

    $("#reportMargin").textContent =
        revenue > 0
            ? `${((profit / revenue) * 100).toFixed(1)}%`
            : "0%";

    const rows = Object.values(productReport);

    if (rows.length === 0) {
        $("#profitTable").innerHTML =
            `<tr>
                <td colspan="5" class="empty">
                    Belum ada data laba.
                </td>
            </tr>`;

        return;
    }

    $("#profitTable").innerHTML = rows
        .map(
            (item) => `
                <tr>
                    <td>${escapeHtml(item.name)}</td>
                    <td>${item.quantity}</td>
                    <td>${formatRupiah(item.revenue)}</td>
                    <td>${formatRupiah(item.cost)}</td>
                    <td>
                        ${formatRupiah(
                            item.revenue - item.cost
                        )}
                    </td>
                </tr>
            `
        )
        .join("");
}

/* SECURITY */

function escapeHtml(value) {
    return String(value).replace(
        /[&<>"']/g,
        (character) => {
            const replacements = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return replacements[character];
        }
    );
}

/* START */

renderCart();
