function filterFeatures() {
  const searchTerm = document.getElementById("tab-search").value.toLowerCase();
  const featureGridCards = document.querySelectorAll(
    "#features-main .feature-card"
  );

  featureGridCards.forEach((card) => {
    const title = card
      .querySelector(".feature-title")
      .textContent.toLowerCase();
    card.style.display = title.includes(searchTerm) ? "flex" : "none";
  });
}

function openTab(evt, tabId) {
  document.querySelectorAll(".feature-card").forEach((card) => {
    card.classList.remove("active");
  });
  document
    .querySelectorAll(".content-section > .feature-card")
    .forEach((tab) => {
      tab.classList.add("hidden");
    });
  document.getElementById(tabId).classList.remove("hidden");
  evt.currentTarget.classList.add("active");
}

// File upload handling
function handleFileSelect() {
  const fileInput = document.getElementById("file-upload");
  const fileDetails = document.getElementById("file-details");
  const dropText = document.getElementById("drop-text");
  // const generateBtn = document.getElementById("generate-btn");

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    fileDetails.innerHTML = `
                    <p><strong>File:</strong> ${file.name}</p>
                    <p><strong>Size:</strong> ${(file.size / 1024).toFixed(
                      2
                    )} KB</p>
                    <p><strong>Type:</strong> ${
                      file.type || file.name.split(".").pop().toUpperCase()
                    }</p>
                `;
    fileDetails.classList.remove("hidden");
    dropText.classList.add("hidden");
    // generateBtn.disabled = false;
  }
}
function handleFileDrop(evt) {
  evt.preventDefault();
  document.getElementById("drop-area").classList.remove("dragover");

  const fileInput = document.getElementById("file-upload");
  fileInput.files = evt.dataTransfer.files;
  handleFileSelect();
}

function resetForm() {
  // alert("Reset button clicked");
  document.getElementById("file-upload").value = "";
  document.getElementById("file-details").classList.add("hidden");
  document.getElementById("drop-text").classList.remove("hidden");

  //         // Reset number of questions
  // document.getElementById("question-count").value = 5;

  // // Reset difficulty level
  // document.getElementById("difficulty").value = "medium";

  // document.getElementById("generate-btn").disabled = true;
}




function generateMCQs() {
  const fileInput = document.getElementById("file-upload");
  if (!fileInput.files.length) {
    alert("Please select a file first");
    return;
  }

  const questionCount = document.getElementById("question-count").value;
  const difficulty = document.getElementById("difficulty").value;

  // In a real app, you would send this to your backend
  confirm(
    `Generating ${questionCount} ${difficulty} level MCQs from selected file`
  );
  return;
  // Here you would typically show a loading state
  // and then display the generated MCQs
}



// for summary :
function handleFileSelectSummary() {
  const fileInput = document.getElementById("file-upload-summary");
  const fileDetails = document.getElementById("file-details-summary");
  const dropText = document.getElementById("drop-text-summary");
  // const generateBtn = document.getElementById("generate-btn-summary");

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    fileDetails.innerHTML = `
                    <p><strong>File:</strong> ${file.name}</p>
                    <p><strong>Size:</strong> ${(file.size / 1024).toFixed(
                      2
                    )} KB</p>
                    <p><strong>Type:</strong> ${
                      file.type || file.name.split(".").pop().toUpperCase()
                    }</p>
                `;
    fileDetails.classList.remove("hidden");
    dropText.classList.add("hidden");
    // generateBtn.disabled = false;
  }
}
function handleFileDropSummary(evt) {
  evt.preventDefault();
  document.getElementById("drop-area-summary").classList.remove("dragover");

  const fileInput = document.getElementById("file-upload-summary");
  fileInput.files = evt.dataTransfer.files;
  handleFileSelectSummary();
}
function resetFormSummary() {
  // alert("Reset button clicked");
  document.getElementById("file-upload-summary").value = "";
  document.getElementById("file-details-summary").classList.add("hidden");
  document.getElementById("drop-text-summary").classList.remove("hidden");
}

function generateSummary() {
  const fileInput = document.getElementById("file-upload-summary");
  if (!fileInput.files.length) {
    alert("Please select a file first");
    return;
  }

  const summaryLength = document.getElementById("summary-length").value;

  // In a real app, you would send this to your backend
  confirm(
    `Generating ${summaryLength} Length of Summary from selected file`
  );
  return;
  // Here you would typically show a loading state
  // and then display the generated MCQs
}




// for Quiz :
function handleFileSelectQuiz() {
  const fileInput = document.getElementById("file-upload-quiz");
  const fileDetails = document.getElementById("file-details-quiz");
  const dropText = document.getElementById("drop-text-quiz");
  // const generateBtn = document.getElementById("generate-btn");

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    fileDetails.innerHTML = `
                    <p><strong>File:</strong> ${file.name}</p>
                    <p><strong>Size:</strong> ${(file.size / 1024).toFixed(
                      2
                    )} KB</p>
                    <p><strong>Type:</strong> ${
                      file.type || file.name.split(".").pop().toUpperCase()
                    }</p>
                `;
    fileDetails.classList.remove("hidden");
    dropText.classList.add("hidden");
    // generateBtn.disabled = false;
  }
}
function handleFileDropQuiz(evt) {
  evt.preventDefault();
  document.getElementById("drop-area-quiz").classList.remove("dragover");

  const fileInput = document.getElementById("file-upload-quiz");
  fileInput.files = evt.dataTransfer.files;
  handleFileSelectQuiz();
}
function resetFormQuiz() {
  // alert("Reset button clicked");
  document.getElementById("file-upload-quiz").value = "";
  document.getElementById("file-details-quiz").classList.add("hidden");
  document.getElementById("drop-text-quiz").classList.remove("hidden");
}

function generateQuiz() {
  const fileInput = document.getElementById("file-upload-quiz");
  if (!fileInput.files.length) {
    alert("Please select a file first");
    return;
  }

  const quizType = document.getElementById("quiz-type").value;

  // In a real app, you would send this to your backend
  confirm(
    `Generating ${quizType} Quiz from selected file`
  );
  return;
  // Here you would typically show a loading state
  // and then display the generated MCQs
}





// Initialize - same as window.onload
document.addEventListener("DOMContentLoaded", () => {
  resetForm();

  // Allow multiple tabs to have pointer events for drag/drop
  document.querySelectorAll(".drop-area").forEach((area) => {
    area.addEventListener("dragover", (e) => {
      e.preventDefault();
      area.classList.add("dragover");
    });

    area.addEventListener("dragleave", () => {
      area.classList.remove("dragover");
    });
  });
});
