// offscreen.js
let audio = null;
let currentSource = null;
let audioContext;
let sourceNode;
let gainNode;
let filterNode;
let distortionNode;

// Initialize audio context and effects
function initAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  gainNode = audioContext.createGain();
  filterNode = audioContext.createBiquadFilter();
  distortionNode = audioContext.createWaveShaper();

  // Set initial filter (pitch and tone)
  filterNode.type = 'lowpass';
  filterNode.frequency.value = 1000; // Initial frequency
  filterNode.Q.value = 1; // Quality factor

  // Set initial volume
  gainNode.gain.value = 1.0;

  // Set initial distortion
  distortionNode.curve = makeDistortionCurve(0);
  distortionNode.oversample = '4x';

  console.log('Audio context and effects initialized.');
}

// Function to create a distortion curve
function makeDistortionCurve(amount) {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < n_samples; i++) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

// Apply effects to the audio element
function applyEffects() {
  if (!audio || !audioContext) {
    console.error('Audio or audio context not initialized.');
    return;
  }

  // Create a new audio source from the audio element
  sourceNode = audioContext.createMediaElementSource(audio);

  // Connect the nodes
  sourceNode.connect(distortionNode);
  distortionNode.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(audioContext.destination);

  console.log('Audio effects applied.');
}

// Handle messages from background.js


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
            initAudio();
            applyEffects();
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
    }  else if (msg.command === 'makeAudioWorse') {
        // Apply distortion effects
        distortionNode.curve = makeDistortionCurve(100); // Example: Increase distortion
        filterNode.frequency.value = 500; // Lower frequency for worse audio
        gainNode.gain.value = 0.8; // Reduce volume
        console.log('Audio made worse.');
      } else if (msg.command === 'makeAudioBetter') {
        // Reset distortion effects
        distortionNode.curve = makeDistortionCurve(0); // Reset distortion
        filterNode.frequency.value = 1000; // Reset frequency
        gainNode.gain.value = 1.0; // Reset volume
        console.log('Audio made better.');
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
