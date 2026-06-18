import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(shell) {
  var video = shell.querySelector('video[data-hls-src]');
  var button = shell.querySelector('[data-video-play]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-hls-src');

  if (source) {
    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          console.warn('HLS fatal error:', data);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function (error) {
        console.warn('Video play was blocked or failed:', error);
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });
}

Array.prototype.slice.call(document.querySelectorAll('[data-video-shell]')).forEach(setupPlayer);
