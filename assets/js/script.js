/**
 * PB AVIATION - JavaScript Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const header = document.querySelector('.main-header');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const contactForm = document.getElementById('pb-contact-form');
    const formResponse = document.getElementById('form-response-message');

    /* ==========================================
       1. Sticky Header & Scroll-to-Top Button
       ========================================== */
    window.addEventListener('scroll', () => {
        // Sticky Header class addition
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Floating Scroll-to-Top Button visibility
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }

        // Active Nav Link highlight on scroll
        highlightNavLink();
    });

    // Scroll to Top action
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    /* ==========================================
       2. Responsive Mobile Menu
       ========================================== */
    mobileNavToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        mobileNavToggle.setAttribute('aria-expanded', isOpen);
        
        // Simple hamburger transition helper (CSS handles animation)
        mobileNavToggle.classList.toggle('active');
    });

    // Close menu when navigation links are clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            mobileNavToggle.classList.remove('active');
            mobileNavToggle.setAttribute('aria-expanded', 'false');
        });
    });

    /* ==========================================
       3. Active Navigation Link on Scroll
       ========================================== */
    const sections = document.querySelectorAll('section[id]');

    function highlightNavLink() {
        let scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // offset for sticky header
            const sectionId = current.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector('.nav-menu a[href*=' + sectionId + ']').classList.add('active');
            } else {
                document.querySelector('.nav-menu a[href*=' + sectionId + ']').classList.remove('active');
            }
        });
    }

    /* ==========================================
       4. Contact Form Simulation
       ========================================== */
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Form Fields
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const phone = document.getElementById('form-phone').value.trim();
            const message = document.getElementById('form-message').value.trim();

            // Honeypot anti-spam: se preenchido, é bot -> abandona silenciosamente
            const botField = contactForm.querySelector('input[name="botcheck"]');
            if (botField && botField.checked) {
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            // Simple validations
            if (!name || !email || !phone || !message) {
                showFormResponse('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }

            // Change button to submitting state
            submitBtn.disabled = true;
            submitBtn.textContent = 'ENVIANDO...';
            submitBtn.style.opacity = '0.7';

            try {
                // Envia via Web3Forms (não precisa de servidor próprio)
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        access_key: contactForm.querySelector('input[name="access_key"]').value,
                        subject: contactForm.querySelector('input[name="subject"]').value,
                        from_name: contactForm.querySelector('input[name="from_name"]').value,
                        name: name,
                        email: email,
                        phone: phone,
                        message: message
                    })
                });

                const result = await response.json();

                if (result.success) {
                    showFormResponse('Obrigado! Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.', 'success');
                    contactForm.reset();
                } else {
                    showFormResponse('Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.', 'error');
                }
            } catch (err) {
                showFormResponse('Erro de conexão. Tente novamente ou fale pelo WhatsApp.', 'error');
            } finally {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                submitBtn.style.opacity = '1';

                // Clear message after 7 seconds
                setTimeout(() => {
                    formResponse.style.display = 'none';
                    formResponse.className = 'form-response';
                    formResponse.textContent = '';
                }, 7000);
            }
        });
    }

    function showFormResponse(msg, type) {
        formResponse.textContent = msg;
        formResponse.className = 'form-response ' + type;
        formResponse.style.display = 'block';
    }
});
