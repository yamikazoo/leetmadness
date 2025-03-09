// popup.js
const playlist = [
    { title: "Song 1", artist: "Artist 1", src: "songs/flamin.mp3" },
    { title: "Song 2", artist: "Artist 2", src: "songs/song2.mp3" },
    { title: "Song 3", artist: "Artist 3", src: "songs/song3.mp3" }
  ];
  let currentIndex = 0;
  
  // Update playback info (song title and artist)
  function updatePlaybackInfo() {
    const song = playlist[currentIndex];
    const songInfo = document.getElementById("songInfo");
    if (songInfo) {
      songInfo.textContent = `${song.title} - ${song.artist}`;
    } else {
      console.error("Element 'songInfo' not found.");
    }
  }
  
  // Skip to the next song
  function skipToNext() {
    if (playlist.length === 0) {
      alert("No songs in the queue.");
      return;
    }
    currentIndex = (currentIndex + 1) % playlist.length;
    chrome.runtime.sendMessage({ command: 'play', source: playlist[currentIndex].src });
    updatePlaybackInfo();
  }
  
  // Skip to the previous song
  function skipToPrevious() {
    if (playlist.length === 0) {
      alert("No songs in the queue.");
      return;
    }
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    chrome.runtime.sendMessage({ command: 'play', source: playlist[currentIndex].src });
    updatePlaybackInfo();
  }
  
  // Initialize audio when the popup loads
  document.addEventListener('DOMContentLoaded', function () {
    updatePlaybackInfo();
  
    const playButton = document.getElementById("playButton");
    if (playButton) {
      playButton.addEventListener("click", function () {
        const icon = document.getElementById("icon");
        if (icon.className === "play-icon") {
          chrome.runtime.sendMessage({ command: 'play', source: playlist[currentIndex].src });
          icon.className = "pause-icon";
          icon.innerHTML = '<div></div><div></div>';
        } else {
          chrome.runtime.sendMessage({ command: 'pause' });
          icon.className = "play-icon";
          icon.innerHTML = ''; // Reset icon to play state
        }
      });
    } else {
      console.error("Element 'playButton' not found.");
    }
  
    const nextButton = document.getElementById("nextButton");
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        skipToNext();
      });
    } else {
      console.error("Element 'nextButton' not found.");
    }
  
    const prevButton = document.getElementById("prevButton");
    if (prevButton) {
      prevButton.addEventListener("click", function () {
        skipToPrevious();
      });
    } else {
      console.error("Element 'prevButton' not found.");
    }
  });
