// =====================================================
// FIREBASE CONFIGURATION
// EZEATZ Admin - College Canteen Management
// =====================================================

// Firebase configuration
// Note: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyCBIyIrm2zZEj_9UR6o6TbuXA0Nk5DMjFo",
    authDomain: "ezeatz-40d36.firebaseapp.com",
    projectId: "ezeatz-40d36",
    storageBucket: "ezeatz-40d36.firebasestorage.app",
    messagingSenderId: "434424765439",
    appId: "1:434424765439:web:14753579df958e681ae5ca",
    measurementId: "G-8TMYLPNZTT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Auth providers
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Firestore collections reference
const COLLECTIONS = {
    USERS: 'users',
    CANTEENS: 'canteens',
    MENU_ITEMS: 'menuItems',
    DAILY_SPECIALS: 'dailySpecials'
};

// =====================================================
// SAMPLE DATA FOR DEMO
// =====================================================

const SAMPLE_CANTEENS = [
    { id: 'main_canteen', name: 'Main Campus Canteen', location: 'Ground Floor, Main Building' },
    { id: 'block_a_canteen', name: 'Block A Canteen', location: 'Block A, 1st Floor' },
    { id: 'block_b_canteen', name: 'Block B Cafeteria', location: 'Block B, Ground Floor' }
];

const SAMPLE_MENU_ITEMS = [
    {
        id: 'item_1',
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken, spices, and herbs',
        price: 120,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80',
        stockType: 'limited',
        stockCount: 50,
        isEnabled: true,
        category: 'main_course',
        canteenId: 'main_canteen'
    },
    {
        id: 'item_2',
        name: 'Masala Dosa',
        description: 'Crispy rice crepe filled with spiced potato, served with chutney and sambar',
        price: 45,
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eb5eaf701b?w=400&q=80',
        stockType: 'unlimited',
        stockCount: 0,
        isEnabled: true,
        category: 'breakfast',
        canteenId: 'main_canteen'
    },
    {
        id: 'item_3',
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese cubes in rich tomato and butter gravy',
        price: 90,
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
        stockType: 'limited',
        stockCount: 30,
        isEnabled: true,
        category: 'main_course',
        canteenId: 'main_canteen'
    },
    {
        id: 'item_4',
        name: 'Veg Fried Rice',
        description: 'Wok-tossed rice with fresh vegetables and Indo-Chinese spices',
        price: 70,
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80',
        stockType: 'unlimited',
        stockCount: 0,
        isEnabled: true,
        category: 'main_course',
        canteenId: 'main_canteen'
    },
    {
        id: 'item_5',
        name: 'Cold Coffee',
        description: 'Chilled coffee blended with ice cream and chocolate',
        price: 50,
        imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
        stockType: 'unlimited',
        stockCount: 0,
        isEnabled: true,
        category: 'beverages',
        canteenId: 'main_canteen'
    },
    {
        id: 'item_6',
        name: 'Samosa',
        description: 'Crispy pastry filled with spiced potatoes and peas',
        price: 15,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
        stockType: 'limited',
        stockCount: 100,
        isEnabled: true,
        category: 'snacks',
        canteenId: 'main_canteen'
    },
    {
        id: 'item_7',
        name: 'Idli Sambar',
        description: 'Steamed rice cakes served with sambar and coconut chutney',
        price: 35,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80',
        stockType: 'unlimited',
        stockCount: 0,
        isEnabled: true,
        category: 'breakfast',
        canteenId: 'main_canteen'
    },
    {
        id: 'item_8',
        name: 'Veg Burger',
        description: 'Crispy vegetable patty with fresh lettuce, tomato, and special sauce',
        price: 55,
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
        stockType: 'limited',
        stockCount: 0,
        isEnabled: false,
        category: 'fast_food',
        canteenId: 'main_canteen'
    },
    {
        id: 'item_9',
        name: 'Pav Bhaji',
        description: 'Spiced mashed vegetables served with buttered bread rolls',
        price: 60,
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80',
        stockType: 'limited',
        stockCount: 25,
        isEnabled: true,
        category: 'main_course',
        canteenId: 'main_canteen'
    },
    {
        id: 'item_10',
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime drink with mint and soda',
        price: 25,
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
        stockType: 'unlimited',
        stockCount: 0,
        isEnabled: true,
        category: 'beverages',
        canteenId: 'main_canteen'
    }
];

const SAMPLE_DAILY_SPECIALS = {
    monday: ['item_7'], // Idli Sambar
    tuesday: ['item_9'], // Pav Bhaji
    wednesday: ['item_4'], // Veg Fried Rice
    thursday: ['item_2'], // Masala Dosa
    friday: ['item_1'], // Chicken Biryani
    saturday: ['item_6', 'item_3'], // Samosa + Paneer
    sunday: [] // No specials
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Format currency
 */
function formatPrice(amount) {
    return `₹${amount}`;
}

/**
 * Get current day name
 */
function getCurrentDay() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
}

/**
 * Format date
 */
function formatDate(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format time
 */
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Export for use in other modules
window.EZEATZ = {
    auth,
    db,
    googleProvider,
    COLLECTIONS,
    SAMPLE_CANTEENS,
    SAMPLE_MENU_ITEMS,
    SAMPLE_DAILY_SPECIALS,
    showToast,
    formatPrice,
    getCurrentDay,
    formatDate,
    formatTime
};

console.log('🍽️ EZEATZ Firebase initialized');
