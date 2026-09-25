// ===== FUNCIÓN DE ESCRITURA AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    const SELECTION_SOUND_SRC = 'sounds/selection.mp3';
    const CONFIRM_SOUND_SRC = 'sounds/confirm.mp3';
    const BACKGROUND_MUSIC_SRC = 'music/its raining somewhere else.mp3';
    const BACKGROUND_MUSIC_POSITION_KEY = 'stem-background-music-position';

    const selectionSound = new Audio(SELECTION_SOUND_SRC);
    const confirmSound = new Audio(CONFIRM_SOUND_SRC);
    const torielVoice = new Audio('sounds/toriel_voice.mp3');
    selectionSound.volume = 0.65;
    confirmSound.volume = 0.75;
    torielVoice.volume = 0.75;
    let isIndexDialogueTyping = false;

    function playSound(sound) {
        sound.currentTime = 0;
        sound.play().catch(function() {});
    }

    const currentPageName = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (BACKGROUND_MUSIC_SRC && currentPageName !== 'mettatonquiz.html') {
        const backgroundMusic = new Audio(BACKGROUND_MUSIC_SRC);
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.35;
        const savedPosition = Number.parseFloat(localStorage.getItem(BACKGROUND_MUSIC_POSITION_KEY));

        backgroundMusic.addEventListener('loadedmetadata', function() {
            if (currentPageName === 'index.html') {
                backgroundMusic.currentTime = 0;
            } else if (Number.isFinite(savedPosition) && savedPosition >= 0 && savedPosition < backgroundMusic.duration) {
                backgroundMusic.currentTime = savedPosition;
            }
        });

        function startBackgroundMusic() {
            backgroundMusic.play().catch(function() {});
        }

        function saveBackgroundMusicPosition() {
            localStorage.setItem(BACKGROUND_MUSIC_POSITION_KEY, String(backgroundMusic.currentTime));
        }

        document.addEventListener('pointerdown', startBackgroundMusic, { once: true });
        document.addEventListener('keydown', startBackgroundMusic, { once: true });
        window.addEventListener('pagehide', saveBackgroundMusicPosition);
        startBackgroundMusic();
    }

    const indexDialogues = [
        '* Bienvenido. Aquí estudiar también puede ser una aventura.',
        '* ¿Qué tema quieres explorar hoy?',
        '* Cada pregunta es una oportunidad para aprender algo nuevo.',
        '* No pasa nada si te equivocas. Inténtalo otra vez.',
        '* Tu curiosidad es una gran herramienta para estudiar.',
        '* El próximo reto está listo. Tú puedes con él.'
    ];
    const isIndexPage = (window.location.pathname.split('/').pop() || 'index.html') === 'index.html';
    const indexDialogue = document.querySelector('[data-sound="sans"]');

    if (isIndexPage && indexDialogue && Math.random() < 0.7) {
        indexDialogue.textContent = indexDialogues[Math.floor(Math.random() * indexDialogues.length)];
    }

    function startIndexDialogueVoice() {
        if (!isIndexDialogueTyping || !torielVoice.paused) return;
        torielVoice.currentTime = 0;
        torielVoice.play().catch(function() {});
    }

    function stopIndexDialogueVoice() {
        torielVoice.pause();
        torielVoice.currentTime = 0;
        isIndexDialogueTyping = false;
    }

    if (isIndexPage && indexDialogue) {
        document.addEventListener('pointerdown', startIndexDialogueVoice);
        document.addEventListener('keydown', startIndexDialogueVoice);
    }

    document.querySelectorAll('[data-carousel]').forEach(function(carousel) {
        const slides = Array.from(carousel.querySelectorAll('.slide'));
        const dotsContainer = carousel.querySelector('[data-carousel-dots]');
        const previousButton = carousel.querySelector('[data-carousel-previous]');
        const nextButton = carousel.querySelector('[data-carousel-next]');
        let activeSlide = 0;
        let autoAdvance;

        function showSlide(slideIndex) {
            activeSlide = (slideIndex + slides.length) % slides.length;
            slides.forEach(function(slide, index) {
                slide.classList.toggle('is-active', index === activeSlide);
            });
            Array.from(dotsContainer.children).forEach(function(dot, index) {
                dot.classList.toggle('is-active', index === activeSlide);
                dot.setAttribute('aria-current', index === activeSlide ? 'true' : 'false');
            });
        }

        function restartAutoAdvance() {
            window.clearInterval(autoAdvance);
            autoAdvance = window.setInterval(function() {
                showSlide(activeSlide + 1);
            }, 5000);
        }

        slides.forEach(function(slide, index) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', `Mostrar imagen ${index + 1}`);
            dot.addEventListener('click', function() {
                showSlide(index);
                restartAutoAdvance();
            });
            dotsContainer.appendChild(dot);
        });

        previousButton.addEventListener('click', function() {
            showSlide(activeSlide - 1);
            restartAutoAdvance();
        });
        nextButton.addEventListener('click', function() {
            showSlide(activeSlide + 1);
            restartAutoAdvance();
        });
        carousel.addEventListener('mouseenter', function() {
            window.clearInterval(autoAdvance);
        });
        carousel.addEventListener('mouseleave', restartAutoAdvance);
        showSlide(0);
        restartAutoAdvance();
    });
    
    // Seleccionar TODOS los elementos con clase .dialogue
    const dialogueElements = document.querySelectorAll('.dialogue');
    
    // Aplicar animación a cada uno
    dialogueElements.forEach(function(element) {
        const originalText = element.textContent; // Guardar el texto original
        element.textContent = ''; // Limpiar el contenido
        
        // Iniciar la animación de escritura
        typeWriter(element, originalText, 50);
    });
    
    // Función de escritura
    function typeWriter(element, text, speed = 50) {
        let i = 0;
        const isIndexDialogue = isIndexPage && element === indexDialogue;
        element.style.visibility = 'visible'; // Asegurar que sea visible

        if (isIndexDialogue) {
            isIndexDialogueTyping = true;
            torielVoice.currentTime = 0;
            torielVoice.play().catch(function() {});
        }
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (isIndexDialogue) {
                stopIndexDialogueVoice();
            }
        }
        type();
    }

    const menuLinks = Array.from(document.querySelectorAll('.menu > .logo-container > ul > li > a'));
    const menuItems = menuLinks.map(function(link) {
        return link.parentElement;
    });
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.menu .submenu ul a').forEach(function(link) {
        if ((link.getAttribute('href') || '').toLowerCase() === currentPage) {
            link.parentElement.classList.add('menu-current-page');
        }
    });
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.type = 'button';
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
    document.querySelector('.menu').prepend(menuToggle);

    const menuDialog = document.createElement('section');
    menuDialog.className = 'menu-dialogue';
    menuDialog.setAttribute('aria-live', 'polite');
    menuDialog.innerHTML = '<strong class="menu-dialogue-speaker">♥ METTATON</strong><p class="menu-dialogue-message"></p><ul class="menu-dialogue-options"></ul>';
    document.querySelector('.menu').after(menuDialog);
    const menuDialogueMessage = menuDialog.querySelector('.menu-dialogue-message');
    const menuDialogueOptions = menuDialog.querySelector('.menu-dialogue-options');
    let selectedMenuIndex = 0;
    let selectedSubmenuIndex = 0;
    let activeSubmenuLinks = [];

    function closeSubmenu() {
        activeSubmenuLinks = [];
        menuDialog.classList.remove('active');
        menuDialogueOptions.innerHTML = '';
    }

    function openSubmenu(menuItem) {
        activeSubmenuLinks = Array.from(menuItem.querySelectorAll(':scope > ul > li > a')).filter(function(link) {
            return !link.parentElement.classList.contains('menu-current-page');
        });
        if (!activeSubmenuLinks.length) return false;
        selectedSubmenuIndex = 0;
        menuDialogueMessage.textContent = `${menuItem.querySelector(':scope > a').textContent.trim()} · SELECCIONA UNA OPCIÓN`;
        menuDialogueOptions.innerHTML = '';
        activeSubmenuLinks.forEach(function(link, linkIndex) {
            const option = document.createElement('li');
            option.textContent = link.textContent.trim();
            option.tabIndex = 0;
            option.addEventListener('click', function() {
                playSound(confirmSound);
                window.location.href = link.href;
            });
            menuDialogueOptions.appendChild(option);
            option.classList.toggle('menu-option-selected', linkIndex === selectedSubmenuIndex);
        });
        menuDialog.classList.add('active');
        menuDialogueOptions.children[0].focus();
        return true;
    }

    function selectSubmenuOption(index, playSelectionSound) {
        if (!activeSubmenuLinks.length) return;
        selectedSubmenuIndex = (index + activeSubmenuLinks.length) % activeSubmenuLinks.length;
        Array.from(menuDialogueOptions.children).forEach(function(option, optionIndex) {
            option.classList.toggle('menu-option-selected', optionIndex === selectedSubmenuIndex);
        });
        if (playSelectionSound) playSound(selectionSound);
        menuDialogueOptions.children[selectedSubmenuIndex].focus();
    }

    function selectMenuLink(index, playSelectionSound) {
        if (!menuLinks.length) return;
        selectedMenuIndex = (index + menuLinks.length) % menuLinks.length;
        menuLinks.forEach(function(link, linkIndex) {
            link.classList.toggle('menu-selected', linkIndex === selectedMenuIndex);
        });
        if (playSelectionSound) playSound(selectionSound);
        menuLinks[selectedMenuIndex].focus();
    }

    if (menuLinks.length) {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const currentIndex = menuLinks.findIndex(function(link) {
            return link.getAttribute('href') === currentPath;
        });
        selectedMenuIndex = currentIndex >= 0 ? currentIndex : 0;
        selectMenuLink(selectedMenuIndex, false);

        menuItems.forEach(function(menuItem) {
            const link = menuItem.querySelector(':scope > a');
            if (menuItem.querySelector(':scope > ul')) {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    playSound(confirmSound);
                    openSubmenu(menuItem);
                });
            } else {
                link.addEventListener('click', function() {
                    playSound(confirmSound);
                });
            }
        });

        menuToggle.addEventListener('click', function() {
            const isOpen = document.querySelector('.menu').classList.toggle('menu-open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
        });

        document.addEventListener('keydown', function(event) {
            if (activeSubmenuLinks.length) {
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    event.preventDefault();
                    selectSubmenuOption(selectedSubmenuIndex + 1, true);
                } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    selectSubmenuOption(selectedSubmenuIndex - 1, true);
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    closeSubmenu();
                    menuLinks[selectedMenuIndex].focus();
                } else if (event.key === 'Enter' || event.key.toLowerCase() === 'z') {
                    event.preventDefault();
                    menuDialogueOptions.children[selectedSubmenuIndex].click();
                }
                return;
            }

            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                selectMenuLink(selectedMenuIndex + 1, true);
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                selectMenuLink(selectedMenuIndex - 1, true);
            } else if (event.key === 'Enter' || event.key.toLowerCase() === 'z') {
                if (document.activeElement && document.activeElement.closest('.menu')) {
                    event.preventDefault();
                    if (!openSubmenu(menuItems[selectedMenuIndex])) {
                        menuLinks[selectedMenuIndex].click();
                    } else {
                        playSound(confirmSound);
                    }
                }
            }
        });
    }
});