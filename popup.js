/**
 * Initialize the popup when DOM is loaded
 * Gets Spotify token and updates playback information if available
 */
document.addEventListener('DOMContentLoaded', async function() {
    const token = await getSpotifyToken();
    if (token) {
        updatePlaybackInfo(token);
    }
});

/**
 * Event handler for the play/pause button
 * Toggles between playing and pausing music based on current state
 */
document.getElementById("playButton").addEventListener("click", async function () {
    const token = await getSpotifyToken();
    if (!token) {
        alert("Please log in to Spotify.");
        return;
    }

    const isPlaying = await checkPlaybackState(token);
    
    if (isPlaying) {
        pauseMusic(token);
    } else {
        playMusic(token);
    }
});

/**
 * Event handler for the next track button
 * Skips to the next track in the current playlist/album
 */
document.getElementById("nextButton").addEventListener("click", async function() {
    const token = await getSpotifyToken();
    if (!token) {
        alert("Please log in to Spotify.");
        return;
    }
    skipToNext(token);
});

/**
 * Event handler for the previous track button
 * Returns to the previous track in the current playlist/album
 */
document.getElementById("prevButton").addEventListener("click", async function() {
    const token = await getSpotifyToken();
    if (!token) {
        alert("Please log in to Spotify.");
        return;
    }
    skipToPrevious(token);
});

/**
 * Checks if music is currently playing on Spotify
 * @param {string} token - Spotify access token
 * @returns {boolean} - True if music is playing, false otherwise
 */
async function checkPlaybackState(token) {
    const response = await fetch("https://api.spotify.com/v1/me/player", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.status === 200) {
        const data = await response.json();
        return data.is_playing;
    }
    return false;
}

/**
 * Gets current track information and updates the UI
 * Shows track name, artist and updates play/pause button state
 * @param {string} token - Spotify access token
 */
async function updatePlaybackInfo(token) {
    const response = await fetch("https://api.spotify.com/v1/me/player", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (response.status === 200) {
        const data = await response.json();
        if (data.item) {
            const songTitle = data.item.name;
            const artistName = data.item.artists.map(artist => artist.name).join(", ");
            document.getElementById("songInfo").textContent = `${songTitle} - ${artistName}`;
            toggleIcon(data.is_playing);
        }
    } else {
        document.getElementById("songInfo").textContent = "Not playing";
        toggleIcon(false);
    }
}

/**
 * Retrieves Spotify access token from local storage
 * In a complete implementation, this would handle OAuth authentication
 * @returns {string|null} - Spotify access token or null if not available
 */
async function getSpotifyToken() {
    const token = localStorage.getItem("spotify_access_token");
    if (token) return token;

    // TODO: Implement OAuth flow to get token
    alert("OAuth flow needed to get Spotify token.");
    return null;
}

/**
 * Starts or resumes playback on Spotify
 * @param {string} token - Spotify access token
 */
async function playMusic(token) {
    fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ uris: ["spotify:track:4uLU6hMCjMI75M1A2tKUQC"] }) // Example track URI
    }).then(response => {
        if (response.status === 204) {
            toggleIcon(true);
            updatePlaybackInfo(token);
        } else {
            alert("Failed to play music. Check your Spotify settings.");
        }
    });
}

/**
 * Pauses current playback on Spotify
 * @param {string} token - Spotify access token
 */
async function pauseMusic(token) {
    fetch("https://api.spotify.com/v1/me/player/pause", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }).then(response => {
        if (response.status === 204) {
            toggleIcon(false);
            document.getElementById("songInfo").textContent = "Paused";
        } else {
            alert("Failed to pause music.");
        }
    });
}

/**
 * Skips to the next track in the current context
 * Updates UI after a short delay to allow Spotify to process
 * @param {string} token - Spotify access token
 */
async function skipToNext(token) {
    fetch("https://api.spotify.com/v1/me/player/next", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }).then(response => {
        if (response.status === 204) {
            // Wait a moment for Spotify to update
            setTimeout(() => {
                updatePlaybackInfo(token);
            }, 500);
        } else {
            alert("Failed to skip to next track.");
        }
    });
}

/**
 * Skips to the previous track in the current context
 * Updates UI after a short delay to allow Spotify to process
 * @param {string} token - Spotify access token
 */
async function skipToPrevious(token) {
    fetch("https://api.spotify.com/v1/me/player/previous", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }).then(response => {
        if (response.status === 204) {
            // Wait a moment for Spotify to update
            setTimeout(() => {
                updatePlaybackInfo(token);
            }, 500);
        } else {
            alert("Failed to skip to previous track.");
        }
    });
}

/**
 * Toggles the play/pause button icon based on playback state
 * Shows pause icon when playing, play icon when paused
 * @param {boolean} isPlaying - Whether music is currently playing
 */
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
