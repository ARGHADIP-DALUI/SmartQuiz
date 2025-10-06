let quizData = {}; // To be loaded from questions.json

document.addEventListener("DOMContentLoaded", async () => { // ✅ async for await
  // ----- Load questions from JSON -----
  try {
    const response = await fetch("questions.json");
    quizData = await response.json();
  } catch (error) {
    console.error("Failed to load quiz questions:", error);
    alert("Quiz questions could not be loaded.");
    return;
  }

  // ----- INDEX PAGE LOGIC -----
  if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/")) {
    const buttons = document.querySelectorAll("section button");
    if (buttons.length > 0) {
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const category = btn.previousElementSibling.textContent;
          window.location.href = `quiz.html?category=${category}`;
        });
      });
    }
  }

  // ----- QUIZ PAGE LOGIC -----
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");
  const feedback = document.getElementById("feedback");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const timerEl = document.getElementById("timer");

  if (questionText && optionsContainer) {

    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    let questions = [];
    if (category && quizData[category]) {
      questions = [...quizData[category]].sort(() => Math.random() - 0.5);
    }

    let currentQuestionIndex = 0;
    let score = 0;

    // ============ TIMER LOGIC ============
    let timeLimit = category === "Computer Science" ? 90 : category === "General Knowledge" ? 60 : 75;
    let timer;

    function startTimer() {
      let remainingTime = timeLimit;
      timerEl.textContent = formatTime(remainingTime);
      timerEl.style.color = "white";

      timer = setInterval(() => {
        remainingTime--;
        timerEl.textContent = formatTime(remainingTime);

        if (remainingTime <= 10) {
          timerEl.style.color = remainingTime % 2 === 0 ? "red" : "darkred";
        }

        if (remainingTime <= 0) {
          clearInterval(timer);
          alert("⏰ Time's up! Submitting your quiz...");
          endQuiz();
        }
      }, 1000);
    }

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    function stopTimer() { clearInterval(timer); }

    // ============ QUIZ FLOW ============
    function loadQuestion() {
      if (!questions || currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
      }

      const q = questions[currentQuestionIndex];
      questionText.textContent = q.question.replace(/^\s*\d+\.\s*/, '');
      optionsContainer.innerHTML = "";
      feedback.textContent = "";

      q.options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option, q.answer);
        optionsContainer.appendChild(btn);
      });

      prevBtn.disabled = currentQuestionIndex === 0;
      nextBtn.disabled = currentQuestionIndex === questions.length - 1;

      const progressEl = document.getElementById("progress-bar");
      if (progressEl) progressEl.style.width = `${((currentQuestionIndex+1)/questions.length)*100}%`;
    }

    function checkAnswer(selected, correct) {
      if (selected === correct) {
        score++;
        feedback.textContent = "✅ Correct!";
        feedback.style.color = "green";
      } else {
        feedback.textContent = "❌ Wrong!";
        feedback.style.color = "red";
      }

      currentQuestionIndex++;
      setTimeout(() => {
        feedback.textContent = "";
        loadQuestion();
      }, 800);
    }

    function endQuiz() {
      stopTimer();
      document.querySelector(".quiz-box").style.display = "none";
      const resultBox = document.getElementById("result-box");
      resultBox.style.display = "block";

      document.getElementById("final-score").textContent = `Your Score: ${score}/${questions.length}`;
      const percentage = ((score / questions.length) * 100).toFixed(2);
      document.getElementById("final-percentage").textContent = `Percentage: ${percentage}%`;
    }

    // Navigation
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
          currentQuestionIndex--;
          loadQuestion();
        }
      });

      nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < questions.length - 1) {
          currentQuestionIndex++;
          loadQuestion();
        }
      });
    }

    // --- START QUIZ ---
    if (category) {
      loadQuestion();
      startTimer();
    } else {
      questionText.textContent = "No category selected.";
    }

    // ----- HOME BUTTON -----
    const homeBtn = document.getElementById("home-btn");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        window.location.href = "index.html";
      });
    }

  }

});
