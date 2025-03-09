document.addEventListener('DOMContentLoaded', function() {
    updatePlaybackInfo();
    updateQueue();
});

const audio = new Audio();
const playlist = [
    { title: "Song 1", artist: "Artist 1", src: "songs/song1.mp3" },
    { title: "Song 2", artist: "Artist 2", src: "songs/song2.mp3" },
    { title: "Song 3", artist: "Artist 3", src: "songs/song3.mp3" }
];
let currentIndex = 0;

function updatePlaybackInfo() {
    const song = playlist[currentIndex];
    document.getElementById("songInfo").textContent = `${song.title} - ${song.artist}`;
}

document.getElementById("playButton").addEventListener("click", function () {
    if (audio.paused) {
        playMusic();
    } else {
        pauseMusic();
    }
});

document.getElementById("nextButton").addEventListener("click", function() {
    skipToNext();
});

document.getElementById("prevButton").addEventListener("click", function() {
    skipToPrevious();
});

document.getElementById("addSongButton").addEventListener("click", function() {
    const url = document.getElementById("videoUrl").value;
    if (url) {
        convertYoutubeToMp3(url);
    }
});

document.getElementById("queueButton").addEventListener("click", function () {
    const queueList = document.getElementById("queueList");
    if (queueList.style.display === "none" || queueList.style.display === "") {
        queueList.style.display = "block"; // Show the queue
    } else {
        queueList.style.display = "none"; // Hide the queue
    }
});

function playMusic() {
    audio.src = playlist[currentIndex].src;
    audio.play();
    toggleIcon(true);
    updatePlaybackInfo();
}

function pauseMusic() {
    audio.pause();
    toggleIcon(false);
}

function skipToNext() {
    currentIndex = (currentIndex + 1) % playlist.length;
    playMusic();
}

function skipToPrevious() {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playMusic();
}

function toggleIcon(isPlaying) {
    const icon = document.getElementById("icon");
    icon.innerHTML = "";
    
    if (isPlaying) {
        icon.className = "pause-icon";
        icon.innerHTML = '<div></div><div></div>'; // Two vertical bars
    } else {
        icon.className = "play-icon";
    }
}

function updateQueue() {
    const queueList = document.getElementById("queueList");
    queueList.innerHTML = "";

    playlist.forEach((song, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${song.title} - ${song.artist}`;
        listItem.addEventListener("click", function () {
            currentIndex = index;
            playMusic();
        });
        queueList.appendChild(listItem);
    });
}

async function convertYoutubeToMp3(url) {
    alert(`Processing: ${url}`);
    // Simulating a successful conversion
    setTimeout(() => {
        const newSong = { title: "New Song", artist: "Unknown", src: "songs/newsong.mp3" };
        playlist.push(newSong);
        updateQueue();
    }, 2000);
}
