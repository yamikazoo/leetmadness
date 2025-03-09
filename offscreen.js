// offscreen.js
let audio = null;
let currentSource = null;

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.command === 'play') {
        if (msg.source !== currentSource) {
            // If the source has changed, reset the audio object
            if (audio) {
                audio.pause();
                audio = null;
            }
            currentSource = msg.source;
            const audioUrl = chrome.runtime.getURL(msg.source);
            audio = new Audio(audioUrl);
        }
        if (audio) {
            audio.play().then(() => {
                console.log('Audio played successfully');
                sendProgressUpdates();
            }).catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    } else if (msg.command === 'pause') {
        if (audio) {
            console.log('Pausing audio');
            audio.pause();
        }
    } else if (msg.command === 'seek') {
        if (audio) {
            audio.currentTime = msg.time;
            // sendProgressUpdates();
        }
    }
  });

function sendProgressUpdates() {
  if (audio) {
    const intervalId = setInterval(() => {
      if (audio.duration && audio.currentTime) {
        const percent = (audio.currentTime / audio.duration) * 100;
        chrome.runtime.sendMessage({ progress: percent });
      }
    }, 1000); // Update every second

    // Clear interval when audio ends
    audio.addEventListener('ended', () => {
      clearInterval(intervalId);
    });
  }
}
