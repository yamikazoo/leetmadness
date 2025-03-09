// background.js
let audioSource = null;
let isPlaying = false;

// Setup offscreen document
async function setupOffscreenDocument() {
  if (!chrome.offscreen) {
    console.error('Offscreen API not supported.');
    return;
  }
  
  try {
    if (await chrome.offscreen.hasDocument()) {
      console.log('Offscreen document already exists.');
      return;
    }
    
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL('offscreen.html'),
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Playing audio in the background',
    });
    console.log('Offscreen document created successfully');
  } catch (error) {
    console.error('Failed to create offscreen document:', error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === 'seek') {
        chrome.runtime.sendMessage({ command: 'seek', time: request.time });
    } else if (request.command === 'play') {
      audioSource = request.source;
      isPlaying = true;
      playAudio();
    } else if (request.command === 'pause') {
      isPlaying = false;
      pauseAudio();
    } else if (request.command === 'next') {
      // Handle next song logic here
      console.log('Next song command received');
    } else if (request.command === 'previous') {
      // Handle previous song logic here
      console.log('Previous song command received');
    }
  });

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'playbackState') {
    port.postMessage({ isPlaying: isPlaying });
    port.onMessage.addListener((message) => {
      if (message.request === 'getState') {
        port.postMessage({ isPlaying: isPlaying });
      }
    });
  }
});

async function playAudio() {
  await setupOffscreenDocument();
  chrome.runtime.sendMessage({ command: 'play', source: audioSource });
  console.log('Sent play command to offscreen document');
}

async function pauseAudio() {
  await setupOffscreenDocument();
  chrome.runtime.sendMessage({ command: 'pause' });
  console.log('Sent pause command to offscreen document');
}
