document.addEventListener("DOMContentLoaded", async () => {
    console.log("Popup loaded, waiting for Spotify SDK...");

    // Ensure the SDK is loaded before initializing
    if (!window.Spotify) {
        console.error("Spotify SDK is not loaded yet.");
        return;
    }

    // Retrieve the stored Spotify access token
    let token = localStorage.getItem("spotify_access_token");

    if (!token) {
        alert("Please log in to Spotify.");
        return;
    }

    // Initialize the Spotify Web Playback SDK
    window.onSpotifyWebPlaybackSDKReady = () => {
        console.log("Spotify Web Playback SDK is ready!");

        const player = new Spotify.Player({
            name: 'LeetMadness Chrome Extension',
            getOAuthToken: cb => { cb(token); },
            volume: 0.5
        });

        // ✅ Store the device ID when the player is ready
        player.addListener("ready", ({ device_id }) => {
            console.log("Spotify Player Ready! Device ID:", device_id);
            localStorage.setItem("spotify_device_id", device_id);
        });

        // ❌ Handle authentication errors (e.g., expired token)
        player.addListener("authentication_error", ({ message }) => {
            console.error("Spotify Authentication Error:", message);
            alert("Authentication error! Please log in again.");
            localStorage.removeItem("spotify_access_token");
        });

        // ❌ Handle initialization errors
        player.addListener("initialization_error", ({ message }) => {
            console.error("Spotify Player Initialization Error:", message);
        });

        // ❌ Handle account errors (e.g., no premium account)
        player.addListener("account_error", ({ message }) => {
            console.error("Spotify Account Error:", message);
            alert("Spotify Premium is required to use this feature.");
        });

        // ❌ Handle disconnection
        player.addListener("not_ready", ({ device_id }) => {
            console.log("Spotify Player has gone offline", device_id);
        });

        // ✅ Connect the player to Spotify
        player.connect().then(success => {
            if (success) {
                console.log("Player connected successfully!");
            } else {
                console.error("Failed to connect player.");
            }
        });

        document.getElementById("playButton").addEventListener("click", () => {
            player.togglePlay().catch(err => console.error("Toggle play error:", err));
        });

        // ✅ Toggle play/pause button
        document.getElementById("togglePlay").onclick = function () {
            player.togglePlay().catch(err => console.error("Toggle play error:", err));
        };
    };
});