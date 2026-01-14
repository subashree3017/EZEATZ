// =====================================================
// STOCK ALERTS MODULE
// EZEATZ Admin - College Canteen Management
// =====================================================

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        alertIntervalMinutes: 30,  // Alert every 30 minutes
        lowStockThreshold: 10,     // Items with less than this are "low stock"
        criticalStockThreshold: 5, // Items with less than this are "critical"
        notificationSound: true,   // Play sound with notification
        browserNotifications: true // Show browser notifications
    };

    // State
    let alertTimer = null;
    let countdownInterval = null;
    let remainingSeconds = CONFIG.alertIntervalMinutes * 60;
    let isAlertVisible = false;
    let notificationPermission = 'default';

    // DOM Elements
    const stockAlertBanner = document.getElementById('stockAlertBanner');
    const alertCountdown = document.getElementById('alertCountdown');
    const dismissAlert = document.getElementById('dismissAlert');
    const updateStockBtn = document.getElementById('updateStockBtn');

    // =====================================================
    // INITIALIZATION
    // =====================================================

    function init() {
        // Request notification permission
        requestNotificationPermission();

        // Start the stock alert timer
        startAlertTimer();

        // Setup event listeners
        setupEventListeners();

        console.log('⏰ Stock Alerts module initialized');
    }

    // =====================================================
    // NOTIFICATION PERMISSION
    // =====================================================

    async function requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('Browser does not support notifications');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            notificationPermission = permission;

            if (permission === 'granted') {
                console.log('🔔 Notification permission granted');
            } else {
                console.log('🔕 Notification permission denied');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }

    // =====================================================
    // ALERT TIMER
    // =====================================================

    function startAlertTimer() {
        // Reset remaining seconds
        remainingSeconds = CONFIG.alertIntervalMinutes * 60;

        // Clear existing timers
        if (alertTimer) clearTimeout(alertTimer);
        if (countdownInterval) clearInterval(countdownInterval);

        // Start countdown display
        updateCountdownDisplay();
        countdownInterval = setInterval(() => {
            remainingSeconds--;
            updateCountdownDisplay();

            if (remainingSeconds <= 0) {
                triggerStockAlert();
            }
        }, 1000);

        console.log(`⏰ Stock alert timer started (${CONFIG.alertIntervalMinutes} minutes)`);
    }

    function updateCountdownDisplay() {
        if (!alertCountdown) return;

        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        alertCountdown.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Change banner urgency based on time remaining
        if (stockAlertBanner) {
            if (remainingSeconds <= 60) {
                stockAlertBanner.classList.add('urgent');
            } else {
                stockAlertBanner.classList.remove('urgent');
            }
        }
    }

    function triggerStockAlert() {
        console.log('🔔 Stock update reminder triggered!');

        // Show banner
        showAlertBanner();

        // Show browser notification
        showBrowserNotification();

        // Play sound
        if (CONFIG.notificationSound) {
            playNotificationSound();
        }

        // Reset timer for next alert
        remainingSeconds = CONFIG.alertIntervalMinutes * 60;
    }

    // =====================================================
    // ALERT BANNER
    // =====================================================

    function showAlertBanner() {
        if (!stockAlertBanner) return;

        stockAlertBanner.style.display = 'flex';
        stockAlertBanner.classList.add('urgent');
        isAlertVisible = true;

        // Animate entrance
        stockAlertBanner.style.animation = 'none';
        stockAlertBanner.offsetHeight; // Trigger reflow
        stockAlertBanner.style.animation = 'slideDown 0.3s ease';
    }

    function hideAlertBanner() {
        if (!stockAlertBanner) return;

        stockAlertBanner.style.display = 'none';
        stockAlertBanner.classList.remove('urgent');
        isAlertVisible = false;
    }

    // =====================================================
    // BROWSER NOTIFICATIONS
    // =====================================================

    function showBrowserNotification() {
        if (!CONFIG.browserNotifications) return;
        if (notificationPermission !== 'granted') return;

        try {
            const notification = new Notification('🔔 EZEATZ - Stock Update Reminder', {
                body: 'Time to check and update your stock levels!',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍽️</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📦</text></svg>',
                tag: 'stock-alert',
                requireInteraction: true,
                vibrate: [200, 100, 200]
            });

            notification.onclick = function () {
                window.focus();
                showStockSection();
                notification.close();
            };

            // Auto-close after 10 seconds
            setTimeout(() => notification.close(), 10000);

        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    // =====================================================
    // NOTIFICATION SOUND
    // =====================================================

    function playNotificationSound() {
        try {
            // Create a simple beep using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // Frequency in Hz
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);

            // Play second beep
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 1000;
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.5);
            }, 200);

        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    // =====================================================
    // STOCK CHECKING
    // =====================================================

    function checkLowStockItems() {
        if (!window.EZEATZDashboard || !window.EZEATZDashboard.menuItems) {
            return { low: [], critical: [], outOfStock: [] };
        }

        const items = window.EZEATZDashboard.menuItems;

        const low = items.filter(item =>
            item.stockType === 'limited' &&
            item.stockCount > CONFIG.criticalStockThreshold &&
            item.stockCount <= CONFIG.lowStockThreshold
        );

        const critical = items.filter(item =>
            item.stockType === 'limited' &&
            item.stockCount > 0 &&
            item.stockCount <= CONFIG.criticalStockThreshold
        );

        const outOfStock = items.filter(item =>
            item.stockType === 'limited' &&
            item.stockCount === 0
        );

        return { low, critical, outOfStock };
    }

    function generateStockReport() {
        const { low, critical, outOfStock } = checkLowStockItems();

        let report = '📊 STOCK STATUS REPORT\n';
        report += '========================\n\n';

        if (outOfStock.length > 0) {
            report += '🔴 OUT OF STOCK:\n';
            outOfStock.forEach(item => {
                report += `   • ${item.name}\n`;
            });
            report += '\n';
        }

        if (critical.length > 0) {
            report += '🟠 CRITICAL (≤5 items):\n';
            critical.forEach(item => {
                report += `   • ${item.name}: ${item.stockCount} left\n`;
            });
            report += '\n';
        }

        if (low.length > 0) {
            report += '🟡 LOW STOCK (≤10 items):\n';
            low.forEach(item => {
                report += `   • ${item.name}: ${item.stockCount} left\n`;
            });
            report += '\n';
        }

        if (low.length === 0 && critical.length === 0 && outOfStock.length === 0) {
            report += '✅ All items are well-stocked!\n';
        }

        return report;
    }

    // =====================================================
    // NAVIGATION HELPER
    // =====================================================

    function showStockSection() {
        // Click on stock nav item
        const stockNav = document.querySelector('[data-section="stock"]');
        if (stockNav) {
            stockNav.click();
        }

        // Hide alert banner
        hideAlertBanner();
    }

    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    function setupEventListeners() {
        // Dismiss alert button
        if (dismissAlert) {
            dismissAlert.addEventListener('click', () => {
                hideAlertBanner();
                EZEATZ.showToast('Reminder dismissed. Next reminder in 30 minutes.', 'info');
            });
        }

        // Update stock button
        if (updateStockBtn) {
            updateStockBtn.addEventListener('click', () => {
                showStockSection();
                hideAlertBanner();
                EZEATZ.showToast('Opening stock management...', 'info');
            });
        }

        // Update All Stock button in Stock section
        const updateAllStockBtn = document.getElementById('updateAllStockBtn');
        if (updateAllStockBtn) {
            updateAllStockBtn.addEventListener('click', () => {
                const { low, critical, outOfStock } = checkLowStockItems();
                const totalIssues = low.length + critical.length + outOfStock.length;

                if (totalIssues === 0) {
                    EZEATZ.showToast('All items are well-stocked! 🎉', 'success');
                } else {
                    const report = generateStockReport();
                    console.log(report);
                    EZEATZ.showToast(`${totalIssues} items need attention. Check console for details.`, 'warning');
                }
            });
        }
    }

    // =====================================================
    // PUBLIC API
    // =====================================================

    window.StockAlerts = {
        init,
        startAlertTimer,
        triggerStockAlert,
        showAlertBanner,
        hideAlertBanner,
        checkLowStockItems,
        generateStockReport,
        setAlertInterval: (minutes) => {
            CONFIG.alertIntervalMinutes = minutes;
            startAlertTimer();
        },
        setLowStockThreshold: (threshold) => {
            CONFIG.lowStockThreshold = threshold;
        },
        enableNotifications: (enabled) => {
            CONFIG.browserNotifications = enabled;
        },
        enableSound: (enabled) => {
            CONFIG.notificationSound = enabled;
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Add CSS animation for banner
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
