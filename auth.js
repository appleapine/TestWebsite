let authMode = "login"; // Default global processing pipeline tracks 'login' or 'signup'

const authForm = document.getElementById('unified-auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const nameInput = document.getElementById('full-name');

// Target Layout UI elements variables
const nameGroup = document.getElementById('name-group');
const authTitle = document.getElementById('auth-title');
const submitBtn = document.getElementById('submit-btn');
const messageBox = document.getElementById('message-box');
const toggleLink = document.getElementById('auth-toggle-link');
const togglePromptText = document.getElementById('toggle-prompt-text');

// ==========================================
// 1. EXPOSED VIEW CONTROLLER STATE MODULE
// ==========================================
window.switchAuthViewMode = function(targetMode) {
    if (!authForm || !messageBox) return;
    messageBox.textContent = ""; // Purge old errors
    
    if (targetMode === "signup") {
        authMode = "signup";
        authTitle.textContent = "Create account";
        submitBtn.textContent = "Create Account";
        togglePromptText.textContent = "Already have an account?";
        toggleLink.textContent = "Log in";
        
        nameGroup.style.display = "flex";
        nameInput.setAttribute('required', 'true');
    } else {
        authMode = "login";
        authTitle.textContent = "Log in";
        submitBtn.textContent = "Log In";
        togglePromptText.textContent = "Don't have an account?";
        toggleLink.textContent = "Sign up";
        
        nameGroup.style.display = "none";
        nameInput.removeAttribute('required');
    }
};

// Wire bottom footer anchor text link up to flip configuration maps smoothly
if (toggleLink) {
    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        const nextState = (authMode === "login") ? "signup" : "login";
        window.switchAuthViewMode(nextState);
    });
}

// ==========================================
// 2. FORM ACTION TRAFFIC ROUTER ENGINE
// ==========================================
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (messageBox) messageBox.textContent = "";

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            return runMessagePipeline("Please fill in all required inputs.", "red");
        }
        if (password.length < 6) {
            return runMessagePipeline("Password constraints require minimum 6 characters.", "red");
        }

        submitBtn.disabled = true;

        // --- TRAFFIC SELECTION LAYER A: MANUAL LOGIN ---
        if (authMode === "login") {
            submitBtn.textContent = "Logging in...";
            
            const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

            if (error) {
                runMessagePipeline(error.message, "red");
                submitBtn.textContent = "Log In";
                submitBtn.disabled = false;
            } else {
                runMessagePipeline("Access verified! Syncing core account...", "green");
                executeClosurePipeline();
            }
        } 
        // --- TRAFFIC SELECTION LAYER B: SECURE ANTI-ENUMERATION SIGNUP ---
        else {
            const fullName = nameInput.value.trim();
            if (!fullName) {
                submitBtn.disabled = false;
                return runMessagePipeline("Please state your name to compile profile details.", "red");
            }

            submitBtn.textContent = "Creating profile...";

            const { error } = await window.supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            });

            if (error) {
                runMessagePipeline(error.message, "red");
                submitBtn.textContent = "Create Account";
                submitBtn.disabled = false;
            } else {
                // SECURITY ENHANCEMENT: Identical success feedback mask prevents scanning account records
                runMessagePipeline("Registration parameters complete! Confirm connection tracking updates.", "green");
                executeClosurePipeline();
            }
        }
    });
}

// Google Authentication
const googleBtn = document.getElementById('google-btn');
if (googleBtn) {
    googleBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/dashboard.html'}
        });
    });
}

function runMessagePipeline(text, colorType) {
    if (!messageBox) return;
    messageBox.textContent = text;
    if (colorType === "red") messageBox.style.color = "#ef4444";
    else if (colorType === "green") messageBox.style.color = "#22c55e";
    else messageBox.style.color = "#0056d2";
}

// Locate this function at the absolute bottom of your auth.js file and update it:
function executeClosurePipeline() {
    setTimeout(() => {
        const modalContainer = document.getElementById('authModal');
        if (modalContainer) modalContainer.classList.add('hidden-modal');
        
        // UPGRADED: Forward them directly to your private dashboard instead of reloading index!
        window.location.href = "dashboard.html"; 
    }, 1200);
}