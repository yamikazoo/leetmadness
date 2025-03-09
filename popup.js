// Wait for DOM to load before running script
document.addEventListener("DOMContentLoaded", () => {
    console.log("Popup loaded, waiting for user input...");


    // Event Listener for Converting YouTube URL to MP3
    document.getElementById("addSongButton").addEventListener("click", async () => {
        const youtubeURL = document.getElementById("videoUrl").value;
        if (!youtubeURL) {
            alert("Please enter a valid YouTube URL.");
            return;
        }

        const audioURL = await convertYouTubeToAudio(youtubeURL);
    });

});

/**
 * YOUTUBETO MP3 CONVERTER
 */
async function convertYouTubeToAudio(youtubeURL) {
    const apiKey = "7b69ef25a8msh370013627f22292p158d22jsn1829a5827683"; // Replace with your API key
    const videoID = extractYouTubeID(youtubeURL); // Extract video ID dynamically

    if (!videoID) {
        console.error("Invalid YouTube URL.");
        alert("Invalid YouTube URL. Please enter a valid link.");
        return null;
    }

    const apiURL = `https://youtube-to-mp315.p.rapidapi.com/download?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DzyG9Nh_PH38&format=mp3`;

    try {
        const response = await fetch(apiURL, {
            method: "POST",
            headers: {
                "X-RapidAPI-Key": apiKey,
                "X-RapidAPI-Host": "youtube-to-mp315.p.rapidapi.com",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoID}`, format: "mp3" })
        });

        
        const data = await response.json();
        console.log("Raw API Response:", data);

        // ✅ If the API immediately provides the MP3 URL, return it
        if (data.downloadUrl) {
            console.log("MP3 file is ready! Download URL:", data.downloadUrl);
            return data.downloadUrl; // ✅ Return the MP3 file URL immediately
        }

        console.error("API did not return a download URL.");
        alert("Failed to get MP3 file. Try again.");
        return null;

    } catch (error) {
        console.error("Error fetching YouTube MP3:", error);
        alert("Failed to convert YouTube video.");
        return null;
    }
}

/**
 * 🔹 Extracts YouTube Video ID from URL
 */
function extractYouTubeID(url) {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
}

/**
 * 🎵 Play the MP3 File from API Response
 */
async function playMP3(youtubeURL) {
    const mp3URL = await convertYouTubeToAudio(youtubeURL);
    if (mp3URL) {
        const audio = new Audio(mp3URL);
        audio.play().catch(error => console.error("Playback failed:", error));
    }
}

/**
 * 🔹 Extracts YouTube Video ID from URL
 */
function extractYouTubeID(url) {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
}

/**
 * Toggle Play/Pause Icon
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
