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

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function saveChoice(choice) {
    try { localStorage.setItem(KEY, choice); } catch (e) {}
  }

  function showInsects(show) {
    root.classList.toggle('show-insects', show);
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
