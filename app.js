const dialogue = "Hi! My name is Anna. What's your name? Hi, Anna. I'm John. Nice to meet you. Nice to meet you too. Where are you from? I'm from Spain. I live in Cartagena.";

let completed = new Set();
let errors = JSON.parse(localStorage.getItem("ewj_errors") || "[]");

function speak(text, rate = 0.82) {
  if (!("speechSynthesis" in window)) {
    alert("Tu navegador no permite síntesis de voz.");
    return;
  }

  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB";
  u.rate = rate;
  u.volume = 1;

  window.speechSynthesis.speak(u);
}

function completeStep(n) {
  completed.add(n);

  document.getElementById("bar").style.width =
    (completed.size * 20) + "%";

  document.getElementById("progressText").textContent =
    "Progreso: " + completed.size + " de 5 pasos";
}

function addError(text) {
  if (!errors.includes(text)) {
    errors.unshift(text);
    localStorage.setItem("ewj_errors", JSON.stringify(errors));
    renderErrors();
  }
}

function renderErrors() {
  const box = document.getElementById("errors");

  if (!errors.length) {
    box.innerHTML = "<p>🎉 Todavía no tienes errores guardados.</p>";
    return;
  }

  box.innerHTML = errors.map(function (x) {
    return '<div class="error">❌ ' + x + "</div>";
  }).join("");
}

function createRecognition(callback) {
  const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!Recognition) return null;

  const recognition = new Recognition();

  recognition.lang = "en-GB";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = function (event) {
    callback(event.results[0][0].transcript);
  };

  return recognition;
}

document.getElementById("listenBtn").addEventListener("click", function () {
  speak(dialogue);
  completeStep(1);
});

document.getElementById("slowBtn").addEventListener("click", function () {
  speak(dialogue, 0.58);
  completeStep(1);
});

document.getElementById("questionBtn").addEventListener("click", function () {
  speak("What's your name?");
});

document.getElementById("modelBtn").addEventListener("click", function () {
  speak("My name is Jose. I'm from Spain.");
});

document.querySelectorAll(".option").forEach(function (button) {
  button.addEventListener("click", function () {
    const feedback =
      document.getElementById("listenFeedback");

    feedback.style.display = "block";

    if (button.dataset.a === "spain") {
      feedback.textContent =
        "✅ Correct! John is from Spain.";

      feedback.className =
        "feedback success";

      completeStep(2);
    } else {
      feedback.innerHTML =
        "❌ Not quite. John says: <b>I'm from Spain.</b>";

      feedback.className =
        "feedback";

      addError("Listening: practicar “I'm from Spain”.");
    }
  });
});

document.getElementById("speakBtn").addEventListener("click", function () {
  const status =
    document.getElementById("voiceStatus");

  const feedback =
    document.getElementById("voiceFeedback");

  const recognition =
    createRecognition(function (text) {
      status.textContent =
        'Has dicho: "' + text + '"';

      feedback.style.display =
        "block";

      if (/name|my name|i'm/i.test(text)) {
        feedback.innerHTML =
          "✅ Muy bien. Has dado una respuesta relacionada con tu nombre.";

        feedback.className =
          "feedback success";

        completeStep(3);
      } else {
        feedback.innerHTML =
          '👍 Te he entendido. Prueba con: <b>My name is Jose.</b>';

        feedback.className =
          "feedback";

        addError('Speaking: practicar "My name is..."');
      }
    });

  if (!recognition) {
    status.textContent =
      "El reconocimiento de voz no está disponible en este navegador.";

    return;
  }

  recognition.onstart = function () {
    status.textContent =
      "🎙️ Habla ahora...";
  };

  recognition.onerror = function (event) {
    status.textContent =
      event.error === "not-allowed"
        ? "⚠️ Debes permitir el uso del micrófono."
        : "No he podido reconocerte. Inténtalo otra vez.";
  };

  recognition.start();
});

document.getElementById("checkConversation").addEventListener("click", function () {
  const text =
    document.getElementById("conversation")
      .value
      .toLowerCase()
      .trim();

  const feedback =
    document.getElementById("conversationFeedback");

  feedback.style.display =
    "block";

  if (
    text.includes("from") ||
    text.includes("spain")
  ) {
    feedback.textContent =
      "✅ Muy bien. Respuesta correcta.";

    feedback.className =
      "feedback success";

    completeStep(4);
  } else {
    feedback.innerHTML =
      "⚠️ Prueba con: <b>I'm from Spain.</b>";

    feedback.className =
      "feedback";

    addError(
      'Conversation: practicar "I\'m from + country".'
    );
  }
});

document.getElementById("repeatSpeakBtn").addEventListener("click", function () {
  const feedback =
    document.getElementById("repeatFeedback");

  const recognition =
    createRecognition(function (text) {
      feedback.style.display =
        "block";

      if (
        /name/i.test(text) &&
        /from/i.test(text)
      ) {
        feedback.textContent =
          "🎉 Excellent! Lección 1 completada.";

        feedback.className =
          "feedback success";

        completeStep(5);
      } else {
        feedback.innerHTML =
          'Buen intento. Repite: <b>My name is Jose. I\'m from Spain.</b>';

        feedback.className =
          "feedback";

        addError(
          "Repetición: practicar la presentación completa."
        );
      }
    });

  if (!recognition) {
    feedback.style.display =
      "block";

    feedback.textContent =
      "El reconocimiento de voz no está disponible.";

    return;
  }

  recognition.start();
});

document.getElementById("clearErrors").addEventListener("click", function () {
  errors = [];

  localStorage.removeItem("ewj_errors");

  renderErrors();
});

renderErrors();
