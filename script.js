const questions = [
  {
    question: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks Text Markup Language"],
    answer: "Hyper Text Markup Language"
  },
  {
    question: "Which language is used for styling web pages?",
    options: ["HTML", "CSS", "Python"],
    answer: "CSS"
  },
  {
    question: "What does JavaScript primarily run in?",
    options: ["The server only", "The web browser", "The database"],
    answer: "The web browser"
  },
  {
    question: "Which tag is used to create a link in HTML?",
    options: ["<link>", "<a>", "<href>"],
    answer: "<a>"
  },
  {
    question: "What does CSS stand for?",
    options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System"],
    answer: "Cascading Style Sheets"
  },
  {
    question: "Which symbol is used for single-line comments in JavaScript?",
    options: ["//", "/*", "#"],
    answer: "//"
  },
  {
    question: "What does API stand for?",
    options: ["Application Programming Interface", "Advanced Program Integration", "Automated Protocol Interface"],
    answer: "Application Programming Interface"
  },
  {
    question: "Which method adds an element to the end of an array in JavaScript?",
    options: ["push()", "add()", "append()"],
    answer: "push()"
  },
  {
    question: "What is the default port for HTTP?",
    options: ["8080", "443", "80"],
    answer: "80"
  },
  {
    question: "Which HTML5 element is used for video content?",
    options: ["<media>", "<video>", "<movie>"],
    answer: "<video>"
  }
];

let currentQuestion = 0;
let score = 0;
let answered = false;
let wrongAnswers = [];
let soundEnabled = true;

// Sound effects using Web Audio API (no external files needed)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function playCorrectSound() {
  if (!soundEnabled) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(880, audioCtx.currentTime);
  osc.type = "sine";
  gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.08);
}

function playWrongSound() {
  if (!soundEnabled) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.setValueAtTime(100, audioCtx.currentTime + 0.1);
  osc.type = "sawtooth";
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.25);
}

const welcomeScreen = document.getElementById("welcomeScreen");
const quizContainer = document.getElementById("quizContainer");
const resultContainer = document.getElementById("resultContainer");
const startBtn = document.getElementById("startBtn");
const questionEl = document.getElementById("question");
const questionNumberEl = document.getElementById("questionNumber");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const scoreEl = document.getElementById("score");
const resultMessage = document.getElementById("resultMessage");
const recapList = document.getElementById("recapList");
const restartBtn = document.getElementById("restartBtn");
const liveScoreEl = document.getElementById("liveScore");
const soundToggle = document.getElementById("soundToggle");

startBtn.onclick = () => {
  if (audioCtx.state === "suspended") audioCtx.resume();
  wrongAnswers = [];
  welcomeScreen.classList.add("hidden");
  quizContainer.classList.remove("hidden");
  updateProgress();
  showQuestion();
};

soundToggle.onclick = () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
  soundToggle.classList.toggle("muted", !soundEnabled);
};

function updateProgress() {
  const pct = questions.length > 0 ? ((currentQuestion) / questions.length) * 100 : 0;
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${currentQuestion} / ${questions.length}`;
  liveScoreEl.textContent = `Score: ${score}`;
}

function showQuestion() {
  answered = false;
  nextBtn.disabled = true;

  const q = questions[currentQuestion];
  questionNumberEl.textContent = `Question ${currentQuestion + 1}`;
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";

  const shuffledOptions = shuffleArray(q.options);
  shuffledOptions.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = option;
    btn.dataset.option = option;
    btn.dataset.key = String(index + 1);
    btn.onclick = () => selectOption(btn, option, q.answer);
    optionsEl.appendChild(btn);
  });

  updateProgress();

  // Focus first option for keyboard nav
  const firstBtn = optionsEl.querySelector(".option-btn");
  if (firstBtn) firstBtn.focus();
}

function selectOption(btn, option, correctAnswer) {
  if (answered) return;
  answered = true;

  const buttons = optionsEl.querySelectorAll(".option-btn");
  buttons.forEach(b => {
    b.classList.add("disabled");
    if (b.textContent === correctAnswer) b.classList.add("correct");
    if (b === btn && option !== correctAnswer) {
      b.classList.add("incorrect");
      wrongAnswers.push({
        question: questions[currentQuestion].question,
        correct: correctAnswer
      });
    }
  });

  if (option === correctAnswer) {
    score++;
    try {
      if (audioCtx.state === "suspended") audioCtx.resume();
      playCorrectSound();
    } catch (e) {}
  } else {
    try {
      if (audioCtx.state === "suspended") audioCtx.resume();
      playWrongSound();
    } catch (e) {}
  }

  nextBtn.disabled = false;
  nextBtn.focus();
}

nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
};

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (quizContainer.classList.contains("hidden")) return;

  if (e.key === "Enter" && !nextBtn.disabled) {
    e.preventDefault();
    nextBtn.click();
    return;
  }

  if (!answered && e.key >= "1" && e.key <= "9") {
    const index = parseInt(e.key, 10) - 1;
    const btns = optionsEl.querySelectorAll(".option-btn");
    if (btns[index]) btns[index].click();
  }
});

function showResult() {
  quizContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");
  scoreEl.textContent = `${score} / ${questions.length}`;

  const pct = (score / questions.length) * 100;
  if (pct === 100) {
    resultMessage.textContent = "Perfect! You're a tech wizard. 🚀";
  } else if (pct >= 50) {
    resultMessage.textContent = "Nice work! Keep learning and you'll master it.";
  } else {
    resultMessage.textContent = "Practice makes perfect. Give it another shot!";
  }

  recapList.innerHTML = "";
  if (wrongAnswers.length > 0) {
    wrongAnswers.forEach(({ question, correct }) => {
      const div = document.createElement("div");
      div.className = "recap-item";
      div.innerHTML = `
        <p class="recap-question">${question}</p>
        <p class="recap-answer">✓ ${correct}</p>
      `;
      recapList.appendChild(div);
    });
  }
}

restartBtn.onclick = () => {
  currentQuestion = 0;
  score = 0;
  wrongAnswers = [];
  resultContainer.classList.add("hidden");
  quizContainer.classList.remove("hidden");
  showQuestion();
};
