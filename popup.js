// popup.js

document.addEventListener('DOMContentLoaded', function() {
    updatePlaybackInfo();
    updateQueue();

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
        nextButton.addEventListener("click", function() {
            skipToNext();
        });
    } else {
        console.error("Element 'nextButton' not found.");
    }

    const prevButton = document.getElementById("prevButton");
    if (prevButton) {
        prevButton.addEventListener("click", function() {
            skipToPrevious();
        });
    } else {
        console.error("Element 'prevButton' not found.");
    }

    const addSongButton = document.getElementById("addSongButton");
    if (addSongButton) {
        addSongButton.addEventListener("click", function() {
            const url = document.getElementById("videoUrl").value;
            if (url) {
                convertYoutubeToMp3(url);
            }
        });
    } else {
        console.error("Element 'addSongButton' not found.");
    }

    const queueButton = document.getElementById("queueButton");
    if (queueButton) {
        queueButton.addEventListener("click", function () {
            const queueList = document.getElementById("queueList");
            if (queueList) {
                if (queueList.style.display === "none" || queueList.style.display === "") {
                    queueList.style.display = "block"; 
                    queueButton.textContent = "Hide Queue"; 
                } else {
                    queueList.style.display = "none"; 
                    queueButton.textContent = "Show Queue"; 
                }
            } else {
                console.error("Element 'queueList' not found.");
            }
        });
    } else {
        console.error("Element 'queueButton' not found.");
    }
});

const playlist = [
    { title: "Song 1", artist: "Artist 1", src: "songs/flamin.mp3" },
    { title: "Song 2", artist: "Artist 2", src: "songs/song2.mp3" },
    { title: "Song 3", artist: "Artist 3", src: "songs/song3.mp3" }
];
let currentIndex = 0;

function updatePlaybackInfo() {
    const song = playlist[currentIndex];
    const songInfo = document.getElementById("songInfo");
    if (songInfo) {
        songInfo.textContent = `${song.title} - ${song.artist}`;
    } else {
        console.error("Element 'songInfo' not found.");
    }
}

function skipToNext() {
    if (playlist.length === 0) {
        alert("No songs in the queue.");
        return;
    }
    currentIndex = (currentIndex + 1) % playlist.length;
    chrome.runtime.sendMessage({ command: 'play', source: playlist[currentIndex].src });
}

function skipToPrevious() {
    if (playlist.length === 0) {
        alert("No songs in the queue.");
        return;
    }
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    chrome.runtime.sendMessage({ command: 'play', source: playlist[currentIndex].src });
}

function updateQueue() {
    const queueList = document.getElementById("queueList");
    if (queueList) {
        queueList.innerHTML = "";

        playlist.forEach((song, index) => {
            const listItem = document.createElement("li");
            
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.justifyContent = "space-between";
            container.style.alignItems = "center";

            const songText = document.createElement("span");
            songText.textContent = `${index + 1}. ${song.title} - ${song.artist}`;
            
            const deleteButton = document.createElement("button");
            deleteButton.style.fontSize = "10px"; 
            deleteButton.style.padding = "0 2px"; 
            deleteButton.style.backgroundImage = "url('icons/delete-song.png')"; 
            deleteButton.style.backgroundRepeat = "no-repeat";
            deleteButton.style.backgroundSize = "cover"; 
            deleteButton.style.width = "15px"; 
            deleteButton.style.height = "15px"; 
            deleteButton.style.border = "none"; 
            deleteButton.style.backgroundColor = "transparent";

            deleteButton.addEventListener("click", function(event) {
                playlist.splice(index, 1); 
                updateQueue(); 
                if (currentIndex >= playlist.length) {
                    currentIndex = playlist.length - 1;
                    if (currentIndex < 0) {
                        currentIndex = 0;
                    }
                }
                updatePlaybackInfo(); 
            });

            songText.addEventListener("click", function () {
                currentIndex = index;
                chrome.runtime.sendMessage({ command: 'play', source: playlist[currentIndex].src });
            });

            container.appendChild(songText);
            container.appendChild(deleteButton);
            listItem.appendChild(container);
            queueList.appendChild(listItem);
        });
    } else {
        console.error("Element 'queueList' not found.");
    }
}

async function convertYoutubeToMp3(url) {
    alert(`Processing: ${url}`);
    setTimeout(() => {
        const newSong = { title: "New Song", artist: "Unknown", src: "songs/newsong.mp3" };
        playlist.push(newSong);
        updateQueue();
    }, 2000);
}
