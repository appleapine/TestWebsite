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
        galleryGrid.innerHTML = `<p style="color: #94a3b8;">No videos found.</p>`;
    }
}

// ==========================================
// SECTION 2: RUNTIME NAVBAR SESSION SWITCHER
// ==========================================
async function checkUserSession() {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    const authListItem = document.getElementById('auth-nav-item');

    if (!authListItem) return;

    if (user) {
        // AUTHENTICATED STATE: Render Avatar Dropdown
        const userEmail = user.email;
        const displayName = user.user_metadata?.full_name || userEmail.split('@')[0];
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        const initialLetter = displayName.charAt(0).toUpperCase();

        authListItem.className = "profile-wrapper"; // Remove buttons styling layout flex
        authListItem.innerHTML = `
            <button id="profile-avatar-btn" class="avatar-circle-btn" aria-label="User profile">
                ${avatarUrl ? `<img src="${avatarUrl}" alt="Profile Avatar">` : `<span>${initialLetter}</span>`}
            </button>
            
            <div id="profile-dropdown-box" class="profile-dropdown hidden-dropdown">
                <div class="dropdown-header">
                    <span class="user-fullname">${displayName}</span>
                    <span class="user-email-handle">${userEmail}</span>
                </div>
                <hr class="dropdown-divider">
                <button id="signout-link" class="dropdown-logout-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                    Sign Out
                </button>
            </div>
        `;

        const avatarBtn = document.getElementById('profile-avatar-btn');
        const dropdownBox = document.getElementById('profile-dropdown-box');

        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownBox.classList.toggle('hidden-dropdown');
        });

        document.getElementById('signout-link').addEventListener('click', async (e) => {
            e.preventDefault();
            await window.supabaseClient.auth.signOut();
            window.location.reload();
        });

        window.addEventListener('click', () => {
            dropdownBox.classList.add('hidden-dropdown');
        });

    } else {
        // GUEST STATE: Render explicit Log In and Sign Up triggers side-by-side
        authListItem.className = "auth-nav-buttons-group";
        authListItem.innerHTML = `
            <button id="nav-login-trigger" class="nav-login-link-btn">Log In</button>
            <button id="nav-signup-trigger" class="nav-signup-solid-btn">Sign Up</button>
        `;

        // Attach unique window triggers to spin up modal in specified configurations
        document.getElementById('nav-login-trigger').addEventListener('click', () => {
            openAuthPopupModal("login");
        });

        document.getElementById('nav-signup-trigger').addEventListener('click', () => {
            openAuthPopupModal("signup");
        });
    }
}

// Helper utility to fade in modal and notify the auth manager configuration variables
function openAuthPopupModal(initialMode) {
    const authModal = document.getElementById('authModal');
    if (!authModal) return;
    
    authModal.classList.remove('hidden-modal');
    
    // Globally defined hook method located in auth.js
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
}

// Initial sequence triggers
document.addEventListener("DOMContentLoaded", () => {
    fetchAndRenderVideos();
    checkUserSession();
});