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

// Function to check playback state
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

// Function to get Spotify access token (OAuth 2.0 needed)
async function getSpotifyToken() {
    const token = localStorage.getItem("spotify_access_token");
    if (token) return token;

    // TODO: Implement OAuth flow to get token
    alert("OAuth flow needed to get Spotify token.");
    return null;
}

// Function to start playback
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
        } else {
            alert("Failed to play music. Check your Spotify settings.");
        }
    });
}

// Function to pause playback
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
        } else {
            alert("Failed to pause music.");
        }
    });
}

// Function to toggle play/pause icon
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


document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup loaded, waiting for user input...");

    // ✅ Event Listener for Converting YouTube URL to MP3
    document.getElementById("convertButton").addEventListener("click", async () => {
        const youtubeURL = document.getElementById("youtube-url").value;
        if (!youtubeURL) {
            alert("Please enter a valid YouTube URL.");
            return;
        }

        const audioURL = await convertYouTubeToAudio(youtubeURL);
        if (audioURL) {
            localStorage.setItem("leetmadness_audio_url", audioURL);
            alert("Audio ready! It will distort on failure.");
        }
    });

    // ✅ Load saved YouTube audio if available
    const savedAudio = localStorage.getItem("leetmadness_audio_url");
    if (savedAudio) {
        console.log("Loaded saved YouTube audio:", savedAudio);
    }
});

/**
 * 🎵 Convert YouTube Video to MP3 using an API
 */
async function convertYouTubeToAudio(youtubeURL) {
    const apiKey = "7b69ef25a8msh370013627f22292p158d22jsn1829a5827683"; // Replace with your API Key
    const apiURL = `https://your-api.com/convert?url=${encodeURIComponent(youtubeURL)}&format=mp3`;

    try {
        const response = await fetch(apiURL, {
            headers: { "X-API-Key": apiKey }
        });

        const data = await response.json();
        return data.audio_url; // The direct MP3 file link
    } 
    
    catch (error) {
        console.error("Error converting YouTube video:", error);
        alert("Failed to convert YouTube video.");
        return null;
    }
}
