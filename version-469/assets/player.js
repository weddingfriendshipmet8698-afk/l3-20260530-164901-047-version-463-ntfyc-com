import { H as Hls } from "./hls-vendor-dru42stk.js";

const playerMap = new Map();

function attachHls(video, source) {
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    return Promise.resolve();
  }

  if (Hls && Hls.isSupported()) {
    if (playerMap.has(video)) {
      playerMap.get(video).destroy();
      playerMap.delete(video);
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    playerMap.set(video, hls);
    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
        playerMap.delete(video);
      }
    });

    return new Promise(function (resolve) {
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        resolve();
      });
    });
  }

  video.src = source;
  return Promise.resolve();
}

export function initMoviePlayer(videoId, coverId, buttonId, source) {
  const video = document.getElementById(videoId);
  const cover = document.getElementById(coverId);
  const button = document.getElementById(buttonId);

  if (!video || !source) {
    return;
  }

  let started = false;

  function start() {
    if (started) {
      video.play();
      return;
    }

    started = true;
    attachHls(video, source).then(function () {
      video.play();
    });

    if (cover) {
      cover.hidden = true;
    }
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      start();
    });
  }

  video.addEventListener("click", function () {
    if (!started) {
      start();
    }
  });
}
