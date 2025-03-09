## LeetMadness.fm
Built for SFU's Mountain Madness 25 Hackathon by Brian Y, Calvin W, Alex J, and Tallal M.

LeetMadness.fm is a Chrome browser extension to introduce music to your browsing experience. Specifically designed for LeetCode, an audio distortion API is used to warp your songs every time you make mistakes in your LeetCode challenges. Don't worry though, it works as a regular music player too!

Please feel free to reach out if you encounter any issues or have any questions!

### Features
![image](https://github.com/user-attachments/assets/cd821e91-c8d2-4912-a35d-0a0faf7d41ab)
- Three initial songs. (Copyright Free)
- Music play/pause feature.
- Next and previous navigation.
- Functional song seeking.
- Hideable dynamic queue.
- YouTube link upload. (Broken)
- LeetCode dynamic audio distortion.

### User Guide
1. Clone this repository:

```bash
   git clone https://github.com/yamikazoo/leetmadness.git
   ```

2. Open up Chrome.
3. Go to your Chrome extensions.

```bash
   chrome://extensions
   ```

4. Ensure that `Developer mode` is enabled in the top right corner.
5. Click on the `Load unpacked` button in the top left corner.
6. Navigate to and upload your local `/leetmadness/` repository.

### Known Bugs
- YouTube to MP3 API not working due to issues with CORS.
