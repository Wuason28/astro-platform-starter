document.addEventListener('DOMContentLoaded', () => {

    // --- Funciones de Utilidad para localStorage (simulando Base de Datos) ---

    // Obtener datos del localStorage
    const getStoredData = (key, defaultValue) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    };

    // Guardar datos en localStorage
    const setStoredData = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    // --- Datos iniciales (si no existen en localStorage) ---
    let products = getStoredData('products', [
        { id: 1, name: "Zapatos Deportivos", price: 75.99, imageUrl: "https://via.placeholder.com/200x150?text=Zapatos+Deportivos" },
        { id: 2, name: "Camisa Casual", price: 30.00, imageUrl: "https://via.placeholder.com/200x150?text=Camisa+Casual" },
        { id: 3, name: "Pantalón Vaquero", price: 45.50, imageUrl: "https://via.placeholder.com/200x150?text=Pantalón+Vaquero" },
    ]);

    let locationData = getStoredData('location', {
        address: "Av. Francisco de Miranda, Edif. XYZ, Local 10, Caracas, Capital District, Venezuela",
        googleMapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3923.111818166542!2d-66.8679093883713!3d10.49089536551829!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a59a936a287c7%3A0x6b40e942e6f42b32!2sAv.%20Francisco%20de%20Miranda%2C%20Caracas%2C%20Distrito%20Capital!5e0!3m2!1sen!2sve!4v1719460598656!5m2!1sen!2sve"
    });

    // --- Funciones para la Sección de Productos (index.html) ---
    const loadProducts = () => {
        const productListDiv = document.getElementById('product-list');
        if (productListDiv) {
            productListDiv.innerHTML = ''; // Limpiar el contenido existente
            if (products.length === 0) {
                productListDiv.innerHTML = '<p>No hay productos disponibles en este momento.</p>';
            } else {
                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');
                    productCard.innerHTML = `
                        <img src="${product.imageUrl || 'https://via.placeholder.com/200x150?text=No+Imagen'}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p class="price">$${product.price.toFixed(2)}</p>
                    `;
                    productListDiv.appendChild(productCard);
                });
            }
        }
    };

    // --- Funciones para la Sección de Ubicación (index.html) ---
    const loadLocation = () => {
        const storeAddressSpan = document.getElementById('store-address');
        const googleMapIframe = document.getElementById('google-map');

        if (storeAddressSpan && googleMapIframe) {
            storeAddressSpan.textContent = locationData.address;
            googleMapIframe.src = locationData.googleMapEmbed;
        }
    };

    // Cargar datos al cargar la página principal
    if (document.body.id !== 'admin-page') { // Solo cargar en index.html
        loadProducts();
        loadLocation();
    }


    // --- Lógica Específica del Panel de Administración (admin.html) ---
    const adminLoginSection = document.getElementById('admin-login');
    const adminDashboardSection = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('login-form');
    const adminPasswordInput = document.getElementById('admin-password');
    const loginMessage = document.getElementById('login-message');

    // !!! ADVERTENCIA DE SEGURIDAD !!!
    // Esta contraseña es visible en el código fuente. NO USAR EN PRODUCCIÓN.
    // En una aplicación real, la autenticación se manejaría en el servidor.
    const ADMIN_PASSWORD = "admin123";

    if (loginForm && adminDashboardSection) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredPassword = adminPasswordInput.value;

            if (enteredPassword === ADMIN_PASSWORD) {
                adminLoginSection.classList.add('hidden');
                adminDashboardSection.classList.remove('hidden');
                loginMessage.textContent = '';
                loadAdminProducts(); // Cargar productos para gestión
                loadAdminLocation(); // Cargar ubicación para gestión
            } else {
                loginMessage.textContent = "Contraseña incorrecta. Intenta de nuevo.";
                loginMessage.classList.remove('success-message');
                loginMessage.classList.add('error-message');
            }
        });
    }

    // --- Gestión de Productos en el Admin Panel ---
    const productForm = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');
    const currentProductImagePreview = document.getElementById('current-product-image-preview');
    const productSubmitBtn = document.getElementById('product-submit-btn');
    const productCancelBtn = document.getElementById('product-cancel-btn');
    const existingProductsDiv = document.getElementById('existing-products');
    const productMessage = document.getElementById('product-message');

    let editingProductId = null; // Para saber si estamos editando o agregando

    const loadAdminProducts = () => {
        if (existingProductsDiv) {
            existingProductsDiv.innerHTML = ''; // Limpiar lista
            if (products.length === 0) {
                existingProductsDiv.innerHTML = '<p>No hay productos para gestionar.</p>';
            } else {
                products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.classList.add('admin-product-item');
                    productItem.innerHTML = `
                        <span>${product.name} ($${product.price.toFixed(2)})</span>
                        <div>
                            <button class="edit-btn" data-id="${product.id}">Editar</button>
                            <button class="delete-btn" data-id="${product.id}">Borrar</button>
                        </div>
                    `;
                    existingProductsDiv.appendChild(productItem);
                });
            }
        }
    };

    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = productNameInput.value.trim();
            const price = parseFloat(productPriceInput.value);
            const imageFile = productImageInput.files[0];
            let imageUrl = currentProductImagePreview.src; // Usar la URL existente si no se sube nueva

            if (!name || isNaN(price) || price <= 0) {
                productMessage.textContent = "Por favor, completa todos los campos del producto con valores válidos.";
                productMessage.classList.remove('success-message', 'info-message');
                productMessage.classList.add('error-message');
                return;
            }

            // Simulación de carga de imagen: Convertir a Data URL (NO USAR EN PRODUCCIÓN)
            // En un sistema real, la imagen se enviaría al servidor y se guardaría su URL.
            const handleImageUpload = (callback) => {
                if (imageFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imageUrl = e.target.result; // Data URL de la imagen
                        callback(imageUrl);
                    };
                    reader.readAsDataURL(imageFile);
                } else {
                    callback(imageUrl); // No hay nueva imagen, usar la existente
                }
            };

            handleImageUpload((finalImageUrl) => {
                if (editingProductId) {
                    // Editar producto existente
                    const index = products.findIndex(p => p.id === editingProductId);
                    if (index !== -1) {
                        products[index] = { ...products[index], name, price, imageUrl: finalImageUrl };
                        productMessage.textContent = "Producto actualizado con éxito.";
                        productMessage.classList.remove('error-message', 'info-message');
                        productMessage.classList.add('success-message');
                    }
                    editingProductId = null; // Resetear modo edición
                    productSubmitBtn.textContent = 'Agregar Producto';
                    productCancelBtn.classList.add('hidden');
                } else {
                    // Agregar nuevo producto
                    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
                    products.push({ id: newId, name, price, imageUrl: finalImageUrl });
                    productMessage.textContent = "Producto agregado con éxito.";
                    productMessage.classList.remove('error-message', 'info-message');
                    productMessage.classList.add('success-message');
                }

                setStoredData('products', products); // Guardar cambios en localStorage
                loadAdminProducts(); // Refrescar la lista en el admin
                if (document.body.id !== 'admin-page') { loadProducts(); } // Refrescar en index.html si está abierto
                productForm.reset();
                currentProductImagePreview.classList.add('hidden');
                currentProductImagePreview.src = '';
            });
        });

        // Previsualizar imagen al seleccionar
        productImageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    currentProductImagePreview.src = e.target.result;
                    currentProductImagePreview.classList.remove('hidden');
                };
                reader.readAsDataURL(e.target.files[0]);
            } else {
                currentProductImagePreview.classList.add('hidden');
                currentProductImagePreview.src = '';
            }
        });


        // Manejar botones de Editar/Borrar en la lista de productos
        existingProductsDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const idToDelete = parseInt(e.target.dataset.id);
                products = products.filter(p => p.id !== idToDelete);
                setStoredData('products', products);
                loadAdminProducts();
                if (document.body.id !== 'admin-page') { loadProducts(); }
                productMessage.textContent = "Producto borrado con éxito.";
                productMessage.classList.remove('error-message', 'success-message');
                productMessage.classList.add('info-message');
            } else if (e.target.classList.contains('edit-btn')) {
                const idToEdit = parseInt(e.target.dataset.id);
                const productToEdit = products.find(p => p.id === idToEdit);

                if (productToEdit) {
                    editingProductId = idToEdit;
                    productIdInput.value = productToEdit.id;
                    productNameInput.value = productToEdit.name;
                    productPriceInput.value = productToEdit.price;
                    currentProductImagePreview.src = productToEdit.imageUrl;
                    currentProductImagePreview.classList.remove('hidden');
                    productImageInput.value = ''; // Limpiar el input de archivo
                    productSubmitBtn.textContent = 'Actualizar Producto';
                    productCancelBtn.classList.remove('hidden');
                    productMessage.textContent = "Editando producto...";
                    productMessage.classList.remove('error-message', 'success-message');
                    productMessage.classList.add('info-message');
                }
            }
        });

        // Botón de cancelar edición
        productCancelBtn.addEventListener('click', () => {
            editingProductId = null;
            productForm.reset();
            currentProductImagePreview.classList.add('hidden');
            currentProductImagePreview.src = '';
            productSubmitBtn.textContent = 'Agregar Producto';
            productCancelBtn.classList.add('hidden');
            productMessage.textContent = '';
        });
    }

    // --- Gestión de Ubicación en el Admin Panel ---
    const locationForm = document.getElementById('location-form');
    const avenidaInput = document.getElementById('avenida');
    const googleMapLinkInput = document.getElementById('google-map-link');
    const locationMessage = document.getElementById('location-message');

    const loadAdminLocation = () => {
        if (avenidaInput && googleMapLinkInput) {
            avenidaInput.value = locationData.address;
            googleMapLinkInput.value = locationData.googleMapEmbed;
        }
    };

    if (locationForm) {
        locationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newAvenida = avenidaInput.value.trim();
            const newGoogleMapLink = googleMapLinkInput.value.trim();

            if (!newAvenida || !newGoogleMapLink) {
                locationMessage.textContent = "Por favor, completa ambos campos de la ubicación.";
                locationMessage.classList.remove('success-message', 'info-message');
                locationMessage.classList.add('error-message');
                return;
            }

            locationData.address = newAvenida;
            locationData.googleMapEmbed = newGoogleMapLink;
            setStoredData('location', locationData); // Guardar cambios en localStorage

            locationMessage.textContent = "Ubicación guardada con éxito.";
            locationMessage.classList.remove('error-message', 'info-message');
            locationMessage.classList.add('success-message');

            // Si estuvieras en un entorno real con un servidor, aquí harías una petición POST/PUT
            // para actualizar la base de datos.
            // fetch('/api/update-location', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(locationData)
            // }).then(response => response.json())
            //   .then(data => console.log('Location updated on server:', data));

            // Si el usuario está en la página principal, actualiza la vista
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                loadLocation();
            }
        });
    }

    // Cargar los datos del administrador si ya está logueado (solo si el navegador lo recuerda)
    // Esto es muy básico y no seguro, solo para la demo con localStorage.
    if (adminDashboardSection && localStorage.getItem('adminLoggedIn') === 'true') {
        adminLoginSection.classList.add('hidden');
        adminDashboardSection.classList.remove('hidden');
        loadAdminProducts();
        loadAdminLocation();
    }
});