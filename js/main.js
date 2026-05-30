/**
 * main.js - Ricardo GNV
 * Funcionalidades interactivas: menú, scroll, wizard multi-paso, lazy loading.
 */
(function () {
    'use strict';

    // ============================
    // 1. Menú responsive
    // ============================
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
            navLinks.classList.toggle('active');
        });
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ============================
    // 2. Scroll suave
    // ============================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ============================
    // 3. Wizard multi-paso
    // ============================
    var wizard = document.getElementById('quoteWizard');
    if (wizard) {
        var currentStep = 0;
        var steps = wizard.querySelectorAll('.wizard-step');
        var stepIndicators = wizard.querySelectorAll('.step-indicator');
        var progressFill = document.getElementById('progressFill');
        var prevBtn = document.getElementById('wizardPrev');
        var nextBtn = document.getElementById('wizardNext');
        var submitBtn = document.getElementById('wizardSubmit');
        var formSuccess = document.getElementById('formSuccess');
        var counterEl = document.getElementById('wizardCounter');
        var totalSteps = steps.length;
        var uploadedFiles = [];

        var dropZone = document.getElementById('dropZone');
        var fileInput = document.getElementById('fileInput');
        var filePreview = document.getElementById('filePreview');
        var maxFiles = 5;

        var summaryFields = {
            summaryNombre: 'nombre',
            summaryTelefono: 'telefono',
            summaryCiudad: 'ubicacion',
            summaryCapacidad: 'capacidad',
            summaryEstado: 'estado',
            summaryMarca: 'marca',
            summaryAnio: 'anio'
        };

        function showStep(stepIndex) {
            steps.forEach(function (s, i) {
                s.classList.toggle('active', i === stepIndex);
            });
            stepIndicators.forEach(function (ind, i) {
                ind.classList.toggle('active', i === stepIndex);
                ind.classList.toggle('completed', i < stepIndex);
                ind.setAttribute('aria-current', i === stepIndex ? 'step' : 'false');
            });

            var progress = ((stepIndex + 1) / totalSteps) * 100;
            if (progressFill) progressFill.style.width = progress + '%';

            if (counterEl) counterEl.innerHTML = '<span>Paso <span class="current-step-num">' + (stepIndex + 1) + '</span> de ' + totalSteps + '</span>';

            if (prevBtn) prevBtn.style.display = stepIndex === 0 ? 'none' : 'inline-flex';
            if (nextBtn) {
                nextBtn.style.display = stepIndex === totalSteps - 1 ? 'none' : 'inline-flex';
                if (stepIndex < totalSteps - 1) {
                    nextBtn.innerHTML = 'Siguiente <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
                }
            }
            if (submitBtn) submitBtn.style.display = stepIndex === totalSteps - 1 ? 'inline-flex' : 'none';
            if (prevBtn && stepIndex > 0) {
                prevBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Anterior';
            }

            if (stepIndex === totalSteps - 1) buildSummary();

            // Auto-scroll al wizard
            wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            currentStep = stepIndex;
        }

        function validateStep(stepIndex) {
            var activeStep = steps[stepIndex];
            var inputs = activeStep.querySelectorAll('input[required], select[required], textarea[required]');
            var valid = true;
            inputs.forEach(function (input) {
                if (!input.value.trim()) {
                    input.classList.add('input-error');
                    input.addEventListener('animationend', function () { input.classList.remove('input-error'); }, { once: true });
                    if (!valid) return;
                    input.focus();
                    valid = false;
                } else {
                    input.classList.remove('input-error');
                }
            });
            if (stepIndex === totalSteps - 1) {
                var confirmCheck = activeStep.querySelector('#privacyCheck');
                if (confirmCheck && !confirmCheck.checked) {
                    confirmCheck.parentElement.classList.add('input-error');
                    confirmCheck.addEventListener('animationend', function () { confirmCheck.parentElement.classList.remove('input-error'); }, { once: true });
                    confirmCheck.focus();
                    valid = false;
                }
            }
            if (!valid) shakeElement(activeStep);
            return valid;
        }

        function shakeElement(el) {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = 'shake 0.5s ease';
        }

        function buildSummary() {
            Object.keys(summaryFields).forEach(function (summaryId) {
                var summaryEl = document.getElementById(summaryId);
                var fieldEl = document.getElementById(summaryFields[summaryId]);
                if (summaryEl && fieldEl) {
                    var val = fieldEl.value || '—';
                    if (fieldEl.tagName === 'SELECT') {
                        val = fieldEl.options[fieldEl.selectedIndex].text || '—';
                    }
                    summaryEl.textContent = val;
                }
            });
            var estadoMap = {
                'sin-fisuras': 'Sin fisuras ni grietas',
                'leves-detalles': 'Leves detalles estéticos',
                'no-se': 'No estoy seguro'
            };
            var estadoEl = document.getElementById('summaryEstado');
            var estadoField = document.getElementById('estado');
            if (estadoEl && estadoField) {
                estadoEl.textContent = estadoMap[estadoField.value] || estadoField.value || '—';
            }
            var summaryFotos = document.getElementById('summaryFotos');
            if (summaryFotos) {
                summaryFotos.textContent = uploadedFiles.length > 0
                    ? uploadedFiles.length + ' foto(s) cargada(s)'
                    : 'No se cargaron fotos';
            }
        }

        function goToStep(index) {
            if (index >= 0 && index < totalSteps) showStep(index);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                if (validateStep(currentStep)) goToStep(currentStep + 1);
            });
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', function () { goToStep(currentStep - 1); });
        }

        stepIndicators.forEach(function (ind) {
            ind.addEventListener('click', function () {
                var targetStep = parseInt(ind.getAttribute('data-step'));
                if (targetStep <= currentStep + 1) goToStep(targetStep);
            });
        });

        // Submit
        var quoteWizardForm = wizard.querySelector('form');
        if (quoteWizardForm) {
            quoteWizardForm.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!document.getElementById('privacyCheck').checked) {
                    var pc = document.getElementById('privacyCheck');
                    pc.parentElement.classList.add('input-error');
                    pc.addEventListener('animationend', function () { pc.parentElement.classList.remove('input-error'); }, { once: true });
                    return;
                }
                // Ocultar pasos y mostrar éxito
                steps.forEach(function (s) { s.classList.remove('active'); });
                stepIndicators.forEach(function (ind) { ind.classList.add('completed'); });
                if (progressFill) progressFill.style.width = '100%';
                if (counterEl) counterEl.innerHTML = '<span style="color:var(--color-accent);">&#10003; Completado</span>';
                if (submitBtn) submitBtn.style.display = 'none';
                if (prevBtn) prevBtn.style.display = 'none';
                if (formSuccess) {
                    formSuccess.hidden = false;
                    formSuccess.classList.add('form-success-scene');
                    wizard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }

        // File upload
        if (dropZone && fileInput) {
            ['dragenter', 'dragover'].forEach(function (evt) {
                dropZone.addEventListener(evt, function (e) { e.preventDefault(); dropZone.classList.add('drag-over'); });
            });
            ['dragleave', 'drop'].forEach(function (evt) {
                dropZone.addEventListener(evt, function (e) { e.preventDefault(); dropZone.classList.remove('drag-over'); });
            });
            dropZone.addEventListener('drop', function (e) { handleFiles(e.dataTransfer.files); });
            dropZone.addEventListener('click', function () { fileInput.click(); });
            fileInput.addEventListener('change', function () { handleFiles(fileInput.files); });
        }

        function handleFiles(files) {
            Array.from(files).forEach(function (file) {
                if (uploadedFiles.length >= maxFiles) return;
                if (!file.type.startsWith('image/')) return;
                if (uploadedFiles.some(function (f) { return f.name === file.name && f.size === file.size; })) return;
                uploadedFiles.push(file);
                var reader = new FileReader();
                reader.onload = function (e) {
                    var card = document.createElement('div');
                    card.className = 'file-preview-item';
                    card.innerHTML = '<img src="' + e.target.result + '" alt="Vista previa"><button type="button" class="file-remove" data-name="' + file.name + '" aria-label="Eliminar foto">&times;</button>';
                    card.querySelector('.file-remove').addEventListener('click', function () {
                        uploadedFiles = uploadedFiles.filter(function (f) { return f.name !== file.name; });
                        card.style.animation = 'popIn 0.3s ease reverse forwards';
                        card.addEventListener('animationend', function () { card.remove(); });
                    });
                    filePreview.appendChild(card);
                };
                reader.readAsDataURL(file);
            });
            if (fileInput) fileInput.value = '';
        }

        showStep(0);
    }

    // ============================
    // 4. Lazy loading
    // ============================
    if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img[data-src]').forEach(function (img) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    } else {
        document.querySelectorAll('img[data-src]').forEach(function (img) {
            img.src = img.dataset.src;
        });
    }

    // ============================
    // 5. Navbar scroll
    // ============================
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        });
    }

    // ============================
    // 6. Animación de entrada (Intersection Observer)
    // ============================
    var revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        revealElements.forEach(function (el) { observer.observe(el); });
    } else {
        revealElements.forEach(function (el) { el.classList.add('revealed'); });
    }
})();
