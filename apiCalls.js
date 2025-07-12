// gemini api setup :
let { GoogleGenAI, createPartFromUri } = require("@google/genai");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function generateMCQs(fileElement, questCount, difficulty) {
  const pdfBuffer = await fetch(fileElement.path).then((response) =>
    response.arrayBuffer()
  );

  const fileBlob = new Blob([pdfBuffer], { type: "application/pdf" });

  const file = await ai.files.upload({
    file: fileBlob,
    config: {
      displayName: "A17_FlightPlan.pdf",
    },
  });

  // Wait for the file to be processed.
  let getFile = await ai.files.get({ name: file.name });
  while (getFile.state === "PROCESSING") {
    getFile = await ai.files.get({ name: file.name });
    console.log(`current file status: ${getFile.state}`);
    console.log("File is still processing, retrying in 5 seconds");

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  }
  if (file.state === "FAILED") {
    throw new Error("File processing failed.");
  }

  // Add the file to the contents.
  const content = [
    ` You are an AI assistant helping the user generate multiple-choice questions (MCQs) based on the text in the provided document:
                        Please generate ${questCount} MCQs of ${difficulty} difficulty level of MCQs from the text. Each question should have:
                        - A clear question
                        - Four answer options (labeled A, B, C, D)
                        - The correct answer clearly indicated
                        Format:
                        Return the MCQs as a JSON array of objects, where each object has:
                        - "question": the question text
                        - "options": an array of four options (A, B, C, D)
                        - "correct": the correct option letter ("A", "B", "C", or "D")

                        Example:
                        [
                        {
                            question: "What was young Emma's dream?",
                            options: [
                            'A. To become a dancer',
                            'B. To become a writer',
                            'C. To become a painter',
                            'D. To become a singer'
                            ],
                            correct: 'B'
                        }
                        ...
                        ]
                        NOTE: "Return without any code block or explanation." `,
  ];

  if (file.uri && file.mimeType) {
    const fileContent = createPartFromUri(file.uri, file.mimeType);
    content.push(fileContent);
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
  });

  return response.text;
}

async function generateSummary(fileElement, summaryLength) {
  const pdfBuffer = await fetch(fileElement.path).then((response) =>
    response.arrayBuffer()
  );

  const fileBlob = new Blob([pdfBuffer], { type: "application/pdf" });

  const file = await ai.files.upload({
    file: fileBlob,
    config: {
      displayName: "A17_FlightPlan.pdf",
    },
  });

  // Wait for the file to be processed.
  let getFile = await ai.files.get({ name: file.name });
  while (getFile.state === "PROCESSING") {
    getFile = await ai.files.get({ name: file.name });
    console.log(`current file status: ${getFile.state}`);
    console.log("File is still processing, retrying in 5 seconds");

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  }
  if (file.state === "FAILED") {
    throw new Error("File processing failed.");
  }

  // Add the file to the contents.
  const content = [
    `You are an AI assistant helping the user generate a summary based on the text in the provided document.

  Please generate a ${summaryLength} summary of the content. The summary should be:
  - Clear and concise
  - Grammatically correct
  - Well-structured

  Summary length: ${summaryLength} (e.g., short = 2-3 paragraphs, medium = 4-5 paragraphs, Long = 6+ paragraphs)

  Format:
  Return the summary as plain text only.

`,
  ];

  if (file.uri && file.mimeType) {
    const fileContent = createPartFromUri(file.uri, file.mimeType);
    content.push(fileContent);
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
  });

  return response.text;
}



async function generateQuiz(fileElement, quizType) {
  const pdfBuffer = await fetch(fileElement.path).then((response) =>
    response.arrayBuffer()
  );

  const fileBlob = new Blob([pdfBuffer], { type: "application/pdf" });

  const file = await ai.files.upload({
    file: fileBlob,
    config: {
      displayName: "A17_FlightPlan.pdf",
    },
  });

  // Wait for the file to be processed.
  let getFile = await ai.files.get({ name: file.name });
  while (getFile.state === "PROCESSING") {
    getFile = await ai.files.get({ name: file.name });
    console.log(`current file status: ${getFile.state}`);
    console.log("File is still processing, retrying in 5 seconds");

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  }
  if (file.state === "FAILED") {
    throw new Error("File processing failed.");
  }

  // Add the file to the contents.
const content = [
  `You are an AI assistant helping a user generate a quiz based on the content of the provided document.

  The user has requested a "${quizType}" quiz. Please follow these instructions:

  ---
  ✅ Quiz Type: ${quizType}

  • If "multiple-choice":
      - Generate 4-option MCQs.
      - Each question must include:
        - A clear question
        - Four answer choices labeled A, B, C, D
        - The correct option indicated as a single letter ("A", "B", "C", or "D")

  • If "true-false":
      - Generate questions with a statement and the correct answer as "True" or "False".

  • If "short-answer":
      - Generate direct short-answer questions.
      - Each question should include a concise correct answer (1-2 lines).

  • If "mix":
      - Generate a variety of all the above types (multiple-choice, true/false, short-answer).
      - Clearly identify the type of each question in the response.

  ---
  ✅ Format:
  Return the questions as a JSON array of objects. Each object should have:

  - "type": "multiple-choice" | "true-false" | "short-answer"
  - "question": the question text
  - For multiple-choice:
    - "options": array of options (A–D)
    - "correct": correct option letter
  - For true-false:
    - "correct": "True" or "False"
  - For short-answer:
    - "correct": string (short answer)

  Example output:
  [
    {
      "type": "multiple-choice",
      "question": "What is the capital of France?",
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "correct": "A"
    },
    {
      "type": "true-false",
      "question": "The sun rises in the west.",
      "correct": "False"
    },
    {
      "type": "short-answer",
      "question": "Who developed the theory of relativity?",
      "correct": "Albert Einstein"
    }
  ]
     NOTE:Return only valid JSON. Do not wrap in backticks or any other formatting.
`,
];


  if (file.uri && file.mimeType) {
    const fileContent = createPartFromUri(file.uri, file.mimeType);
    content.push(fileContent);
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
  });

  return response.text;
}

module.exports = { generateMCQs, generateSummary, generateQuiz };
