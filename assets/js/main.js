/* ============================================================
   Santiago Lope — Interacciones globales e integración con WhatsApp
   ============================================================ */
(function () {
    'use strict';

    /* ---------- Menú móvil ---------- */
    document.querySelectorAll('[data-menu-btn]').forEach(function (btn) {
        var menu = document.getElementById(btn.getAttribute('data-menu-btn'));
        if (!menu) return;
        btn.addEventListener('click', function () {
            menu.classList.toggle('hidden');
            btn.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
        });
    });

    /* ---------- Revelado de elementos al hacer scroll ---------- */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- Sombra del header al hacer scroll ---------- */
    var header = document.querySelector('header');
    if (header) {
        var onScroll = function () {
            header.classList.toggle('shadow-xl', window.scrollY > 10);
            header.classList.toggle('shadow-primary/10', window.scrollY > 10);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---------- Envío del Formulario vía WhatsApp ---------- */
    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
        var statusDiv = document.getElementById('form-status');

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var nombre = document.getElementById('nombre').value.trim();
            var email = document.getElementById('email').value.trim();
            var servicio = document.getElementById('servicio').value;
            var mensaje = document.getElementById('mensaje').value.trim();

            if (!nombre || !email || !mensaje) {
                if (statusDiv) {
                    statusDiv.classList.remove('hidden', 'bg-emerald-900/50', 'text-emerald-300', 'border-emerald-700');
                    statusDiv.classList.add('border', 'bg-red-900/50', 'text-red-300', 'border-red-700');
                    statusDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation mr-2"></i>Por favor, completa todos los campos requeridos.';
                }
                return;
            }

            var text = "*Consulta desde el Sitio Web*\n\n" +
                "👤 *Nombre:* " + nombre + "\n" +
                "✉️ *Correo:* " + email + "\n" +
                "📌 *Área de interés:* " + servicio + "\n\n" +
                "📝 *Mensaje:*\n" + mensaje;

            var phone = "51937497557"; // Número oficial de Santiago Lope
            var waUrl = "https://api.whatsapp.com/send?phone=" + phone + "&text=" + encodeURIComponent(text);

            if (statusDiv) {
                statusDiv.classList.remove('hidden', 'bg-red-900/50', 'text-red-300', 'border-red-700');
                statusDiv.classList.add('border', 'bg-emerald-900/50', 'text-emerald-300', 'border-emerald-700');
                statusDiv.innerHTML = '<i class="fa-brands fa-whatsapp mr-2"></i>Redirigiendo a WhatsApp con tu mensaje formateado...';
            }

            // Abrir WhatsApp en pestaña nueva
            window.open(waUrl, '_blank');

            // Resetear el formulario después del envío
            setTimeout(function () {
                contactForm.reset();
            }, 1000);
        });
    }
})();
