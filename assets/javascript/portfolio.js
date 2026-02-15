'use strict';

/*
  CLEAN portfolio.js (drop-in)
  Fixes:
  - Intro timers/Typed stop properly
  - Background video/audio ONLY show/play after intro is over (skipIntro)
  - No leftover callbacks / mismatched braces
*/

var entered = false;

var ipgeolocation =
  'https://api.ipgeolocation.io/ipgeo?apiKey=31ece79449854d1c8059ec105e82b33d';

// --- TRACKERS (timeouts/intervals/Typed) ---
var introTimeouts = [];
var introIntervals = [];
var introTypers = [];

function safeTimeout(fn, ms) {
  var id = setTimeout(fn, ms);
  introTimeouts.push(id);
  return id;
}

function safeInterval(fn, ms) {
  var id = setInterval(fn, ms);
  introIntervals.push(id);
  return id;
}

function killIntroWork() {
  // stop timers
  for (var i = 0; i < introTimeouts.length; i++) clearTimeout(introTimeouts[i]);
  for (var j = 0; j < introIntervals.length; j++) clearInterval(introIntervals[j]);
  introTimeouts.length = 0;
  introIntervals.length = 0;

  // destroy Typed instances
  for (var k = 0; k < introTypers.length; k++) {
    try { introTypers[k].destroy(); } catch (e) {}
  }
  introTypers.length = 0;

  // remove cursors
  if (window.jQuery) $('.typed-cursor').remove();

  // stop animations if still exists
  if (window.jQuery) $('#main').stop(true, true);
}

function clearCursor() {
  if (window.jQuery) $('.typed-cursor').css('opacity', '0');
}

function mobileAndTabletCheck() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// --- ENTER OVERLAY ---
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('enter-overlay');
  var button = document.getElementById('enter-button');

  // app must exist (your app.js does this)
  if (window.app) {
    app.videoElement = document.getElementById('background');
    app.audioElement = document.getElementById('audio');
  }

  if (button && overlay) {
    button.addEventListener('click', function () {
      entered = true;

      // Only start media AFTER intro ends. During intro: keep hidden + muted.
      // So here we only fade overlay. Media will start in skipIntro().

      overlay.classList.add('fade-out');
      setTimeout(function () {
        try { overlay.remove(); } catch (e) {}
      }, 600);
    });
  }
});

// Disable right click
document.addEventListener('contextmenu', function (event) { event.preventDefault(); });

// Spacebar background toggle (after intro)
document.body.onkeyup = function (event) {
  if (!window.app) return;
  if (event.keyCode === 32 && app.skippedIntro) {
    if (app.backgroundToggler) {
      if (entered && !app.shouldIgnoreVideo) {
        if (app.videoElement) app.videoElement.play();
        if (app.audioElement) app.audioElement.play();
      }
    } else {
      if (app.videoElement) app.videoElement.pause();
      if (app.audioElement) app.audioElement.pause();
    }
    app.backgroundToggler = !app.backgroundToggler;
  }
};

// Troll cleanup (stoppable)
safeInterval(function () {
  if (window.jQuery) $('.troll').remove();
}, 600);

// Skip button
if (window.jQuery) {
  $('.skip').click(function () { skipIntro(); });
}

// animateCss helper
if (window.jQuery) {
  $.fn.extend({
    animateCss: function (animationName) {
      var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
      this.addClass('animated ' + animationName).one(animationEnd, function () {
        $(this).removeClass('animated ' + animationName);
      });
      return this;
    }
  });
}

// Typed line writer
function writeLine(text, speed, timeout, callback) {
  if (!window.app) return;

  if (typeof timeout !== 'number') {
    callback = timeout;
    timeout = 0;
  }

  var lineNumber = (app.id !== 2) ? (++app.id) : (app.id += 2);

  safeTimeout(function () {
    if (app.skippedIntro) return;

    var t = new Typed('#line' + lineNumber, {
      strings: text,
      typeSpeed: speed,
      onComplete: callback
    });

    introTypers.push(t);
  }, timeout);
}

