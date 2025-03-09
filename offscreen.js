// offscreen.js
let audio = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.command === 'play') {
    const audioPath = msg.source; // Ensure this is a string path like 'songs/flamin.mp3'
    const audioUrl = chrome.runtime.getURL(audioPath); // Correct method call
    audio ??= new Audio(audioUrl);
    console.log('Playing audio:', audioUrl);
    audio.play().then(() => {
      console.log('Audio played successfully');
      sendProgressUpdates();
    }).catch(error => {
      console.error('Error playing audio:', error);
    });
  } else if (msg.command === 'pause') {
    if (audio) {
      console.log('Pausing audio');
      audio.pause();
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
