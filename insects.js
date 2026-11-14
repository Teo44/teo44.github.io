// Asks visitors whether they want to see insect close-ups. Insect images carry
// data-src instead of src, so they are only downloaded after the visitor agrees.
// The answer is remembered in localStorage ("yes" or "no").
// On the front page it also lays out the gallery rows, sorted by date (as in the
// HTML), by colour (lightest first) or by location; that choice is remembered too.
(function () {
  var KEY = 'showInsects';
  var SORT_KEY = 'galleryOrder';
  var root = document.documentElement;
  var dialog = document.getElementById('insect-dialog');
  var toggle = document.getElementById('insect-toggle');
  var sortSelect = document.getElementById('sort-select');
  // Set on insect photo pages: where to go when the visitor declines.
  var declineUrl = dialog.dataset.declineUrl;
  var gallery = document.querySelector('.gallery');
  // Every gallery photo in page order, captured before any re-layout.
  var photos = gallery ? Array.prototype.slice.call(gallery.querySelectorAll('a')) : [];
  var PER_ROW = 3;

  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  // Comparators for the non-default sorts; "date" keeps the HTML order. Sorting
  // is stable, so photos from the same location stay in date order.
  var SORTS = {
    colour: function (a, b) { return b.dataset.lightness - a.dataset.lightness; },
    location: function (a, b) { return a.dataset.location.localeCompare(b.dataset.location); }
  };
  var sortMode = load(SORT_KEY);
  if (!SORTS[sortMode]) sortMode = 'date';

  // Rebuilds the gallery rows from the visible photos only, so hiding insects
  // doesn't leave rows with gaps.
  function layoutGallery() {
    if (!gallery) return;
    var show = root.classList.contains('show-insects');
    var ordered = SORTS[sortMode] ? photos.slice().sort(SORTS[sortMode]) : photos;
    var visible = ordered.filter(function (a) {
      return show || !a.hasAttribute('data-insect');
    });
    gallery.querySelectorAll('.gallery-row').forEach(function (row) {
      row.remove();
    });
    for (var i = 0; i < visible.length; i += PER_ROW) {
      var row = document.createElement('div');
      row.className = 'gallery-row';
      visible.slice(i, i + PER_ROW).forEach(function (a) {
        row.appendChild(a);
      });
      gallery.appendChild(row);
    }
  }

  function showInsects(show) {
    root.classList.toggle('show-insects', show);
    layoutGallery();
    if (show) {
      document.querySelectorAll('img[data-src]').forEach(function (img) {
        img.src = img.dataset.src;
      });
    }
    if (toggle) {
      toggle.textContent = show ? 'Hide insect close-ups' : 'Show insect close-ups';
      toggle.hidden = false;
    }
  }

  if (sortSelect) {
    sortSelect.value = sortMode;
    sortSelect.hidden = false;
    sortSelect.addEventListener('change', function () {
      sortMode = sortSelect.value;
      save(SORT_KEY, sortMode);
      layoutGallery();
    });
  }

  var choice = load(KEY);
  if (choice === 'yes') {
    showInsects(true);
  } else if (choice === 'no' && !declineUrl) {
    showInsects(false);
  } else {
    dialog.addEventListener('close', function () {
      // returnValue is empty if the dialog was dismissed with Esc: treat it as
      // "no" for now, but don't remember it so the visitor is asked again.
      var answer = dialog.returnValue;
      if (answer) save(KEY, answer);
      if (answer === 'yes') {
        showInsects(true);
      } else if (declineUrl) {
        location.href = declineUrl;
      } else {
        showInsects(false);
      }
    });
    layoutGallery();
    dialog.showModal();
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var show = !root.classList.contains('show-insects');
      save(KEY, show ? 'yes' : 'no');
      showInsects(show);
    });
  }
})();