// Document ready
if (window.jQuery) {
  $(document).ready(function () {
    var links = [
      { name: 'Matrix Scripts', link: 'https://configs.xim.tech/configs/leaked-r6-configs-pc-console-sab/' },
      { name: 'Discord Server', link: 'https://discord.gg/tGMpY9Vsk9' },
      { name: 'Gallery', link: 'https://www.gettyimages.com/photos/gay-men-kissing' }
    ];

    for (var i = 0; i < links.length; i++) {
      $('#marquee').append('<a href="' + links[i].link + '" target="_blank">' + links[i].name + '</a>');
      if (i !== links.length - 1) {
        $('#marquee').append(' <img class="emoticon" src="assets/others/dot.png"> ');
      }
    }

    if (mobileAndTabletCheck()) {
      $('#background').replaceWith('<div id="background" style="background-image: url(assets/images/mobile-background.jpg);"></div>');
      app.shouldIgnoreVideo = true;
    }

    app.titleChanger(['on top', 'exify', 'on top', 'exify', 'on top']);
    app.iconChanger([
      'assets/icons/rose1.jpg','assets/icons/rose2.jpg','assets/icons/rose3.jpg','assets/icons/rose4.jpg',
      'assets/icons/rose5.jpg','assets/icons/rose6.jpg','assets/icons/rose7.jpg','assets/icons/rose7.jpg',
      'assets/icons/rose1.jpg'
    ]);
  });
}

// Restore video time
if (window.jQuery && $.cookie('videoTime')) {
  if (window.app && app.videoElement) app.videoElement.currentTime = $.cookie('videoTime');
  if (window.app && app.audioElement) app.audioElement.currentTime = $.cookie('videoTime');
}

// Intro flow
if (window.jQuery) {
  $.getJSON(ipgeolocation, function (data) {
    writeLine(
      [
        'Authenticating...',
        "Granting access to <span style='font-size: 14px; color: #06d;'>[unknown]</span>..."
      ],
      30,
      0,
      function () {
        if (app.skippedIntro) return;

        clearCursor();

        var usernames = ['user', 'dude'];
        var ip = data && data.ip ? data.ip : usernames[Math.floor(Math.random() * usernames.length)];
        var country = data && data.country_name ? data.country_name : 'your country';

        writeLine(
          [
            "Access granted! <span style='font-size: 14px; color: #0f0;'>[success]</span>",
            "Welcome back, <i style='color: #0f0'>" + ip + "</i>! By the way, nice to see someone from " + country + " here!"
          ],
          30,
          500,
          function () {
            if (app.skippedIntro) return;

            clearCursor();

            writeLine(["<i style='color: #F62459'>made by exify </i>"], 120, 500, function () {
              safeTimeout(function () {
                if (app.skippedIntro) return;
                clearCursor();
                safeTimeout(function () { skipIntro(); }, 500);
              }, 1000);
            });
          }
        );
      }
    );
  });
}

// --- skipIntro: stops work, removes intro, then shows/plays background ---
function skipIntro() {
  if (!window.app) return;
  if (app.skippedIntro) return;

  app.skippedIntro = true;

  killIntroWork();

  if (window.jQuery) {
    $('.top-right').remove();

    $('#main').stop(true, true).fadeOut(120, function () {
      $(this).remove();

      // start marquee
      $('#marquee').marquee({
        duration: 15000,
        gap: 420,
        delayBeforeStart: 1000,
        direction: 'left',
        duplicated: true
      });

      safeTimeout(function () {
        $('.brand-header').animateCss(app.effects[Math.floor(Math.random() * app.effects.length)]);
      }, 200);

      safeTimeout(function () {
        new Typed('#brand', {
          strings: app.brandDescription,
          typeSpeed: 40,
          onComplete: function () { clearCursor(); }
        });
      }, 1350);

      // SHOW background only after intro is gone
      safeTimeout(function () {
        var $bg = $('.background');
        $bg.stop(true, true);
        $bg.css('display', 'block').hide().fadeIn(200, function () {
          if (!app.shouldIgnoreVideo && entered) {
            try {
              if (app.videoElement) {
                app.videoElement.muted = false;
                app.videoElement.play();
              }
              if (app.audioElement) {
                app.audioElement.muted = false;
                app.audioElement.play();
              }
            } catch (e) {}
          }

          if (!app.shouldIgnoreVideo && entered && app.audioElement) {
            try { app.audioElement.volume = app.musicVolume || 0.5; } catch (e2) {}
          }
        });

        // persist video time
        if (app.videoElement && !app._timeupdateBound) {
          app._timeupdateBound = true;
          app.videoElement.addEventListener('timeupdate', function () {
            try { $.cookie('videoTime', app.videoElement.currentTime, { expires: 1 }); } catch (e3) {}
          }, false);
        }

        $('.marquee-container').css('visibility', 'visible').hide().fadeIn(100);
        $('.marquee-container').animateCss('zoomIn');
        $('.container').fadeIn();

      }, 200);
    });
  }
}
