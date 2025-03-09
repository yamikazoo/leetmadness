// offscreen.js
let audio = null;
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
    const audioPath = msg.source; // Ensure this is a string path like 'songs/flamin.mp3'
    const audioUrl = chrome.runtime.getURL(audioPath); // Correct method call
    audio ??= new Audio(audioUrl);

    // Initialize audio context and apply effects
    initAudio();
    applyEffects();

    console.log('Playing audio:', audioUrl);
    audio.play().then(() => {
      console.log('Audio played successfully');
    }).catch(error => {
      console.error('Error playing audio:', error);
    });
  } else if (msg.command === 'pause') {
    if (audio) {
      console.log('Pausing audio');
      audio.pause();
    }
  } else if (msg.command === 'makeAudioWorse') {
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
