 const menuBtn = document.getElementById('menuBtn');
        const navMenu = document.getElementById('navMenu');

        // Toggle mobile navigation visibility
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Switch menu icon appearance
            if (navMenu.classList.contains('active')) {
                menuBtn.textContent = '✕';
            } else {
                menuBtn.textContent = '☰';
            }
        });