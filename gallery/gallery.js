/* Photo Gallery — static build for GitHub Pages.
   Replaces the PHP of "Free PHP Gallery" with a hash router + lightbox.
   Data comes from manifest.json, regenerate it with:
     node tools/generate-manifest.mjs                                            */

(function () {
  'use strict';

  // Resolved against this script's own URL, so the gallery keeps working if
  // index.html is ever moved or renamed.
  var BASE = new URL('manifest.json', document.currentScript.src).href;

  var elContent = document.getElementById('content');
  var elCrumb = document.getElementById('breadcrumb');
  var elLightbox = document.getElementById('lightbox');
  var elImage = document.getElementById('lightbox_image');
  var elTitle = document.getElementById('lightbox_title');
  var elCounter = document.getElementById('lightbox_counter');
  var elFullsize = document.getElementById('lightbox_fullsize');
  var elStrip = document.getElementById('lightbox_strip');

  var manifest = null;
  var photos = [];      // photos of the category currently open
  var index = 0;        // position within `photos`
  var stripThumbs = [];

  /* ---------------------------------------------------------------- routing */

  // "#/<categoryIndex>" -> index view
  function parseHash() {
    var m = /^#\/(\d+)$/.exec(location.hash);
    return m ? parseInt(m[1], 10) : null;
  }

  function render() {
    var catIndex = parseHash();

    if (catIndex === null || !manifest.categories[catIndex]) {
      renderIndex();
      return;
    }
    renderCategory(manifest.categories[catIndex], catIndex);
  }

  function navigate(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  /* ------------------------------------------------------------ index view */

  function renderIndex() {
    elCrumb.textContent = '> root';

    var frag = document.createDocumentFragment();
    manifest.categories.forEach(function (cat, i) {
      var span = document.createElement('span');
      span.className = 'category_thumbnail_span';

      var link = document.createElement('a');
      link.className = 'category_thumbnail_image';
      link.href = '#/' + i;
      link.title = cat.title;
      link.setAttribute('aria-label', cat.title + ', ' + cat.count + ' photos');

      var img = document.createElement('img');
      img.src = cat.cover;
      img.alt = cat.title;
      img.width = 160;
      img.height = 100;
      img.loading = 'lazy';
      link.appendChild(img);

      var label = document.createElement('a');
      label.className = 'category_thumbnail_title';
      label.href = '#/' + i;
      label.textContent = cat.title + ' (' + cat.count + ')';

      span.appendChild(link);
      span.appendChild(label);
      frag.appendChild(span);
    });

    elContent.textContent = '';
    elContent.appendChild(frag);
  }

  /* --------------------------------------------------------- category view */

  function renderCategory(cat, catIndex) {
    elCrumb.textContent = '';

    var rootLink = document.createElement('a');
    rootLink.href = '#/';
    rootLink.textContent = '> root';
    elCrumb.appendChild(rootLink);
    elCrumb.appendChild(document.createTextNode('> ' + cat.title));

    var back = document.createElement('a');
    back.className = 'liquid_button';
    back.href = '#/';
    back.textContent = 'All categories';
    back.style.marginBottom = '10px';

    var grid = document.createElement('div');
    grid.className = 'photo_grid';

    cat.photos.forEach(function (photo, i) {
      var img = document.createElement('img');
      img.className = 'photo_thumb';
      img.src = photo.thumb;
      img.alt = photo.name;
      img.title = photo.name;
      img.width = 160;
      img.height = 100;
      img.loading = 'lazy';
      img.tabIndex = 0;
      img.setAttribute('role', 'button');

      function open() {
        photos = cat.photos;
        show(i);
      }
      img.addEventListener('click', open);
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });

      grid.appendChild(img);
    });

    elContent.textContent = '';
    elContent.appendChild(back);
    elContent.appendChild(grid);
    elContent.dataset.cat = catIndex;
  }

  /* ---------------------------------------------------------------- lightbox */

  function show(i) {
    if (i >= photos.length) i = 0;
    if (i < 0) i = photos.length - 1;
    index = i;

    var photo = photos[i];

    elImage.src = photo.display;
    elImage.alt = photo.name;
    elTitle.textContent = photo.name;
    elCounter.textContent = i + 1 + ' / ' + photos.length;
    elFullsize.href = photo.full;

    elStrip.textContent = '';
    stripThumbs = photos.map(function (p, n) {
      var img = document.createElement('img');
      img.src = p.thumb;
      img.alt = p.name;
      img.title = p.name;
      img.loading = 'lazy';
      img.addEventListener('click', function () { show(n); });
      elStrip.appendChild(img);
      return img;
    });

    elLightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    highlight();
  }

  function highlight() {
    stripThumbs.forEach(function (img, n) {
      var active = n === index;
      img.classList.toggle('is-active', active);
      if (active && img.scrollIntoView) {
        img.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    });
  }

  function close() {
    elLightbox.hidden = true;
    elImage.removeAttribute('src');
    document.body.style.overflow = '';
    stripThumbs = [];
    elStrip.textContent = '';
  }

  function step(delta) {
    show(index + delta);
  }

  /* ------------------------------------------------------------------ wiring */

  document.getElementById('lightbox_close').addEventListener('click', close);
  document.getElementById('lightbox_prev').addEventListener('click', function () { step(-1); });
  document.getElementById('lightbox_next').addEventListener('click', function () { step(1); });

  // Click the image itself for next, click the backdrop to close.
  elImage.addEventListener('click', function (e) {
    e.stopPropagation();
    step(1);
  });
  document.getElementById('lightbox_stage').addEventListener('click', close);

  elFullsize.addEventListener('click', function (e) {
    e.stopPropagation();
  });

  document.addEventListener('keydown', function (e) {
    if (elLightbox.hidden) return;
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  window.addEventListener('hashchange', render);

  /* -------------------------------------------------------------------- boot */

  fetch(BASE)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + BASE);
      return res.json();
    })
    .then(function (data) {
      manifest = data;
      render();
    })
    .catch(function (err) {
      elCrumb.textContent = '> root';
      var msg = document.createElement('p');
      msg.className = 'message_error';
      msg.textContent = 'Could not load the photo list (' + err.message + '). ' +
        'Regenerate it with: node tools/generate-manifest.mjs';
      elContent.textContent = '';
      elContent.appendChild(msg);
    });
})();
