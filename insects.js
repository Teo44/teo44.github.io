// Asks visitors whether they want to see insect close-ups. Insect images carry
// data-src instead of src, so they are only downloaded after the visitor agrees.
// The answer is remembered in localStorage ("yes" or "no").
(function () {
  var KEY = 'showInsects';
  var root = document.documentElement;
  var dialog = document.getElementById('insect-dialog');
  var toggle = document.getElementById('insect-toggle');
  // Set on insect photo pages: where to go when the visitor declines.
  var declineUrl = dialog.dataset.declineUrl;
  var gallery = document.querySelector('.gallery');
  // Every gallery photo in page order, captured before any re-layout.
  var photos = gallery ? Array.prototype.slice.call(gallery.querySelectorAll('a')) : [];
  var PER_ROW = 3;

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function saveChoice(choice) {
    try { localStorage.setItem(KEY, choice); } catch (e) {}
  }

  // Rebuilds the gallery rows from the visible photos only, so hiding insects
  // doesn't leave rows with gaps.
  function layoutGallery() {
    if (!gallery) return;
    var show = root.classList.contains('show-insects');
    var visible = photos.filter(function (a) {
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

  var choice = getChoice();
  if (choice === 'yes') {
    showInsects(true);
  } else if (choice === 'no' && !declineUrl) {
    showInsects(false);
  } else {
    dialog.addEventListener('close', function () {
      // returnValue is empty if the dialog was dismissed with Esc: treat it as
      // "no" for now, but don't remember it so the visitor is asked again.
      var answer = dialog.returnValue;
      if (answer) saveChoice(answer);
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
      saveChoice(show ? 'yes' : 'no');
      showInsects(show);
    });
  }
})();
