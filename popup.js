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
    const queueButton = document.getElementById("queueButton");

    if (queueList.style.display === "none" || queueList.style.display === "") {
        queueList.style.display = "block"; // Show the queue
        queueButton.textContent = "Hide Queue"; // Change button text
    } else {
        queueList.style.display = "none"; // Hide the queue
        queueButton.textContent = "Show Queue"; // Change button text back
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
    if (playlist.length === 0) {
        alert("No songs in the queue.");
        return;
    }
    currentIndex = (currentIndex + 1) % playlist.length;
    playMusic();
}

function skipToPrevious() {
    if (playlist.length === 0) {
        alert("No songs in the queue.");
        return;
    }
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
        
        // Create a container for the song text and delete button
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.justifyContent = "space-between";
        container.style.alignItems = "center";

        // Create a span for the song text
        const songText = document.createElement("span");
        songText.textContent = `${index + 1}. ${song.title} - ${song.artist}`;
        
        // Create a delete button with a minus circle icon
        const deleteButton = document.createElement("button");
        deleteButton.style.fontSize = "10px"; // Make the button smaller
        deleteButton.style.padding = "0 2px"; // Reduce padding for a smaller button
        deleteButton.style.backgroundImage = "url('icons/delete-song.png')"; // Replace 'minus-circle-icon.png' with your actual icon path
        deleteButton.style.backgroundRepeat = "no-repeat";
        deleteButton.style.backgroundSize = "cover"; // Ensure the icon fits the button
        deleteButton.style.width = "15px"; // Adjust width to fit the icon
        deleteButton.style.height = "15px"; // Adjust height to fit the icon
        deleteButton.style.border = "none"; // Remove button border
        deleteButton.style.backgroundColor = "transparent";

        // Add event listener to delete button
        deleteButton.addEventListener("click", function(event) {
            playlist.splice(index, 1); // Remove the song from the playlist
            updateQueue(); // Update the queue display
            // Update the current index if necessary
            if (currentIndex >= playlist.length) {
                currentIndex = playlist.length - 1;
                if (currentIndex < 0) {
                    currentIndex = 0;
                }
            }
            updatePlaybackInfo(); // Update playback info if necessary
        });

        // Add event listener to play the song when clicking on the song text
        songText.addEventListener("click", function () {
            currentIndex = index;
            playMusic();
        });

        // Add both song text and delete button to the container
        container.appendChild(songText);
        container.appendChild(deleteButton);
        listItem.appendChild(container);
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
