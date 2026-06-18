import { H as Hls } from './hls-vendor-dru42stk.js';

const players = document.querySelectorAll('video[data-src]');

players.forEach(function (video) {
  const source = video.dataset.src;
  if (!source) {
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, function (_event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
        return;
      }

      hls.destroy();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else {
    video.insertAdjacentHTML('afterend', '<p class="player-message">当前浏览器需要支持 HLS 播放。</p>');
  }
});
