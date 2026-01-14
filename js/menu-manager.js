// =====================================================
// MENU MANAGER MODULE
// EZEATZ Admin - College Canteen Management
// =====================================================

(function () {
    'use strict';

    // Category definitions with icons
    const CATEGORIES = {
        breakfast: { name: 'Breakfast', icon: '🌅', color: '#FFD700' },
        main_course: { name: 'Main Course', icon: '🍛', color: '#FF6B6B' },
        snacks: { name: 'Snacks', icon: '🍿', color: '#4CAF50' },
        fast_food: { name: 'Fast Food', icon: '🍔', color: '#FF9800' },
        beverages: { name: 'Beverages', icon: '🥤', color: '#2196F3' },
        desserts: { name: 'Desserts', icon: '🍰', color: '#E91E63' }
    };

    // Image sources for demo (high-quality food images)
    const FOOD_IMAGES = {
        biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80',
        dosa: 'https://images.unsplash.com/photo-1668236543090-82eb5eaf701b?w=400&q=80',
        paneer: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
        fried_rice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80',
        coffee: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
        samosa: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
        idli: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80',
        burger: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
        pav_bhaji: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80',
        lime_soda: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
        pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
        pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80',
        sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80',
        tea: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
        noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
        thali: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
        default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
    };

    // =====================================================
    // MENU ITEM VALIDATION
    // =====================================================

    function validateMenuItem(item) {
        const errors = [];

        if (!item.name || item.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }

        if (!item.price || item.price < 1) {
            errors.push('Price must be at least ₹1');
        }

        if (item.stockType === 'limited' && (item.stockCount === undefined || item.stockCount < 0)) {
            errors.push('Stock count must be 0 or more for limited items');
        }

        return errors;
    }

    // =====================================================
    // MENU ITEM HELPERS
    // =====================================================

    function getDefaultImage(category) {
        const categoryImages = {
            breakfast: FOOD_IMAGES.idli,
            main_course: FOOD_IMAGES.biryani,
            snacks: FOOD_IMAGES.samosa,
            fast_food: FOOD_IMAGES.burger,
            beverages: FOOD_IMAGES.coffee,
            desserts: FOOD_IMAGES.default
        };
        return categoryImages[category] || FOOD_IMAGES.default;
    }

    function formatCategory(categoryKey) {
        return CATEGORIES[categoryKey] || { name: 'Other', icon: '🍽️', color: '#666' };
    }

    function generateItemId() {
        return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // =====================================================
    // BULK OPERATIONS
    // =====================================================

    function enableAllItems(items) {
        let count = 0;
        items.forEach(item => {
            if (!item.isEnabled) {
                // Only enable if stock is available
                if (item.stockType === 'unlimited' || item.stockCount > 0) {
                    item.isEnabled = true;
                    count++;
                }
            }
        });
        return count;
    }

    function disableAllItems(items) {
        let count = 0;
        items.forEach(item => {
            if (item.isEnabled) {
                item.isEnabled = false;
                count++;
            }
        });
        return count;
    }

    function updateAllStock(items, callback) {
        const limitedItems = items.filter(item => item.stockType === 'limited');
        if (callback) {
            callback(limitedItems);
        }
        return limitedItems;
    }

    // =====================================================
    // SEARCH & FILTER
    // =====================================================

    function searchItems(items, query) {
        const q = query.toLowerCase().trim();
        if (!q) return items;

        return items.filter(item =>
            item.name.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q)) ||
            (item.category && item.category.toLowerCase().includes(q))
        );
    }

    function filterByCategory(items, category) {
        if (!category || category === 'all') return items;
        return items.filter(item => item.category === category);
    }

    function filterByStock(items, type) {
        switch (type) {
            case 'low':
                return items.filter(item =>
                    item.stockType === 'limited' && item.stockCount < 10
                );
            case 'out':
                return items.filter(item =>
                    item.stockType === 'limited' && item.stockCount === 0
                );
            case 'available':
                return items.filter(item => item.isEnabled);
            case 'disabled':
                return items.filter(item => !item.isEnabled);
            default:
                return items;
        }
    }

    function sortItems(items, sortBy) {
        const sorted = [...items];

        switch (sortBy) {
            case 'name_asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'price_asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price_desc':
                return sorted.sort((a, b) => b.price - a.price);
            case 'stock_asc':
                return sorted.sort((a, b) => {
                    const stockA = a.stockType === 'unlimited' ? Infinity : a.stockCount;
                    const stockB = b.stockType === 'unlimited' ? Infinity : b.stockCount;
                    return stockA - stockB;
                });
            case 'stock_desc':
                return sorted.sort((a, b) => {
                    const stockA = a.stockType === 'unlimited' ? Infinity : a.stockCount;
                    const stockB = b.stockType === 'unlimited' ? Infinity : b.stockCount;
                    return stockB - stockA;
                });
            default:
                return sorted;
        }
    }

    // =====================================================
    // EXPORT FUNCTIONS
    // =====================================================

    function exportToJSON(items) {
        return JSON.stringify(items, null, 2);
    }

    function exportToCSV(items) {
        const headers = ['Name', 'Description', 'Price', 'Category', 'Stock Type', 'Stock Count', 'Enabled'];
        const rows = items.map(item => [
            item.name,
            item.description || '',
            item.price,
            item.category,
            item.stockType,
            item.stockCount,
            item.isEnabled
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    // =====================================================
    // EXPOSE API
    // =====================================================

    window.MenuManager = {
        CATEGORIES,
        FOOD_IMAGES,
        validateMenuItem,
        getDefaultImage,
        formatCategory,
        generateItemId,
        enableAllItems,
        disableAllItems,
        updateAllStock,
        searchItems,
        filterByCategory,
        filterByStock,
        sortItems,
        exportToJSON,
        exportToCSV
    };

    console.log('📋 Menu Manager module loaded');
})();
