'use strict';

/*
  DROP-IN FIXED portfolio.js
  Fixes:
  - Intro work keeps running in background (timeouts/intervals/Typed instances)
  - Stutter when intro disappears
  - Ghost "top strip" remnants (cleanup + stop animations properly)
  Notes:
  - Requires jQuery + Typed.js + jquery.cookie + marquee plugin like your original.
*/

let entered = false;

const ipgeolocation =
  'https://api.ipgeolocation.io/ipgeo?apiKey=31ece79449854d1c8059ec105e82b33d';

// --- INTRO WORK TRACKERS (timeouts/intervals/Typed) ---
const introTimeouts = [];
const introIntervals = [];
const introTypers = [];

const safeTimeout = (fn, ms) => {
  const id = setTimeout(fn, ms);
  introTimeouts.push(id);
  return id;
};

const safeInterval = (fn, ms) => {
  const id = setInterval(fn, ms);
  introIntervals.push(id);
  return id;
};

const killIntroWork = () => {
  // stop timers
  introTimeouts.forEach(clearTimeout);
  introIntervals.forEach(clearInterval);
  introTimeouts.length = 0;
  introIntervals.length = 0;

  // destroy Typed instances so they STOP running
  introTypers.forEach((t) => {
    try {
      t.destroy();
    } catch (e) {}
  });
  introTypers.length = 0;

  // remove any leftover Typed cursor nodes
  $('.typed-cursor').remove();

  // stop any jQuery animations on intro container if it still exists
  $('#main').stop(true, true);
};

// Cursor helper
const clearCursor = () => $('.typed-cursor').css('opacity', '0');

// Mobile check
const mobileAndTabletCheck = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

// --- ENTER OVERLAY (your click-to-enter layer) ---
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('enter-overlay');
  const button = document.getElementById('enter-button');

  // TODO: app must exist globally (as in your original setup)
  app.videoElement = document.getElementById('background');
  app.audioElement = document.getElementById('audio');

  if (button && overlay) {
    button.addEventListener('click', () => {
      entered = true;

      if (!app.shouldIgnoreVideo) {
        if (app.videoElement) {
          app.videoElement.muted = false;
          app.videoElement.play().catch(() => {});
        }
        if (app.audioElement) {
          app.audioElement.muted = false;
          app.audioElement.play().catch(() => {});
        }
      }

      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 600);
    });
  }
});

// Disable right click
document.addEventListener('contextmenu', (event) => event.preventDefault());

// Spacebar background toggle
document.body.onkeyup = (event) => {
  if (event.keyCode == 32 && app.skippedIntro) {
    if (app.backgroundToggler) {
      if (entered && !app.shouldIgnoreVideo) {
        app.videoElement && app.videoElement.play();
        app.audioElement && app.audioElement.play();
      }
    } else {
      app.videoElement && app.videoElement.pause();
      app.audioElement && app.audioElement.pause();
    }
    return (app.backgroundToggler = !app.backgroundToggler);
  }
};

// Make "troll remove" interval stoppable (no more forever background work)
safeInterval(() => {
  $('.troll').remove();
}, 600);

// Skip button
$('.skip').click(() => {
  skipIntro();
});

// Small helper for CSS animations (your original)
$.fn.extend({
  animateCss: function (animationName) {
    const animationEnd =
      'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

    this.addClass(`animated ${animationName}`).one(animationEnd, () => {
      $(this).removeClass(`animated ${animationName}`);
    });

    return this;
  },
});

// Typed line writer (fixed to track timeout + Typed instance)
const writeLine = (text, speed, timeout, callback) => {
  timeout = typeof timeout === 'number' ? timeout : [0, (callback = timeout)];

  const lineNumber = app.id !== 2 ? ++app.id : (app.id += 2);

  safeTimeout(() => {
    if (app.skippedIntro) return;

    const t = new Typed(`#line${lineNumber}`, {
      strings: text,
      typeSpeed: speed,
      onComplete: callback,
    });

    introTypers.push(t);
  }, timeout);
};

// Document ready
$(document).ready(() => {
  const links = [
    {
      name: 'Matrix Scripts',
      link: 'https://configs.xim.tech/configs/leaked-r6-configs-pc-console-sab/',
    },
    { name: 'Discord Server', link: 'https://discord.gg/tGMpY9Vsk9' },
    { name: 'Gay Men Kissing', link: 'https://www.gettyimages.com/photos/gay-men-kissing' },
  ];

  for (let i in links) {
    let link = links[i];
    $('#marquee').append(`<a href="${link.link}" target="_blank">${link.name}</a>`);
    link = $('#marquee').children('a').last();

    if (i != links.length - 1)
      $('#marquee').append(' <img class="emoticon" src="assets/others/dot.png"> ');
  }

  if (mobileAndTabletCheck()) {
    $('#background').replaceWith(
      '<div id="background" style="background-image: url(assets/images/mobile-background.jpg);"></div>'
    );
    app.shouldIgnoreVideo = true;
  }

  app.titleChanger(['on top', 'exify', 'on top', 'exify', 'on top']);
  app.iconChanger([
    'assets/icons/rose1.jpg',
    'assets/icons/rose2.jpg',
    'assets/icons/rose3.jpg',
    'assets/icons/rose4.jpg',
    'assets/icons/rose5.jpg',
    'assets/icons/rose6.jpg',
    'assets/icons/rose7.jpg',
    'assets/icons/rose7.jpg',
    'assets/icons/rose1.jpg',
  ]);
});

