// Reset the file input field when the page loads
window.onload = function () {
  const fileInput = document.getElementById("file-upload");
  const dropArea = document.getElementById("drop-area");
  const submitButton = document.getElementById("submit-btn");

  // Reset file input and UI
  fileInput.value = "";
  dropArea.innerHTML = `<p>Drag and drop your file here or click to select</p>`;
  submitButton.classList.remove("active");
  submitButton.disabled = true;
};

function toggleMenu() {
  const navbar = document.querySelector(".navbar");
  navbar.classList.toggle("active");
}

function handleFileSelect() {
  const fileInput = document.getElementById("file-upload");
  const submitButton = document.getElementById("submit-btn");
  const dropArea = document.getElementById("drop-area");
  if (fileInput.files.length > 0) {
    const fileName = fileInput.files[0].name;
    dropArea.innerHTML = `<p>${fileName}</p>`;

    submitButton.classList.add("active");
    submitButton.disabled = false;
  } else {
    dropArea.innerHTML = `<p>Drag and drop your file here or click to select</p>`;
    submitButton.classList.remove("active");
    submitButton.disabled = true;
  }
}

function handleFileDrop(event) {
  event.preventDefault();
  const fileInput = document.getElementById("file-upload");
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    handleFileSelect();
  }
  const dropArea = document.getElementById("drop-area");
  dropArea.classList.remove("dragover");
}

function validateFileSize() {
  const fileInput = document.getElementById("file-upload"); // Corrected ID
  if (!currUser) {
    fileInput.value = "";
    
    alert("Please login first");
    return false;
  }
  const file = fileInput.files[0];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (file && file.size > maxSize) {
    alert("File is too large. Please upload a file smaller than 5MB.");
    fileInput.value = ""; // Clear the file input
    return false; // Prevent form submission
  }
  return true; // Allow form submission
}
