// Audio context and variables
let audioContext;
let sourceNode;
let gainNode;
let filterNode;
let distortionNode;
let incorrectSubmissions = 0;
let correctSubmissions = 0;

// Base state values
const BASE_PLAYBACK_RATE = 1.0;
const BASE_FILTER_FREQUENCY = 1000;
const BASE_GAIN = 1.0;

// Initialize the audio context
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log("AudioContext initialized.");
}

// Function to apply effects to the current audio source
function applyEffects(audioElement) {
    if (!audioContext) {
        console.error("AudioContext not initialized.");
        return;
    }

    // Stop the previous audio source if it exists
    if (sourceNode) {
        sourceNode.stop();
    }

    // Create a new audio source from the audio element
    sourceNode = audioContext.createMediaElementSource(audioElement);

    // Create audio nodes for effects
    gainNode = audioContext.createGain();
    filterNode = audioContext.createBiquadFilter();
    distortionNode = audioContext.createWaveShaper();

    // Apply initial distortion
    distortionNode.curve = makeDistortionCurve(0);
    distortionNode.oversample = '4x';

    // Set initial filter (pitch and tone)
    filterNode.type = 'lowpass';
    filterNode.frequency.value = BASE_FILTER_FREQUENCY; // Initial frequency
    filterNode.Q.value = 1; // Quality factor

    // Set initial volume
    gainNode.gain.value = BASE_GAIN;

    // Set initial playback rate
    sourceNode.playbackRate.value = BASE_PLAYBACK_RATE;

    // Connect the nodes
    sourceNode.connect(distortionNode);
    distortionNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    console.log("Audio effects applied to the current song.");
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

// Function to make the audio progressively worse
export function makeAudioWorse() {
    incorrectSubmissions++;
    updateAudioEffects();
}

// Function to make the audio progressively better
export function makeAudioBetter() {
    if (incorrectSubmissions === 0) {
        console.log("No incorrect submissions to fix. Audio remains unchanged.");
        return;
    }
    correctSubmissions++;
    updateAudioEffects();
}

// Function to update audio effects based on submissions
function updateAudioEffects() {
    const netSubmissions = incorrectSubmissions - correctSubmissions;

    if (netSubmissions === 0) {
        // Reset all effects to base state
        distortionNode.curve = makeDistortionCurve(0);
        filterNode.frequency.value = BASE_FILTER_FREQUENCY;
        sourceNode.playbackRate.value = BASE_PLAYBACK_RATE;
        gainNode.gain.value = BASE_GAIN;
    } else if (netSubmissions > 0) {
        // Apply effects based on net submissions
        distortionNode.curve = makeDistortionCurve(netSubmissions * 10);
        filterNode.frequency.value = Math.max(100, BASE_FILTER_FREQUENCY - netSubmissions * 100);
        sourceNode.playbackRate.value = Math.max(0.5, BASE_PLAYBACK_RATE - netSubmissions * 0.1);
        gainNode.gain.value = Math.max(0.1, BASE_GAIN - netSubmissions * 0.1);
    }

    console.log(`Incorrect submissions: ${incorrectSubmissions}`);
    console.log(`Correct submissions: ${correctSubmissions}`);
    console.log(`Playback rate: ${sourceNode.playbackRate.value.toFixed(2)}`);
    console.log(`Filter frequency: ${filterNode.frequency.value.toFixed(2)}`);
    console.log(`Filter type: ${filterNode.type}`);
}

// Initialize audio when the page loads
initAudio();