// Restore video time
if ($.cookie('videoTime')) {
  if (app.videoElement) app.videoElement.currentTime = $.cookie('videoTime');
  if (app.audioElement) app.audioElement.currentTime = $.cookie('videoTime');
}

// Intro flow (fixed: every timeout is tracked)
$.getJSON(ipgeolocation, (data) => {
  writeLine(
    [
      'Authenticating...',
      "Granting access to <span style='font-size: 14px; color: #06d;'>[unknown]</span>...",
    ],
    30,
    () => {
      if (app.skippedIntro) return;

      clearCursor();

      const usernames = ['user', 'dude'];
      const ip = data.ip ? data.ip : usernames[Math.floor(Math.random() * usernames.length)];
      const country = data.country_name ? data.country_name : 'your country';

      writeLine(
        [
          "Access granted! <span style='font-size: 14px; color: #0f0;'>[success]</span>",
          `Welcome back, <i style='color: #0f0'>${ip}</i>! By the way, nice to see someone from ${country} here!`,
        ],
        30,
        500,
        () => {
          if (app.skippedIntro) return;

          clearCursor();

          writeLine([`<i style='color: #F62459'>made by exify </i>`], 120, 500, () => {
            safeTimeout(() => {
              if (app.skippedIntro) return;

              clearCursor();

              safeTimeout(() => {
                skipIntro();
              }, 500);
            }, 1000);
          });
        }
      );
    }
  );
});

// --- MAIN FIX: skipIntro now truly stops everything before removing DOM ---
const skipIntro = () => {
  if (app.skippedIntro) return;

  app.skippedIntro = true;

  // ✅ stop timers + intervals + Typed first
  killIntroWork();

  // remove any top-right elements cleanly
  $('.top-right').remove();

  // Fade out intro/main terminal container safely
  $('#main')
    .stop(true, true)
    .fadeOut(120, function () {
      $(this).remove();

      // Marquee start
      $('#marquee').marquee({
        duration: 15000,
        gap: 420,
        delayBeforeStart: 1000,
        direction: 'left',
        duplicated: true,
      });

      safeTimeout(() => {
        $('.brand-header').animateCss(
          app.effects[Math.floor(Math.random() * app.effects.length)]
        );
      }, 200);

      safeTimeout(() => {
        const t = new Typed('#brand', {
          strings: app.brandDescription,
          typeSpeed: 40,
          onComplete: () => {
            clearCursor();
          },
        });
        // This is not "intro" anymore, but still keep reference so we can kill if needed
        // (optional)
      }, 1350);

      safeTimeout(() => {
        if (!app.shouldIgnoreVideo && entered) {
          app.videoElement && app.videoElement.play();
          app.audioElement && app.audioElement.play();
        }

        if (app.videoElement) {
          // avoid stacking multiple listeners if skipIntro somehow runs twice
          if (!app._timeupdateBound) {
            app._timeupdateBound = true;
            app.videoElement.addEventListener(
              'timeupdate',
              () => {
                $.cookie('videoTime', app.videoElement.currentTime, { expires: 1 });
              },
              false
            );
          }
        }

        // Show background ONLY after intro is removed
const $bg = $('.background');
$bg.stop(true, true);

// make sure it was hidden (display:none) then fade in
$bg.css('display', 'block').hide().fadeIn(200, () => {
  if (!app.shouldIgnoreVideo && entered) {
    try {
      if (app.videoElement) {
        app.videoElement.muted = false;
        app.videoElement.play().catch(() => {});
      }
      if (app.audioElement) {
        app.audioElement.muted = false;
        app.audioElement.play().catch(() => {});
      }
    } catch (e) {}
  }

  // set volume AFTER start to avoid some browser weirdness
  if (!app.shouldIgnoreVideo && entered && app.audioElement) {
    try { app.audioElement.volume = app.musicVolume || 0.5; } catch(e){}
  }
});

$('.marquee-container').css('visibility', 'visible').hide().fadeIn(100);
$('.marquee-container').animateCss('zoomIn');
$('.container').fadeIn();
          if (!app.shouldIgnoreVideo && entered && app.audioElement) {
            try {
              app.audioElement.volume = app.musicVolume || 0.5;
            } catch (e) {}
          }
        });
      }, 200);
    });
};


