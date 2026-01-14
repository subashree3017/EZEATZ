// =====================================================
// DASHBOARD MODULE
// EZEATZ Admin - College Canteen Management
// =====================================================

(function () {
    'use strict';

    // State
    let currentUser = null;
    let currentCanteen = 'main_canteen';
    let menuItems = [];
    let dailySpecials = {};

    // DOM Elements
    const loadingOverlay = document.getElementById('loadingOverlay');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const canteenSelector = document.getElementById('canteenSelector');
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');

    // User elements
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const logoutBtn = document.getElementById('logoutBtn');

    // Date/Time elements
    const currentDate = document.getElementById('currentDate');
    const currentTime = document.getElementById('currentTime');
    const calendarBtn = document.getElementById('calendarBtn');
    const calendarPopup = document.getElementById('calendarPopup');
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarMonth = document.getElementById('calendarMonth');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');

    // Stats elements
    const totalItemsEl = document.getElementById('totalItems');
    const enabledItemsEl = document.getElementById('enabledItems');
    const lowStockItemsEl = document.getElementById('lowStockItems');
    const todaySpecialsEl = document.getElementById('todaySpecials');
    const lowStockBadge = document.getElementById('lowStockBadge');

    // Calendar state
    let calendarDate = new Date();

    // =====================================================
    // INITIALIZATION
    // =====================================================

    async function init() {
        showLoading(true);

        // Check authentication
        EZEATZ.auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                await loadUserData();
                await loadMenuItems();
                loadDailySpecials();
                updateStats();
                startDateTime();
                setupEventListeners();
                highlightTodayInDaysGrid();
                showLoading(false);
            } else {
                // Redirect to login
                window.location.href = 'index.html';
            }
        });
    }

    // =====================================================
    // DATA LOADING
    // =====================================================

    async function loadUserData() {
        try {
            // Try to get user data from Firestore
            const userDoc = await EZEATZ.db.collection(EZEATZ.COLLECTIONS.USERS)
                .doc(currentUser.uid).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                updateUserUI(userData);
            } else {
                // Use Firebase Auth data
                updateUserUI({
                    displayName: currentUser.displayName || 'Admin User',
                    email: currentUser.email || 'admin@ezeatz.com'
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            updateUserUI({
                displayName: currentUser.displayName || 'Admin User',
                email: currentUser.email || 'admin@ezeatz.com'
            });
        }
    }

    function updateUserUI(userData) {
        if (userName) {
            userName.textContent = userData.displayName || 'Admin User';
        }
        if (userEmail) {
            userEmail.textContent = userData.email || 'admin@ezeatz.com';
        }
        if (userAvatar) {
            const initial = (userData.displayName || 'A')[0].toUpperCase();
            userAvatar.textContent = initial;
        }
    }

    async function loadMenuItems() {
        try {
            // For demo, use sample data
            // In production, load from Firestore
            menuItems = [...EZEATZ.SAMPLE_MENU_ITEMS].filter(
                item => item.canteenId === currentCanteen
            );

            renderFoodGrid();
            renderStockGrid();
        } catch (error) {
            console.error('Error loading menu items:', error);
            EZEATZ.showToast('Failed to load menu items', 'error');
        }
    }

    function loadDailySpecials() {
        // Load from sample data
        dailySpecials = { ...EZEATZ.SAMPLE_DAILY_SPECIALS };

        // Apply today's specials
        applyTodaySpecials();
    }

    function applyTodaySpecials() {
        const today = EZEATZ.getCurrentDay();
        const todaySpecialIds = dailySpecials[today] || [];

        menuItems.forEach(item => {
            item.isSpecial = todaySpecialIds.includes(item.id);
        });
    }

    // =====================================================
    // UI RENDERING
    // =====================================================

    function renderFoodGrid() {
        const foodGrid = document.getElementById('foodGrid');
        if (!foodGrid) return;

        // Clear existing items (keep the add card)
        const addCard = document.getElementById('addFoodCard');
        foodGrid.innerHTML = '';

        // Render food items
        menuItems.forEach(item => {
            const card = createFoodCard(item);
            foodGrid.appendChild(card);
        });

        // Add the "Add new" card at the end
        if (addCard) {
            foodGrid.appendChild(addCard);
        } else {
            const newAddCard = document.createElement('div');
            newAddCard.className = 'add-food-card';
            newAddCard.id = 'addFoodCard';
            newAddCard.innerHTML = `
                <div class="add-icon">+</div>
                <p>Add New Food Item</p>
            `;
            newAddCard.addEventListener('click', () => openFoodModal());
            foodGrid.appendChild(newAddCard);
        }

        // Re-attach event listener to add card
        const newAddCard = document.getElementById('addFoodCard');
        if (newAddCard) {
            newAddCard.onclick = () => openFoodModal();
        }
    }

    function createFoodCard(item) {
        const card = document.createElement('div');
        card.className = `food-card ${!item.isEnabled ? 'disabled' : ''}`;
        card.dataset.id = item.id;

        const stockClass = getStockClass(item);
        const stockText = getStockText(item);

        card.innerHTML = `
            <div class="food-image-container">
                <img src="${item.imageUrl}" alt="${item.name}" class="food-image" 
                     onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'">
                <div class="food-badges">
                    ${item.isSpecial ? '<span class="badge badge-special">⭐ Special</span>' : ''}
                    ${item.stockType === 'limited'
                ? (item.stockCount > 0
                    ? '<span class="badge badge-limited">Limited</span>'
                    : '<span class="badge badge-out-of-stock">Out of Stock</span>')
                : '<span class="badge badge-unlimited">Unlimited</span>'}
                </div>
                <div class="food-actions-overlay">
                    <button class="food-action-btn edit" data-action="edit" data-id="${item.id}" title="Edit">✏️</button>
                    <button class="food-action-btn delete" data-action="delete" data-id="${item.id}" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="food-details">
                <h3 class="food-name">${item.name}</h3>
                <p class="food-description">${item.description || 'No description'}</p>
                <div class="food-meta">
                    <span class="food-price">${EZEATZ.formatPrice(item.price)}</span>
                    <div class="food-stock">
                        <span class="stock-indicator ${stockClass}"></span>
                        <span>${stockText}</span>
                    </div>
                </div>
                <div class="food-controls">
                    ${item.stockType === 'limited' ? `
                        <div class="stock-input-group">
                            <button class="stock-btn" data-action="decrease" data-id="${item.id}">−</button>
                            <input type="number" class="stock-input" value="${item.stockCount}" 
                                   data-id="${item.id}" min="0">
                            <button class="stock-btn" data-action="increase" data-id="${item.id}">+</button>
                        </div>
                    ` : '<span style="font-size: 0.875rem; color: var(--gray-500);">♾️ Unlimited stock</span>'}
                    <label class="toggle-switch">
                        <input type="checkbox" ${item.isEnabled ? 'checked' : ''} 
                               data-action="toggle" data-id="${item.id}">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        `;

        // Add event listeners
        attachCardEventListeners(card, item);

        return card;
    }

    function attachCardEventListeners(card, item) {
        // Edit button
        const editBtn = card.querySelector('[data-action="edit"]');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openFoodModal(item);
            });
        }

        // Delete button
        const deleteBtn = card.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openDeleteModal(item);
            });
        }

        // Stock buttons
        const decreaseBtn = card.querySelector('[data-action="decrease"]');
        const increaseBtn = card.querySelector('[data-action="increase"]');
        const stockInput = card.querySelector('.stock-input');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                updateItemStock(item.id, Math.max(0, item.stockCount - 1));
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                updateItemStock(item.id, item.stockCount + 1);
            });
        }

        if (stockInput) {
            stockInput.addEventListener('change', (e) => {
                const newValue = parseInt(e.target.value) || 0;
                updateItemStock(item.id, Math.max(0, newValue));
            });
        }

        // Toggle switch
        const toggleInput = card.querySelector('[data-action="toggle"]');
        if (toggleInput) {
            toggleInput.addEventListener('change', (e) => {
                toggleItemEnabled(item.id, e.target.checked);
            });
        }
    }

    function getStockClass(item) {
        if (item.stockType === 'unlimited') return 'unlimited';
        if (item.stockCount === 0) return 'low';
        if (item.stockCount < 10) return 'low';
        if (item.stockCount < 25) return 'medium';
        return 'high';
    }

    function getStockText(item) {
        if (item.stockType === 'unlimited') return 'Unlimited';
        if (item.stockCount === 0) return 'Out of stock';
        return `${item.stockCount} left`;
    }

    function renderStockGrid() {
        const stockGrid = document.getElementById('stockGrid');
        if (!stockGrid) return;

        stockGrid.innerHTML = '';

        const limitedItems = menuItems.filter(item => item.stockType === 'limited');

        if (limitedItems.length === 0) {
            stockGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gray-500);">
                    <div style="font-size: 3rem; margin-bottom: 16px;">📦</div>
                    <p>No limited stock items found.</p>
                    <p style="font-size: 0.875rem;">Add items with limited stock to manage inventory.</p>
                </div>
            `;
            return;
        }

        limitedItems.forEach(item => {
            const card = createFoodCard(item);
            stockGrid.appendChild(card);
        });
    }

    // =====================================================
    // STATS UPDATE
    // =====================================================

    function updateStats() {
        const total = menuItems.length;
        const enabled = menuItems.filter(item => item.isEnabled).length;
        const lowStock = menuItems.filter(item =>
            item.stockType === 'limited' && item.stockCount < 10
        ).length;
        const specials = menuItems.filter(item => item.isSpecial).length;

        if (totalItemsEl) totalItemsEl.textContent = total;
        if (enabledItemsEl) enabledItemsEl.textContent = enabled;
        if (lowStockItemsEl) lowStockItemsEl.textContent = lowStock;
        if (todaySpecialsEl) todaySpecialsEl.textContent = specials;
        if (lowStockBadge) {
            lowStockBadge.textContent = lowStock;
            lowStockBadge.style.display = lowStock > 0 ? 'block' : 'none';
        }
    }

    // =====================================================
    // DATE & TIME
    // =====================================================

    function startDateTime() {
        updateDateTime();
        setInterval(updateDateTime, 1000);
    }

    function updateDateTime() {
        const now = new Date();
        if (currentDate) {
            currentDate.textContent = EZEATZ.formatDate(now);
        }
        if (currentTime) {
            currentTime.textContent = EZEATZ.formatTime(now);
        }
    }

    // =====================================================
    // CALENDAR
    // =====================================================

    function renderCalendar() {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        if (calendarMonth) {
            calendarMonth.textContent = `${monthNames[month]} ${year}`;
        }

        if (!calendarGrid) return;

        calendarGrid.innerHTML = '';

        // Day headers
        const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        dayNames.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day other-month';
            dayEl.textContent = daysInPrevMonth - i;
            calendarGrid.appendChild(dayEl);
        }

        // Current month days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;

            if (day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()) {
                dayEl.classList.add('today');
            }

            calendarGrid.appendChild(dayEl);
        }

        // Next month days
        const totalCells = 42; // 6 rows × 7 days
        const remainingCells = totalCells - (firstDay + daysInMonth);
        for (let i = 1; i <= remainingCells; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day other-month';
            dayEl.textContent = i;
            calendarGrid.appendChild(dayEl);
        }
    }

    function toggleCalendar() {
        if (calendarPopup) {
            calendarPopup.classList.toggle('active');
            if (calendarPopup.classList.contains('active')) {
                renderCalendar();
            }
        }
    }

    // =====================================================
    // NAVIGATION
    // =====================================================

    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;

                // Update active nav
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Show corresponding section
                showSection(section);

                // Update title
                const titles = {
                    'menu': 'Menu Items',
                    'specials': 'Daily Specials',
                    'stock': 'Stock Management',
                    'settings': 'Settings'
                };
                if (pageTitle) {
                    pageTitle.textContent = titles[section] || 'Dashboard';
                }

                // Close sidebar on mobile
                if (window.innerWidth < 1024) {
                    sidebar.classList.remove('active');
                }
            });
        });
    }

    function showSection(sectionName) {
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });

        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
    }

    // =====================================================
    // ITEM OPERATIONS
    // =====================================================

    function updateItemStock(itemId, newCount) {
        const item = menuItems.find(i => i.id === itemId);
        if (item) {
            item.stockCount = newCount;

            // Auto-disable if stock is 0
            if (newCount === 0 && item.isEnabled) {
                item.isEnabled = false;
                EZEATZ.showToast(`${item.name} disabled - Out of stock`, 'warning');
            }

            renderFoodGrid();
            renderStockGrid();
            updateStats();
        }
    }

    function toggleItemEnabled(itemId, enabled) {
        const item = menuItems.find(i => i.id === itemId);
        if (item) {
            // Don't allow enabling if stock is 0
            if (enabled && item.stockType === 'limited' && item.stockCount === 0) {
                EZEATZ.showToast('Cannot enable item with 0 stock', 'error');
                renderFoodGrid(); // Re-render to reset toggle
                return;
            }

            item.isEnabled = enabled;
            EZEATZ.showToast(`${item.name} ${enabled ? 'enabled' : 'disabled'}`, 'success');
            renderFoodGrid();
            renderStockGrid();
            updateStats();
        }
    }

    // =====================================================
    // MODALS
    // =====================================================

    window.openFoodModal = function (item = null) {
        const modal = document.getElementById('foodModal');
        const title = document.getElementById('foodModalTitle');
        const form = document.getElementById('foodForm');

        // Reset form
        form.reset();
        document.getElementById('imageUploadArea').innerHTML = `
            <div class="upload-placeholder">
                <div class="icon">📷</div>
                <p>Click to upload image</p>
                <small>or paste image URL below</small>
            </div>
        `;
        document.getElementById('imageUploadArea').classList.remove('has-image');
        document.getElementById('stockCountGroup').style.display = 'none';

        // Reset stock type buttons
        document.querySelectorAll('.stock-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'unlimited');
        });

        if (item) {
            // Edit mode
            title.textContent = 'Edit Item';
            document.getElementById('foodNameInput').value = item.name;
            document.getElementById('foodDescInput').value = item.description || '';
            document.getElementById('foodPriceInput').value = item.price;
            document.getElementById('imageUrlInput').value = item.imageUrl || '';
            document.getElementById('foodCategoryInput').value = item.category || 'main_course';
            document.getElementById('foodEnabledInput').checked = item.isEnabled;

            // Stock type
            if (item.stockType === 'limited') {
                document.querySelectorAll('.stock-type-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.type === 'limited');
                });
                document.getElementById('stockCountGroup').style.display = 'block';
                document.getElementById('stockCountInput').value = item.stockCount;
            }

            // Show image preview
            if (item.imageUrl) {
                document.getElementById('imageUploadArea').innerHTML = `
                    <img src="${item.imageUrl}" alt="Preview">
                `;
                document.getElementById('imageUploadArea').classList.add('has-image');
            }

            form.dataset.editId = item.id;
        } else {
            // Add mode
            title.textContent = 'Add New Item';
            delete form.dataset.editId;
        }

        modal.classList.add('active');
    };

    window.openDeleteModal = function (item) {
        const modal = document.getElementById('deleteModal');
        const itemName = document.getElementById('deleteItemName');

        itemName.textContent = item.name;
        modal.dataset.deleteId = item.id;
        modal.classList.add('active');
    };

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    function handleFoodSave() {
        const form = document.getElementById('foodForm');
        const name = document.getElementById('foodNameInput').value.trim();
        const description = document.getElementById('foodDescInput').value.trim();
        const price = parseInt(document.getElementById('foodPriceInput').value);
        const imageUrl = document.getElementById('imageUrlInput').value.trim();
        const category = document.getElementById('foodCategoryInput').value;
        const isEnabled = document.getElementById('foodEnabledInput').checked;

        const stockType = document.querySelector('.stock-type-btn.active').dataset.type;
        const stockCount = stockType === 'limited'
            ? parseInt(document.getElementById('stockCountInput').value) || 0
            : 0;

        if (!name || !price) {
            EZEATZ.showToast('Please fill in required fields', 'error');
            return;
        }

        const itemData = {
            name,
            description,
            price,
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
            category,
            stockType,
            stockCount,
            isEnabled,
            canteenId: currentCanteen
        };

        if (form.dataset.editId) {
            // Update existing item
            const index = menuItems.findIndex(i => i.id === form.dataset.editId);
            if (index !== -1) {
                menuItems[index] = { ...menuItems[index], ...itemData };
                EZEATZ.showToast('Item updated successfully!', 'success');
            }
        } else {
            // Add new item
            itemData.id = 'item_' + Date.now();
            itemData.isSpecial = false;
            menuItems.push(itemData);
            EZEATZ.showToast('Item added successfully!', 'success');
        }

        closeModal('foodModal');
        renderFoodGrid();
        renderStockGrid();
        updateStats();
    }

    function handleDelete() {
        const modal = document.getElementById('deleteModal');
        const deleteId = modal.dataset.deleteId;

        const index = menuItems.findIndex(i => i.id === deleteId);
        if (index !== -1) {
            const itemName = menuItems[index].name;
            menuItems.splice(index, 1);
            EZEATZ.showToast(`${itemName} deleted`, 'success');
        }

        closeModal('deleteModal');
        renderFoodGrid();
        renderStockGrid();
        updateStats();
    }

    // =====================================================
    // DAYS GRID (Daily Specials)
    // =====================================================

    function highlightTodayInDaysGrid() {
        const today = EZEATZ.getCurrentDay();
        const dayCards = document.querySelectorAll('.day-card');

        dayCards.forEach(card => {
            card.classList.remove('today', 'selected');
            if (card.dataset.day === today) {
                card.classList.add('today');
            }

            // Update count
            const daySpecials = dailySpecials[card.dataset.day] || [];
            const countEl = card.querySelector('.day-specials-count');
            if (countEl) {
                countEl.textContent = `${daySpecials.length} item${daySpecials.length !== 1 ? 's' : ''}`;
            }
        });
    }

    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    function setupEventListeners() {
        // Navigation
        setupNavigation();

        // Mobile menu toggle
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }

        // Canteen selector
        if (canteenSelector) {
            canteenSelector.addEventListener('change', (e) => {
                currentCanteen = e.target.value;
                loadMenuItems();
                EZEATZ.showToast(`Switched to ${e.target.options[e.target.selectedIndex].text}`, 'info');
            });
        }

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await EZEATZ.auth.signOut();
                    EZEATZ.showToast('Signed out successfully', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } catch (error) {
                    console.error('Logout error:', error);
                    EZEATZ.showToast('Failed to sign out', 'error');
                }
            });
        }

        // Calendar
        if (calendarBtn) {
            calendarBtn.addEventListener('click', toggleCalendar);
        }

        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                calendarDate.setMonth(calendarDate.getMonth() - 1);
                renderCalendar();
            });
        }

        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                calendarDate.setMonth(calendarDate.getMonth() + 1);
                renderCalendar();
            });
        }

        // Close calendar when clicking outside
        document.addEventListener('click', (e) => {
            if (calendarPopup && !calendarPopup.contains(e.target) &&
                !calendarBtn.contains(e.target)) {
                calendarPopup.classList.remove('active');
            }
        });

        // Add food buttons
        const addFoodBtn = document.getElementById('addFoodBtn');
        const addFoodCard = document.getElementById('addFoodCard');

        if (addFoodBtn) {
            addFoodBtn.addEventListener('click', () => openFoodModal());
        }
        if (addFoodCard) {
            addFoodCard.addEventListener('click', () => openFoodModal());
        }

        // Modal close buttons
        document.getElementById('closeFoodModal')?.addEventListener('click', () => closeModal('foodModal'));
        document.getElementById('cancelFoodBtn')?.addEventListener('click', () => closeModal('foodModal'));
        document.getElementById('saveFoodBtn')?.addEventListener('click', handleFoodSave);

        document.getElementById('closeDeleteModal')?.addEventListener('click', () => closeModal('deleteModal'));
        document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', handleDelete);

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        });

        // Stock type toggle
        document.querySelectorAll('.stock-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.stock-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const stockCountGroup = document.getElementById('stockCountGroup');
                if (stockCountGroup) {
                    stockCountGroup.style.display = btn.dataset.type === 'limited' ? 'block' : 'none';
                }
            });
        });

        // Image upload
        const imageUploadArea = document.getElementById('imageUploadArea');
        const imageInput = document.getElementById('imageInput');
        const imageUrlInput = document.getElementById('imageUrlInput');

        if (imageUploadArea && imageInput) {
            imageUploadArea.addEventListener('click', () => imageInput.click());

            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imageUploadArea.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                        imageUploadArea.classList.add('has-image');
                        imageUrlInput.value = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (imageUrlInput) {
            imageUrlInput.addEventListener('change', () => {
                const url = imageUrlInput.value.trim();
                if (url) {
                    imageUploadArea.innerHTML = `<img src="${url}" alt="Preview" 
                        onerror="this.parentElement.innerHTML='<div class=upload-placeholder><div class=icon>⚠️</div><p>Invalid image URL</p></div>'">`;
                    imageUploadArea.classList.add('has-image');
                }
            });
        }

        // Settings
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            EZEATZ.showToast('Settings saved successfully!', 'success');
        });

        // Day cards for specials
        document.querySelectorAll('.day-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.day-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                const dayName = card.querySelector('.day-name').textContent;
                document.getElementById('selectedDayName').textContent = dayName;

                // Render specials for selected day
                renderSpecialsForDay(card.dataset.day);
            });
        });

        console.log('📋 Event listeners attached');
    }

    function renderSpecialsForDay(day) {
        const specialsGrid = document.getElementById('specialsGrid');
        if (!specialsGrid) return;

        const daySpecialIds = dailySpecials[day] || [];

        specialsGrid.innerHTML = '';

        menuItems.forEach(item => {
            const isSpecial = daySpecialIds.includes(item.id);
            const card = document.createElement('div');
            card.className = `food-card ${isSpecial ? '' : 'disabled'}`;
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="food-image-container" style="height: 120px;">
                    <img src="${item.imageUrl}" alt="${item.name}" class="food-image">
                    ${isSpecial ? '<div class="food-badges"><span class="badge badge-special">⭐ Special</span></div>' : ''}
                </div>
                <div class="food-details" style="padding: 12px;">
                    <h3 class="food-name" style="font-size: 1rem;">${item.name}</h3>
                    <p style="font-size: 0.875rem; color: var(--gray-500);">
                        ${isSpecial ? 'Click to remove' : 'Click to add as special'}
                    </p>
                </div>
            `;

            card.addEventListener('click', () => {
                if (isSpecial) {
                    // Remove from specials
                    dailySpecials[day] = daySpecialIds.filter(id => id !== item.id);
                } else {
                    // Add to specials
                    if (!dailySpecials[day]) dailySpecials[day] = [];
                    dailySpecials[day].push(item.id);
                }

                renderSpecialsForDay(day);
                highlightTodayInDaysGrid();
                applyTodaySpecials();
                updateStats();
                EZEATZ.showToast(
                    isSpecial ? `${item.name} removed from ${day} specials` : `${item.name} added to ${day} specials`,
                    'success'
                );
            });

            specialsGrid.appendChild(card);
        });
    }

    // =====================================================
    // UTILITY
    // =====================================================

    function showLoading(show, text = 'Loading...') {
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
            const loadingText = loadingOverlay.querySelector('.loading-text');
            if (loadingText) loadingText.textContent = text;
        }
    }

    // Export functions
    window.EZEATZDashboard = {
        menuItems,
        dailySpecials,
        updateStats,
        renderFoodGrid,
        updateItemStock
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
