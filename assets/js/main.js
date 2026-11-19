/* SAK Digital Media Services — shared site script */
(() => {
    const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const rm = matchMedia('(prefers-reduced-motion:reduce)').matches, fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
    const EMAIL = 'support@sakdigitalmediaservice.com';

    /* active menu item */
    const page = document.body.dataset.page;
    $$('#nl .nav-link').forEach(a => { if (a.dataset.page === page) { a.classList.add('active'); a.setAttribute('aria-current', 'page') } });

    /* year */
    $$('[data-year]').forEach(e => e.textContent = new Date().getFullYear());

    /* marquee duplicate */
    const mt = $('.mt'); if (mt) mt.innerHTML += mt.innerHTML;

    /* about statement word split */
    const st = $('.st'); if (st) st.innerHTML = st.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');

    /* nav */
    const nb = $('.nb'), onS = () => nb.classList.toggle('sc', scrollY > 40); onS(); addEventListener('scroll', onS, { passive: true });
    $$('#nl a').forEach(a => a.addEventListener('click', () => { const c = window.bootstrap && bootstrap.Collapse.getInstance($('#nl')); c && c.hide() }));

    /* card spotlight */
    $$('.cs').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--x', e.clientX - r.left + 'px'); c.style.setProperty('--y', e.clientY - r.top + 'px') }));

    /* service filter */
    const sv = $$('.sv'), g = window.gsap && !rm;
    $$('[data-f]').forEach(b => b.addEventListener('click', () => {
        $$('[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b));
        const f = b.dataset.f, v = [];
        sv.forEach(e => { const s = f === 'All' || e.dataset.c === f; e.classList.toggle('d-none', !s); s && v.push(e) });
        g && gsap.fromTo(v, { y: 40, opacity: 0, scale: .94 }, { y: 0, opacity: 1, scale: 1, duration: .55, stagger: .06, ease: 'power3.out', clearProps: 'transform' });
        window.ScrollTrigger && ScrollTrigger.refresh();
    }));

    /* same-page service cards (index): pre-select the service in the contact form */
    $$('[data-svc]').forEach(a => a.addEventListener('click', () => {
        const sel = $('#contact select[name=service]'), msg = $('#contact textarea[name=message]');
        if (sel) { sel.value = a.dataset.svc; sel.classList.remove('is-invalid') }
        else if (msg && !msg.value.trim()) msg.value = `I'm interested in: ${a.dataset.svc}\n\n`;
    }));

    /* service pre-select from URL (?service=Web%20design) */
    const qs = new URLSearchParams(location.search).get('service');

    /* contact forms */
    $$('form[data-contact]').forEach(f => {
        if (qs) {
            const sel = $('select[name=service]', f), msg = $('textarea[name=message]', f);
            if (sel && [...sel.options].some(o => o.value === qs)) sel.value = qs;
            else if (!sel && msg && !msg.value.trim()) msg.value = `I'm interested in: ${qs}\n\n`;
        }
        const check = el => {
            let ok = el.checkValidity();
            if (ok && el.type === 'tel' && el.value.trim()) ok = /^[+\d][\d\s()-]{6,}$/.test(el.value.trim());
            el.classList.toggle('is-invalid', !ok);
            return ok;
        };
        $$('input,select,textarea', f).forEach(el => {
            if (el.type === 'radio' || el.type === 'checkbox') return;
            el.addEventListener('blur', () => el.value && check(el));
            el.addEventListener('input', () => el.classList.contains('is-invalid') && check(el));
        });
        f.addEventListener('submit', e => {
            e.preventDefault();
            if (f.website && f.website.value) return; /* honeypot */
            const fields = $$('input:not([type=radio]):not([type=checkbox]):not([name=website]),select,textarea', f);
            const bad = fields.filter(el => !check(el));
            const err = $('.form-err', f);
            if (bad.length) { err && (err.hidden = false); bad[0].focus(); return }
            err && (err.hidden = true);
            const d = new FormData(f), v = k => (d.get(k) || '').toString().trim(), has = k => !!f.querySelector(`[name=${k}]`);
            const lines = [];
            const add = (label, key, val) => has(key) && lines.push(label + ': ' + ((val !== undefined ? val : v(key)) || '-'));
            add('Full Name', 'name');
            add('Email', 'email');
            add('Date', 'date');
            add('Phone', 'phone', v('phone') ? (v('code') ? v('code') + ' ' : '') + v('phone') : '');
            add('Company', 'company');
            add('Service', 'service');
            add('Budget', 'budget');
            add('Rating', 'rating', v('rating') ? v('rating') + '/5' : '');
            add('SMS consent', 'sms', v('sms') ? 'Yes' : 'No');
            lines.push('', v('message'));
            const subject = (f.dataset.subject || 'Project enquiry') + (v('service') ? ' — ' + v('service') : '') + ' — ' + v('name');
            location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
            const wrap = f.closest('.cbox'); wrap && wrap.classList.add('sent');
            const ok = wrap && $('.form-ok', wrap); ok && ok.focus();
            g && ok && gsap.from(ok, { y: 30, opacity: 0, duration: .6, ease: 'power3.out' });
        });
        const again = f.closest('.cbox') && $('[data-again]', f.closest('.cbox'));
        again && again.addEventListener('click', () => { f.reset(); f.closest('.cbox').classList.remove('sent'); f.querySelector('input').focus() });
    });

    /* newsletter (opens the visitor's email app with a subscribe request) */
    $$('form[data-newsletter]').forEach(f => f.addEventListener('submit', e => {
        e.preventDefault();
        const em = f.querySelector('input[type=email]'), msg = f.parentElement.querySelector('[data-nl-msg]');
        if (!em.checkValidity() || !em.value.trim()) { msg && (msg.textContent = 'Please enter a valid email address.'); em.focus(); return }
        location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Newsletter subscription')}&body=${encodeURIComponent('Please add me to the SAK newsletter: ' + em.value.trim())}`;
        msg && (msg.textContent = 'Thanks! Your email app has opened — just press send to confirm.');
        f.reset();
    }));

    /* ---------- motion ---------- */
    const pre = $('.pre');
    if (!g) { pre && pre.remove(); $$('.st .w').forEach(w => w.style.opacity = 1); return }
    gsap.registerPlugin(ScrollTrigger);

    /* intro */
    const tl = gsap.timeline();
    if (pre) {
        /* show the preloader only once per browser session */
        let seen = false;
        try { seen = !!sessionStorage.getItem('sak-pre'); sessionStorage.setItem('sak-pre', '1') } catch (e) { }
        if (seen) pre.remove();
        else tl.to(pre, { yPercent: -100, duration: .9, ease: 'power4.inOut', delay: .7, onComplete: () => pre.remove() });
    }
    tl.from('.hero .ln>span,.ph .ln>span', { yPercent: 115, duration: 1.1, stagger: .14, ease: 'power4.out' }, pre && document.contains(pre) ? '-=.35' : 0)
        .from('[data-h]', { y: 30, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out' }, '-=.7');
    if ($('.cube')) {
        tl.from('.cube,.hero .chip', { scale: .6, opacity: 0, duration: 1, stagger: .12, ease: 'back.out(1.6)' }, '-=1.1');
        gsap.to('.cube', { y: -14, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }
    if ($('.chip')) gsap.to('.chip', { y: -12, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: .35 });
    if ($('.o1')) gsap.to('.o1', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.hero,.ph', scrub: 1, start: 'top top', end: 'bottom top' } });
    gsap.to('.bar', { scaleX: 1, ease: 'none', scrollTrigger: { scrub: .3, start: 0, end: 'max' } });

    /* generic reveal: services cards + anything with data-r */
    const rv = [...sv, ...$$('[data-r]')];
    if (rv.length) {
        gsap.set(rv, { opacity: 0, y: 50 });
        ScrollTrigger.batch(rv, { start: 'top 92%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .7, stagger: .08, ease: 'power3.out', clearProps: 'transform' }) });
    }
    if (st) gsap.to('.st .w', { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.st', start: 'top 80%', end: 'bottom 55%', scrub: true } });
    if ($('.pr')) {
        gsap.fromTo('.pline', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.pr', start: 'top 70%', end: 'bottom 70%', scrub: true } });
        gsap.from('.sp', { y: 60, opacity: 0, stagger: .2, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.pr', start: 'top 80%', once: true } });
    }
    if ($('.cta h2')) gsap.from('.cta h2', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta', start: 'top 70%', once: true } });

    /* count-up stats */
    $$('[data-count]').forEach(el => {
        const n = +el.dataset.count, suf = el.dataset.suffix || '', o = { v: 0 };
        el.textContent = '0' + suf;
        gsap.to(o, { v: n, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => el.textContent = Math.round(o.v) + suf });
    });

    /* pointer effects */
    if (fine) {
        const gx = gsap.quickTo('.glow', 'x', { duration: .5 }), gy = gsap.quickTo('.glow', 'y', { duration: .5 });
        addEventListener('pointermove', e => { gx(e.clientX); gy(e.clientY) });
        $$('.mag').forEach(m => {
            m.addEventListener('pointermove', e => { const r = m.getBoundingClientRect(); gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 }) });
            m.addEventListener('pointerleave', () => gsap.to(m, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
        });
    }
})();
