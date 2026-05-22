// SECURE WORKSPACE SCRIPT CONTROL
async function initDashboardWorkspace() {
    // 1. Ask Supabase to look for a session key inside browser LocalStorage
    const { data: { user } } = await window.supabaseClient.auth.getUser();

    // 2. PRIVACY GUARD BLOCK: If no token bundle exists, throw them off the page!
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // 3. EXTRACT PROFILE DATA METADATA
    const userEmail = user.email;
    const displayName = user.user_metadata?.full_name || userEmail.split('@')[0];
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const initialLetter = displayName.charAt(0).toUpperCase();

    // 4. INJECT PROFILE DETAILS INTO HERO PANEL AREA
    document.getElementById('welcome-name').textContent = `Welcome back, ${displayName}`;
    document.getElementById('welcome-email').textContent = userEmail;
    
    const largeAvatarZone = document.getElementById('large-avatar-zone');
    if (largeAvatarZone) {
        largeAvatarZone.innerHTML = avatarUrl 
            ? `<img src="${avatarUrl}" alt="Profile Avatar" class="large-hero-avatar">`
            : `<div class="large-text-avatar">${initialLetter}</div>`;
    }

    // 5. RENDER NAVBAR PROFILE MENU SEAMLESSLY
    const authListItem = document.getElementById('auth-nav-item');
    if (authListItem) {
        authListItem.className = "profile-wrapper";
        authListItem.innerHTML = `
            <button id="profile-avatar-btn" class="avatar-circle-btn" aria-label="User profile">
                ${avatarUrl ? `<img src="${avatarUrl}" alt="Profile">` : `<span>${initialLetter}</span>`}
            </button>
            <div id="profile-dropdown-box" class="profile-dropdown hidden-dropdown">
                <div class="dropdown-header">
                    <span class="user-fullname">${displayName}</span>
                    <span class="user-email-handle">${userEmail}</span>
                </div>
                <hr class="dropdown-divider">
                <button id="signout-link" class="dropdown-logout-btn">Sign Out</button>
            </div>
        `;

        const avatarBtn = document.getElementById('profile-avatar-btn');
        const dropdownBox = document.getElementById('profile-dropdown-box');

        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownBox.classList.toggle('hidden-dropdown');
        });

        document.getElementById('signout-link').addEventListener('click', async () => {
            await window.supabaseClient.auth.signOut();
            window.location.href = "index.html"; // Throw back to home on logout
        });

        window.addEventListener('click', () => {
            dropdownBox.classList.add('hidden-dropdown');
        });
    }

    // Render videos list
    fetchAndRenderVideos();
}

// Reuse your exact existing video rendering grid loops code logic
async function fetchAndRenderVideos() {
    const galleryGrid = document.getElementById('video-gallery-grid');
    if (!galleryGrid) return;

    const { data: videos, error } = await window.supabaseClient.from('videos').select('*');
    if (error || !videos) {
        galleryGrid.innerHTML = `<p>Error loading dashboard feeds.</p>`;
        return;
    }

    galleryGrid.innerHTML = videos.map(video => `
        <div class="video-card">
            <div class="iframe-container">
                <iframe src="https://www.youtube.com/embed/${video.youtube_id}" allowfullscreen></iframe>
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <p>${video.description || 'Studio resource allocation video matching target parameter tracks.'}</p>
            </div>
        </div>
    `).join('');
}

// Mobile Toggle Support inside dashboard views
const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
const mainNavbar = document.getElementById('main-navbar');
if (mobileToggleBtn && mainNavbar) {
    mobileToggleBtn.addEventListener('click', () => {
        mobileToggleBtn.classList.toggle('open-icon');
        mainNavbar.classList.toggle('mobile-open');
    });
}

document.addEventListener("DOMContentLoaded", initDashboardWorkspace);