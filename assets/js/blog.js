/* Renders blog cards and single posts from window.SAK_POSTS. Load after posts.js and before main.js. */
(() => {
    const P = window.SAK_POSTS || [], $ = s => document.querySelector(s);
    const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const catName = { Content: 'Content & marketing', Web: 'Web & apps', Data: 'Data solutions' };
    const url = p => 'blog-post.html?p=' + encodeURIComponent(p.slug);
    const card = (p, filterable) => `
        <div class="col-md-6 col-lg-4${filterable ? ' sv' : ''}" ${filterable ? `data-c="${p.cat}"` : 'data-r'}>
            <a class="bc" href="${url(p)}">
                <div class="bimg bimg-${p.cat}"><i class="bi ${p.icon}"></i><span class="bcat">${catName[p.cat] || p.cat}</span></div>
                <div class="bb">
                    <div class="bmeta"><i class="bi bi-calendar3"></i> ${fmt(p.date)} <span>·</span> ${p.read} min read</div>
                    <h3>${p.title}</h3>
                    <p>${p.excerpt}</p>
                    <b>Read article <i class="bi bi-arrow-up-right"></i></b>
                </div>
            </a>
        </div>`;

    /* blog listing page */
    const feat = $('#blog-feat'), grid = $('#blog-grid');
    if (feat && P.length) {
        const p = P[0];
        feat.innerHTML = `
            <a class="bfeat" href="${url(p)}">
                <div class="bimg bimg-${p.cat}"><i class="bi ${p.icon}"></i><span class="bcat">Latest · ${catName[p.cat]}</span></div>
                <div class="bb">
                    <div class="bmeta"><i class="bi bi-calendar3"></i> ${fmt(p.date)} <span>·</span> ${p.read} min read</div>
                    <h2>${p.title}</h2>
                    <p>${p.excerpt}</p>
                    <span class="btn-sak dk">Read the article <i class="bi bi-arrow-up-right"></i></span>
                </div>
            </a>`;
    }
    if (grid) grid.innerHTML = P.slice(1).map(p => card(p, true)).join('');

    /* home page teaser */
    const latest = $('#blog-latest');
    if (latest) latest.innerHTML = P.slice(0, 3).map(p => card(p, false)).join('');

    /* single post page */
    const body = $('#p-body');
    if (body) {
        const slug = new URLSearchParams(location.search).get('p');
        const i = P.findIndex(x => x.slug === slug), p = P[i];
        if (!p) {
            $('#p-title').innerHTML = '<span class="ln"><span>Post not found.</span></span>';
            $('#p-meta').textContent = '';
            body.innerHTML = '<p>Sorry, we couldn\'t find that article. It may have been moved or renamed.</p><p><a class="btn-sak dk" href="blog.html">Back to the blog <i class="bi bi-arrow-right"></i></a></p>';
            const aside = $('#p-aside'); aside && aside.remove();
            return;
        }
        document.title = p.title + ' — SAK Blog';
        const md = document.querySelector('meta[name=description]'); md && md.setAttribute('content', p.excerpt);
        $('#p-crumb').textContent = p.title;
        $('#p-cat').innerHTML = `<i class="bi ${p.icon}"></i> ${catName[p.cat]}`;
        $('#p-title').innerHTML = `<span class="ln"><span>${p.title}</span></span>`;
        $('#p-meta').innerHTML = `<i class="bi bi-calendar3"></i> ${fmt(p.date)} <span>·</span> <i class="bi bi-clock"></i> ${p.read} min read <span>·</span> SAK team`;
        body.innerHTML = p.body;

        /* share */
        const here = encodeURIComponent(location.href), t = encodeURIComponent(p.title);
        $('#sh-wa').href = `https://wa.me/?text=${t}%20${here}`;
        $('#sh-in').href = `https://www.linkedin.com/sharing/share-offsite/?url=${here}`;
        $('#sh-x').href = `https://twitter.com/intent/tweet?text=${t}&url=${here}`;
        const cp = $('#sh-copy');
        cp && cp.addEventListener('click', () => {
            const done = () => { cp.innerHTML = '<i class="bi bi-check2"></i>'; setTimeout(() => cp.innerHTML = '<i class="bi bi-link-45deg"></i>', 1800) };
            navigator.clipboard ? navigator.clipboard.writeText(location.href).then(done, done) : done();
        });

        /* prev / next + related */
        const nav = $('#p-nav');
        if (nav) {
            const newer = P[i - 1], older = P[i + 1];
            nav.innerHTML = (older ? `<a class="pn" href="${url(older)}"><small><i class="bi bi-arrow-left"></i> Previous</small><b>${older.title}</b></a>` : '<span></span>') +
                (newer ? `<a class="pn r" href="${url(newer)}"><small>Next <i class="bi bi-arrow-right"></i></small><b>${newer.title}</b></a>` : '<span></span>');
        }
        const rel = $('#p-related');
        if (rel) {
            const list = P.filter(x => x !== p && x.cat === p.cat).concat(P.filter(x => x !== p && x.cat !== p.cat)).slice(0, 3);
            rel.innerHTML = list.map(x => card(x, false)).join('');
        }
    }
})();
