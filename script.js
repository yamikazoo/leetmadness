// Update progress bar as the audio plays
audio.addEventListener("timeupdate", function() {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.value = percent;
    }
});

// Allow user to seek by dragging the progress slider
progress.addEventListener("input", function() {
    if (audio.duration) {
        const newTime = audio.duration * (progress.value / 100);
        audio.currentTime = newTime;
    }
});