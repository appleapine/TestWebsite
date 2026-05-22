// ==========================================
// SECTION 1: INJECT AND RENDER REPOSITORY VIDEOS
// ==========================================
async function fetchAndRenderVideos() {
    const galleryGrid = document.getElementById('video-gallery-grid');
    if (!galleryGrid) return;

    const { data: videos, error } = await window.supabaseClient
        .from('videos')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Database compilation error:", error.message);
        galleryGrid.innerHTML = `<p style="color: #ef4444;">Could not synchronize video array structure.</p>`;
        return;
    }

    if (videos && videos.length > 0) {
        galleryGrid.innerHTML = videos.map(video => `
            <div class="video-card">
                <div class="iframe-container">
                    <iframe src="https://www.youtube.com/embed/${video.youtube_id}" 
                            title="${video.title}" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p>${video.description || 'No supplementary context provided.'}</p>
                </div>
            </div>
        `).join('');
    } else {
        galleryGrid.innerHTML = `<p style="color: #94a3b8;">No video rows match queries inside database repository context.</p>`;
    }
}

// ==========================================
// SECTION 2: APPLICATION RUNTIME SESSION MANAGER
// ==========================================
// ==========================================
// SECTION 2: RUNTIME NAVBAR SESSION SWITCHER
// ==========================================
async function checkUserSession() {
    // Look for active credentials in browser LocalStorage
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    const authListItem = document.getElementById('auth-nav-item');

    if (!authListItem) return;

    if (user) {
        // AUTOMATED DEVICE SECURITY ROUTER:
        // If they are already logged in, skip the home page and send them to the workspace!
        window.location.href = "dashboard.html";
        return;
    } 
    
    // GUEST MODE: The buttons already exist in HTML! Just bind click triggers to open the modal.
    const loginTrigger = document.getElementById('nav-login-trigger');
    const signupTrigger = document.getElementById('nav-signup-trigger');

    if (loginTrigger) {
        loginTrigger.addEventListener('click', () => {
            openAuthPopupModal("login");
        });
    }

    if (signupTrigger) {
        signupTrigger.addEventListener('click', () => {
            openAuthPopupModal("signup");
        });
    }
}

// Helper method to open the central container box overlay
function openAuthPopupModal(initialMode) {
    const authModal = document.getElementById('authModal');
    if (!authModal) return;
    
    authModal.classList.remove('hidden-modal');
    
    // Calls the controller routing method located inside auth.js
    if (typeof window.switchAuthViewMode === 'function') {
        window.switchAuthViewMode(initialMode);
    }
}
// ==========================================
// SECTION 3: MODAL CLOSURE INTERACTIVE ACTIONS
// ==========================================
const authModal = document.getElementById('authModal');
const closeModalBtn = document.getElementById('close-modal-btn');

if (closeModalBtn && authModal) {
    closeModalBtn.addEventListener('click', () => {
        authModal.classList.add('hidden-modal');
    });
    
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.add('hidden-modal');
        }
    });
}

// ==========================================
// SECTION 4: MOBILE HAMBURGER NAVIGATION LOGIC
// ==========================================
const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
const mainNavbar = document.getElementById('main-navbar');

if (mobileToggleBtn && mainNavbar) {
    mobileToggleBtn.addEventListener('click', () => {
        mobileToggleBtn.classList.toggle('open-icon');
        mainNavbar.classList.toggle('mobile-open');
    });

    mainNavbar.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
            mobileToggleBtn.classList.remove('open-icon');
            mainNavbar.classList.remove('mobile-open');
        }
    });
}

// Initial sequence mount triggers on page download
document.addEventListener("DOMContentLoaded", () => {
    fetchAndRenderVideos();
    checkUserSession();
});