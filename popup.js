// popup.js
const defaultPlaylist = [
    { title: "Flamin", artist: "Unknown", src: "songs/flamin.mp3" },
    { title: "Unknown", artist: "Unknown", src: "songs/audio.mp3" },
    { title: "Moving On", artist: "SnoozyBeats", src: "songs/moving-on-snoozybeats.mp3" }
];
let playlist = defaultPlaylist;
let currentIndex = 0;
let currentlyPlayingSource = null;
let isPlaying = false;

// Function to format time in seconds to MM:SS
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}


document.addEventListener('DOMContentLoaded', async function() {
    await loadCurrentSongIndex();
    await loadPlaylist();
    await loadQueueState();
    updatePlaybackInfo();
    updateQueue();

    const port = chrome.runtime.connect({ name: 'playbackState' });
    port.onMessage.addListener((message) => {
        isPlaying = message.isPlaying;
        // currentlyPlayingSource = message.currentSource || currentlyPlayingSource
        updatePlayButtonIcon();
    });

    port.postMessage({ request: 'getState' });

    // Get references to the HTML elements
    const audioPlayer = document.getElementById('audioPlayer');
    const totalDurationDisplay = document.getElementById('totalDuration');

    // Set total duration display when metadata is loaded
    audioPlayer.addEventListener('loadedmetadata', () => {
    const duration = audioPlayer.duration;
    totalDurationDisplay.textContent = formatTime(duration);
    });


    const playButton = document.getElementById("playButton");
    if (playButton) {
        playButton.addEventListener("click", function () {
            if (!isPlaying) {
                if (currentlyPlayingSource !== playlist[currentIndex].src) {
                    chrome.runtime.sendMessage({ command: 'play', source: playlist[currentIndex].src });
                    currentlyPlayingSource = playlist[currentIndex].src;
                } else {
                    chrome.runtime.sendMessage({ command: 'resume' });
                }
                isPlaying = true;
            } else {
                chrome.runtime.sendMessage({ command: 'pause' });
                isPlaying = false;
            }
            updatePlayButtonIcon();
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

    const addSongButton = document.getElementById("addSongButton");
    if (addSongButton) {
        addSongButton.addEventListener("click", function() {
            const url = document.getElementById("videoUrl").value;
            if (url) {
                convertYoutubeToMp3(url);
                document.getElementById("videoUrl").value = '';
            }
        });
    } else {
        console.error("Element 'addSongButton' not found.");
    }

    const queueButton = document.getElementById("queueButton");
    if (queueButton) {
        queueButton.addEventListener("click", async function () {
            const queueList = document.getElementById("queueList");
            if (queueList) {
                if (queueList.style.display === "none" || queueList.style.display === "") {
                    queueList.style.display = "block"; 
                    queueButton.textContent = "Hide Queue";
                    await saveQueueState(true);
                } else {
                    queueList.style.display = "none"; 
                    queueButton.textContent = "Show Queue";
                    await saveQueueState(false); 
                }
            } else {
                console.error("Element 'queueList' not found.");
            }
        });
    } else {
        console.error("Element 'queueButton' not found.");
    }
});

function updatePlayButtonIcon() {
    const icon = document.getElementById("icon");
    if (isPlaying) {
        icon.className = "pause-icon";
        icon.innerHTML = '<div></div><div></div>';
    } else {
        icon.className = "play-icon";
        icon.innerHTML = '';
    }
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.progress) {
        const progressBar = document.getElementById("progress");
        progressBar.value = message.progress;
    } else if (message.command === 'skipToNext') {
        skipToNext();
    }
});

document.getElementById("progress").addEventListener("input", function() {
    const audioPlayer = document.getElementById("audioPlayer");

    if (audioPlayer && playlist[currentIndex].duration) {
        const newTime = playlist[currentIndex].duration * (this.value / 100);
        chrome.runtime.sendMessage({ command: 'seek', time: newTime });
    } else {
        console.error("Duration not available for the current song.");
    }
});


async function loadCurrentSongIndex() {
    try {
        const result = await chrome.storage.local.get(["currentSongIndex"]);
        if (result && result.currentSongIndex !== undefined) {
            currentIndex = result.currentSongIndex;
        }
    } catch (error) {
        console.error("Error loading current song index:", error);
    }
}

// Function to save the current song index to storage
async function saveCurrentSongIndex() {
    try {
        await chrome.storage.local.set({ currentSongIndex: currentIndex });
    } catch (error) {
        console.error("Error saving current song index:", error);
    }
}

// Function to load the queue state from storage
async function loadQueueState() {
    try {
        const result = await chrome.storage.local.get(["showQueue"]);
        if (result && result.showQueue !== undefined) {
            if (result.showQueue) {
                document.getElementById("queueList").style.display = "block";
                document.getElementById("queueButton").textContent = "Hide Queue";
            } else {
                document.getElementById("queueList").style.display = "none";
                document.getElementById("queueButton").textContent = "Show Queue";
            }
        } else {
            // Default state if none is stored
            document.getElementById("queueList").style.display = "none";
            document.getElementById("queueButton").textContent = "Show Queue";
        }
    } catch (error) {
        console.error("Error loading queue state:", error);
    }
}

// Function to save the queue state to storage
async function saveQueueState(show) {
    try {
        await chrome.storage.local.set({ showQueue: show });
    } catch (error) {
        console.error("Error saving queue state:", error);
    }
}

// Function to load the playlist from storage
async function loadPlaylist() {
    try {
        const result = await chrome.storage.local.get(["playlist"]);
        if (result && result.playlist) {
            playlist = result.playlist;
        } else {
            // Default playlist if none is stored
            playlist = defaultPlaylist;
        }
    } catch (error) {
        console.error("Error loading playlist:", error);
    }
}

// Function to save the playlist to storage
async function savePlaylist() {
    try {
        await chrome.storage.local.set({ playlist: playlist });
    } catch (error) {
        console.error("Error saving playlist:", error);
    }
}

function updatePlaybackInfo() {
    const song = playlist[currentIndex];
    const songInfo = document.getElementById("songInfo");
    const audioPlayer = document.getElementById("audioPlayer");

    if (songInfo) {
        songInfo.textContent = `${song.title} - ${song.artist}`;
    } else {
        console.error("Element 'songInfo' not found.");
    }

    if (audioPlayer) {
        audioPlayer.src = song.src;
        audioPlayer.load();

        audioPlayer.onloadedmetadata = function () {
            playlist[currentIndex].duration = audioPlayer.duration;
            console.log(`Duration set for ${song.title}: ${audioPlayer.duration} seconds`);
        };
    }
}

function skipToNext() {
    console.log("skipping");
    if (playlist.length === 0) {
        alert("No songs in the queue.");
        return;
    }
    currentIndex = (currentIndex + 1) % playlist.length;
    chrome.runtime.sendMessage({ command: 'play', source: playlist[currentIndex].src });
    updatePlaybackInfo();
    const icon = document.getElementById("icon");
    icon.className = "pause-icon";
    icon.innerHTML = '<div></div><div></div>';
    saveCurrentSongIndex();
}

function skipToPrevious() {
    if (playlist.length === 0) {
        alert("No songs in the queue.");
        return;
    }
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    chrome.runtime.sendMessage({ command: 'play', source: playlist[currentIndex].src });
    updatePlaybackInfo();
    const icon = document.getElementById("icon");
    icon.className = "pause-icon";
    icon.innerHTML = '<div></div><div></div>';
    saveCurrentSongIndex();
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

            deleteButton.addEventListener("click", async function(event) {
                playlist.splice(index, 1); 
                updateQueue(); 
                if (currentIndex >= playlist.length) {
                    currentIndex = playlist.length - 1;
                    if (currentIndex < 0) {
                        currentIndex = 0;
                    }
                }
                updatePlaybackInfo(); 
                await savePlaylist();
                await saveCurrentSongIndex();
            });

            songText.addEventListener("click", function () {
                currentIndex = index;
                chrome.runtime.sendMessage({ command: 'play', source: playlist[currentIndex].src });
                currentlyPlayingSource = playlist[currentIndex].src;
                updatePlaybackInfo();
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
        savePlaylist();
    }, 2000); // TODO: change time if necessary
}
