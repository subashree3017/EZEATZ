// =====================================================
// AUTHENTICATION MODULE - SIMPLIFIED
// EZEATZ Admin - College Canteen Management
// =====================================================

(function () {
    'use strict';

    // DOM Elements
    const loadingOverlay = document.getElementById('loadingOverlay');
    const stepLogin = document.getElementById('stepLogin');
    const simpleLoginForm = document.getElementById('simpleLoginForm');
    const adminNameInput = document.getElementById('adminNameInput');

    // =====================================================
    // SIMPLE SIGN IN
    // =====================================================

    async function handleSimpleSignIn(e) {
        if (e) e.preventDefault();

        const adminName = adminNameInput.value ? adminNameInput.value.trim() : '';
        if (!adminName) {
            EZEATZ.showToast('Please enter your name', 'error');
            return;
        }

        try {
            console.log('🚀 Attempting sign-in for:', adminName);
            showLoading(true, 'Entering Dashboard...');

            // Sign in anonymously
            const result = await EZEATZ.auth.signInAnonymously();
            const user = result.user;
            console.log('✅ Signed in anonymously:', user.uid);

            // Store user profile in Firestore
            await EZEATZ.db.collection(EZEATZ.COLLECTIONS.USERS).doc(user.uid).set({
                displayName: adminName,
                email: 'admin@ezeatz.com',
                authMethod: 'anonymous',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log('✅ User profile created in Firestore');

            EZEATZ.showToast(`Welcome ${adminName}! Redirecting...`, 'success');

            // Redirect to dashboard
            setTimeout(() => {
                console.log('➡ Redirecting to dashboard.html');
                window.location.href = 'dashboard.html';
            }, 1000);

        } catch (error) {
            console.error('❌ Sign-in Error:', error);
            showLoading(false);

            let errorMsg = 'Failed to enter dashboard. ';
            if (error.code === 'auth/operation-not-allowed') {
                errorMsg += 'Anonymous auth is not enabled in Firebase Console.';
            } else if (error.code === 'permission-denied') {
                errorMsg += 'Firestore permission denied.';
            } else {
                errorMsg += error.message || 'Please try again.';
            }

            EZEATZ.showToast(errorMsg, 'error');
            alert(errorMsg); // Use alert as backup if toast fails
        }
    }

    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    function showLoading(show, text = 'Loading...') {
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
            const loadingText = loadingOverlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = text;
            }
        }
    }

    // =====================================================
    // AUTH STATE OBSERVER
    // =====================================================

    function setupAuthObserver() {
        console.log('👀 Setting up Auth Observer on index.html');
        EZEATZ.auth.onAuthStateChanged((user) => {
            console.log('👤 Auth State (index.html):', user ? 'Logged In (' + user.uid + ')' : 'Logged Out');
            if (user) {
                const path = window.location.pathname;
                const isLoginPage = path === '/' ||
                    path.endsWith('/') ||
                    path.endsWith('index.html') ||
                    path.includes('index.html');

                if (isLoginPage && !path.includes('dashboard.html')) {
                    console.log('🚀 Redirecting to dashboard.html...');
                    window.location.replace('dashboard.html');
                }
            }
        });
    }

    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    function init() {
        if (simpleLoginForm) {
            simpleLoginForm.addEventListener('submit', handleSimpleSignIn);
        }

        // Setup auth observer
        setupAuthObserver();

        console.log('🔐 Simplified Auth module initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
