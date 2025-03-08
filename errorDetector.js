// Flag to track if a message has already been shown for the current code execution
let messageShown = false;

// Function to check the submission result and show a popup
function checkForIncorrectSubmission() {
    // Use the correct selector for incorrect submissions
    const errorElement = document.querySelector(
        'span[data-e2e-locator="console-result"].text-red-s, ' +
        'span[data-e2e-locator="console-result"].text-dark-red-s, ' +
        'div[data-e2e-locator="console-result"].text-red-s, ' +
        'div[data-e2e-locator="console-result"].text-dark-red-s, ' +
        'h3.text-red-60'
    );
    
    // Use the correct selector for correct submissions
    const successElement = document.querySelector(
        'span[data-e2e-locator="submission-result"], ' +
        'span[data-e2e-locator="console-result"].text-green-s, ' +
        'span[data-e2e-locator="console-result"].text-dark-green-s'
    );

    if (errorElement && !messageShown) {
        // Get the text content of the error element
        const errorText = errorElement.innerText.trim();

        // Debugging: Log the error text to the console
        console.log("Error result detected:", errorText);

        // Check if the text contains any of the four error types
        if (
            errorText.includes("Runtime Error") ||
            errorText.includes("Compile Error") ||
            errorText.includes("Wrong Answer") ||
            errorText.includes("Time Limit Exceeded")
        ) {
            alert("You suck!"); // Popup for incorrect submission
            messageShown = true; // Set the flag to true
        }
    } else if (successElement && !messageShown) {
        // Get the text content of the success element
        const successText = successElement.innerText.trim();

        // Debugging: Log the success text to the console
        console.log("Success result detected:", successText);

        // Check if the text contains "Accepted"
        if (successText.includes("Accepted")) {
            alert("Well done!"); // Popup for correct submission
            messageShown = true; // Set the flag to true
        }
    } else {
        console.log("Submission result element not found or message already shown."); // Debugging
    }
}

// Reset the messageShown flag when the Run or Submit button is clicked
document.addEventListener('click', (event) => {
    const runButton = event.target.closest('button[data-e2e-locator="console-run-button"]'); // Selector for Run button
    const submitButton = event.target.closest('button[data-e2e-locator="console-submit-button"]'); // Selector for Submit button

    if (runButton || submitButton) {
        console.log("Run or Submit button clicked. Resetting messageShown flag..."); // Debugging
        messageShown = false; // Reset the flag
    }
});

// Set up a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        // Check if nodes were added or the subtree was modified
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
            console.log("DOM change detected. Checking for submission result..."); // Debugging
            checkForIncorrectSubmission();
        }
    }
});

// Start observing the DOM for changes
const targetNode = document.body; // Observe the entire body for changes
const config = { childList: true, subtree: true };
observer.observe(targetNode, config);

// Initial check in case the result is already displayed
console.log("Initial check for submission result..."); // Debugging
checkForIncorrectSubmission();
