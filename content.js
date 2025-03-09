// In content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === 'play' || request.command === 'pause') {
    // Handle play/pause logic here
    console.log(`Received command: ${request.command}`);
  }
});