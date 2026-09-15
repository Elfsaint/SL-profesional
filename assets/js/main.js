/* ============================================================
   Santiago Lope — Interacciones globales del sitio
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

    /* ---------- Formularios de demostración (sitio estático) ---------- */
    document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var msg = form.getAttribute('data-demo-message') ||
                '¡Solicitud enviada con éxito! Me pondré en contacto pronto.';
            alert(msg);
            form.reset();
        });
    });
})();
