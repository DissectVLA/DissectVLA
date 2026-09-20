/* ==========================================================================
   project.js
   Project-specific behavior on top of the template's static/js/index.js.

   Tabbed video switcher
   ---------------------
   Markup contract:

     <div class="video-tabs">
       <div class="tab-buttons" role="tablist">
         <button class="tab-button is-active" role="tab"
                 data-video="static/videos/foo.mp4"
                 data-label="Foo"
                 data-caption="Optional caption">Foo</button>
         ...
       </div>
       <div class="tab-panel" role="tabpanel">
         <video>...</video>            <!-- optional -->
         <div class="media-placeholder">...</div>   <!-- optional -->
         <p class="tab-caption"></p>   <!-- optional -->
       </div>
     </div>

   Works in both states: if a <video> is present its source is swapped, and if
   the placeholder is still in place its title/hint text is updated instead.
   No changes needed when the real videos are dropped in.
   ========================================================================== */

(function () {
  'use strict';

  function activate(group, button) {
    var buttons = group.querySelectorAll('.tab-button');
    var panel = group.querySelector('.tab-panel');
    if (!panel) return;

    for (var i = 0; i < buttons.length; i++) {
      var isCurrent = buttons[i] === button;
      buttons[i].classList.toggle('is-active', isCurrent);
      buttons[i].setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      buttons[i].setAttribute('tabindex', isCurrent ? '0' : '-1');
    }

    var src = button.getAttribute('data-video');
    var label = button.getAttribute('data-label') || button.textContent.trim();
    var caption = button.getAttribute('data-caption') || label;

    var video = panel.querySelector('video');
    if (video && src) {
      var wasPlaying = !video.paused && !video.ended;
      var source = video.querySelector('source');
      if (source) {
        source.setAttribute('src', src);
      } else {
        video.setAttribute('src', src);
      }
      video.load();
      // Never start playback on its own: only keep going if the visitor had
      // already started the previous clip.
      if (wasPlaying) {
        var resumed = video.play();
        if (resumed && typeof resumed.catch === 'function') {
          resumed.catch(function () {});
        }
      }
    }

    var placeholder = panel.querySelector('.media-placeholder');
    if (placeholder && src) {
      var title = placeholder.querySelector('.placeholder-title');
      var hint = placeholder.querySelector('.placeholder-hint');
      if (title) title.textContent = label + ' rollout';
      if (hint) hint.innerHTML = 'Coming soon &middot; <code>' + src + '</code>';
    }

    var captionEl = panel.querySelector('.tab-caption');
    if (captionEl) captionEl.innerHTML = caption;
  }

  function setupGroup(group) {
    var buttons = group.querySelectorAll('.tab-button');

    for (var i = 0; i < buttons.length; i++) {
      (function (button, index) {
        button.setAttribute('tabindex', button.classList.contains('is-active') ? '0' : '-1');

        button.addEventListener('click', function () {
          activate(group, button);
        });

        // Left/right arrow navigation inside the tab list.
        button.addEventListener('keydown', function (event) {
          var step = 0;
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') step = 1;
          else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') step = -1;
          else return;

          event.preventDefault();
          var next = buttons[(index + step + buttons.length) % buttons.length];
          next.focus();
          activate(group, next);
        });
      })(buttons[i], i);
    }
  }

  function setup() {
    var groups = document.querySelectorAll('.video-tabs');
    for (var i = 0; i < groups.length; i++) {
      setupGroup(groups[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
