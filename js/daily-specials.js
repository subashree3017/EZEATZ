// =====================================================
// DAILY SPECIALS MODULE
// EZEATZ Admin - College Canteen Management
// =====================================================

(function () {
    'use strict';

    // Day names for reference
    const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const DAY_LABELS = {
        sunday: 'Sunday',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday'
    };

    // State
    let specialsSchedule = {};
    let lastCheckedDay = null;

    // =====================================================
    // INITIALIZATION
    // =====================================================

    function init() {
        // Load schedule from sample data or storage
        loadSchedule();

        // Check and apply today's specials
        checkAndApplyDailySpecials();

        // Set up daily check (runs at midnight)
        scheduleMidnightCheck();

        console.log('⭐ Daily Specials module initialized');
    }

    // =====================================================
    // SCHEDULE MANAGEMENT
    // =====================================================

    function loadSchedule() {
        // Try to load from localStorage first
        const saved = localStorage.getItem('ezeatz_daily_specials');

        if (saved) {
            try {
                specialsSchedule = JSON.parse(saved);
            } catch (e) {
                specialsSchedule = { ...EZEATZ.SAMPLE_DAILY_SPECIALS };
            }
        } else {
            // Use sample data
            specialsSchedule = { ...EZEATZ.SAMPLE_DAILY_SPECIALS };
        }

        // Ensure all days exist
        DAYS.forEach(day => {
            if (!specialsSchedule[day]) {
                specialsSchedule[day] = [];
            }
        });
    }

    function saveSchedule() {
        try {
            localStorage.setItem('ezeatz_daily_specials', JSON.stringify(specialsSchedule));
        } catch (e) {
            console.error('Failed to save specials schedule:', e);
        }
    }

    function getSchedule() {
        return { ...specialsSchedule };
    }

    function setDaySpecials(day, itemIds) {
        if (!DAYS.includes(day)) {
            console.error('Invalid day:', day);
            return false;
        }

        specialsSchedule[day] = [...itemIds];
        saveSchedule();

        // If it's today, apply immediately
        if (day === getCurrentDay()) {
            applyTodaySpecials();
        }

        return true;
    }

    function addSpecialToDay(day, itemId) {
        if (!DAYS.includes(day)) return false;

        if (!specialsSchedule[day].includes(itemId)) {
            specialsSchedule[day].push(itemId);
            saveSchedule();

            if (day === getCurrentDay()) {
                applyTodaySpecials();
            }
        }

        return true;
    }

    function removeSpecialFromDay(day, itemId) {
        if (!DAYS.includes(day)) return false;

        const index = specialsSchedule[day].indexOf(itemId);
        if (index > -1) {
            specialsSchedule[day].splice(index, 1);
            saveSchedule();

            if (day === getCurrentDay()) {
                applyTodaySpecials();
            }
        }

        return true;
    }

    function isItemSpecialOnDay(itemId, day) {
        return specialsSchedule[day] && specialsSchedule[day].includes(itemId);
    }

    // =====================================================
    // DAILY SPECIAL APPLICATION
    // =====================================================

    function getCurrentDay() {
        return DAYS[new Date().getDay()];
    }

    function getTodaySpecialIds() {
        const today = getCurrentDay();
        return specialsSchedule[today] || [];
    }

    function checkAndApplyDailySpecials() {
        const today = getCurrentDay();

        // Only apply if day has changed
        if (lastCheckedDay !== today) {
            console.log(`📅 Day changed to ${DAY_LABELS[today]}, applying specials...`);
            applyTodaySpecials();
            lastCheckedDay = today;
        }
    }

    function applyTodaySpecials() {
        const today = getCurrentDay();
        const todaySpecialIds = specialsSchedule[today] || [];

        if (!window.EZEATZDashboard || !window.EZEATZDashboard.menuItems) {
            console.log('Menu items not loaded yet, will retry...');
            setTimeout(applyTodaySpecials, 1000);
            return;
        }

        const menuItems = window.EZEATZDashboard.menuItems;
        let appliedCount = 0;

        menuItems.forEach(item => {
            const wasSpecial = item.isSpecial;
            item.isSpecial = todaySpecialIds.includes(item.id);

            // Auto-enable special items if they have stock
            if (item.isSpecial && !item.isEnabled) {
                if (item.stockType === 'unlimited' || item.stockCount > 0) {
                    item.isEnabled = true;
                    console.log(`✅ Auto-enabled special item: ${item.name}`);
                }
            }

            if (item.isSpecial) {
                appliedCount++;
            }
        });

        console.log(`⭐ Applied ${appliedCount} special(s) for ${DAY_LABELS[today]}`);

        // Update UI if dashboard functions are available
        if (window.EZEATZDashboard) {
            if (typeof window.EZEATZDashboard.renderFoodGrid === 'function') {
                // Re-render will be handled by dashboard
            }
            if (typeof window.EZEATZDashboard.updateStats === 'function') {
                window.EZEATZDashboard.updateStats();
            }
        }

        // Show notification for today's specials
        if (appliedCount > 0 && lastCheckedDay === null) {
            const specialNames = menuItems
                .filter(item => item.isSpecial)
                .map(item => item.name)
                .join(', ');

            EZEATZ.showToast(`Today's Specials: ${specialNames}`, 'info');
        }
    }

    // =====================================================
    // MIDNIGHT CHECK SCHEDULER
    // =====================================================

    function scheduleMidnightCheck() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Next midnight

        const msUntilMidnight = midnight.getTime() - now.getTime();

        console.log(`⏰ Next daily check scheduled in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);

        setTimeout(() => {
            checkAndApplyDailySpecials();
            // Schedule next check
            scheduleMidnightCheck();
        }, msUntilMidnight);

        // Also check every hour as a backup
        setInterval(checkAndApplyDailySpecials, 60 * 60 * 1000);
    }

    // =====================================================
    // UI HELPERS
    // =====================================================

    function getDaySpecialsCount(day) {
        return (specialsSchedule[day] || []).length;
    }

    function getAllSpecials() {
        const allSpecials = {};

        DAYS.forEach(day => {
            allSpecials[day] = {
                label: DAY_LABELS[day],
                itemIds: specialsSchedule[day] || [],
                count: getDaySpecialsCount(day)
            };
        });

        return allSpecials;
    }

    function getWeeklySpecialsReport() {
        if (!window.EZEATZDashboard || !window.EZEATZDashboard.menuItems) {
            return 'Menu items not loaded';
        }

        const menuItems = window.EZEATZDashboard.menuItems;
        let report = '📅 WEEKLY SPECIALS SCHEDULE\n';
        report += '============================\n\n';

        DAYS.forEach(day => {
            const specialIds = specialsSchedule[day] || [];
            const specialItems = menuItems.filter(item => specialIds.includes(item.id));

            const isToday = day === getCurrentDay();
            const dayLabel = isToday ? `${DAY_LABELS[day]} (TODAY)` : DAY_LABELS[day];

            report += `${isToday ? '👉 ' : '   '}${dayLabel}:\n`;

            if (specialItems.length === 0) {
                report += '      No specials scheduled\n';
            } else {
                specialItems.forEach(item => {
                    report += `      • ${item.name} - ₹${item.price}\n`;
                });
            }
            report += '\n';
        });

        return report;
    }

    // =====================================================
    // PUBLIC API
    // =====================================================

    window.DailySpecials = {
        init,
        DAYS,
        DAY_LABELS,
        getSchedule,
        setDaySpecials,
        addSpecialToDay,
        removeSpecialFromDay,
        isItemSpecialOnDay,
        getCurrentDay,
        getTodaySpecialIds,
        checkAndApplyDailySpecials,
        applyTodaySpecials,
        getDaySpecialsCount,
        getAllSpecials,
        getWeeklySpecialsReport
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
