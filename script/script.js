"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const btnOpenModal = document.querySelector("#btnOpenModal");
  const modalBlock = document.querySelector("#modalBlock");
  const closeModal = document.querySelector("#closeModal");
  const questionTitle = document.querySelector("#question");
  const formAnswers = document.querySelector("#formAnswers");
  const prevButton = document.querySelector("#prev");
  const nextButton = document.querySelector("#next");
  const sendButton = document.querySelector("#send");

  const firebaseConfig = {
    apiKey: "-",
    authDomain: "-",
    databaseURL:
      "-",
    projectId: "-",
    storageBucket: "-",
    messagingSenderId: "-",
    appId: "-",
  };

  firebase.initializeApp(firebaseConfig);

  const getData = () => {
    formAnswers.textContent = "LOAD";
    nextButton.classList.add("d-none");
    prevButton.classList.add("d-none");

    setTimeout(() => {
      firebase
        .database()
        .ref()
        .child("questions")
        .once("value")
        .then((snap) => playTest(snap.val()))
        .catch((err) => {
          console.error(err);
          formAnswers.textContent = "Помилка завантаження даних";
        });
    }, 500);
  };

  btnOpenModal.addEventListener("click", () => {
    modalBlock.classList.add("d-block");
    getData();
  });

  closeModal.addEventListener("click", () => {
    modalBlock.classList.remove("d-block");
  });

  const playTest = (questions) => {
    const finalAnswers = [];
    let numberQuestion = 0;

    const renderAnswers = (index) => {
      questions[index].answers.forEach((answer) => {
        const answerItem = document.createElement("div");
        answerItem.classList.add("answers-item", "d-flex", "flex-column");

        answerItem.innerHTML = `
                    <input type="${questions[index].type}" id="${answer.title}" name="answer" class="d-none" value="${answer.title}">
                    <label for="${answer.title}" class="d-flex flex-column justify-content-between">
                        <img class="answerImg" src="${answer.url}" alt="burger">
                        <span>${answer.title}</span>
                    </label>
                `;

        formAnswers.appendChild(answerItem);
      });
    };

    const renderQuestions = (indexQuestion) => {
      formAnswers.innerHTML = "";

      switch (true) {
        case numberQuestion === 0:
          questionTitle.textContent = `${questions[indexQuestion].question}`;
          renderAnswers(indexQuestion);
          nextButton.classList.remove("d-none");
          prevButton.classList.add("d-none");
          sendButton.classList.add("d-none");
          break;

        case numberQuestion > 0 && numberQuestion <= questions.length - 1:
          questionTitle.textContent = `${questions[indexQuestion].question}`;
          renderAnswers(indexQuestion);
          nextButton.classList.remove("d-none");
          prevButton.classList.remove("d-none");
          sendButton.classList.add("d-none");
          break;

        case numberQuestion === questions.length:
          questionTitle.textContent = "";
          nextButton.classList.add("d-none");
          prevButton.classList.add("d-none");
          sendButton.classList.remove("d-none");

          formAnswers.innerHTML = `
                    <div class="input-group-prepend">
                        <span class="input-group-text" id="numberPhon">Введіть номер телефону</span>
                    </div>
                    <input type="text" id="numberPhon" class="form-control" placeholder="Номер телефону" aria-label="Username" aria-describedby="basic-addon1">
                `;
          break;

        case numberQuestion === questions.length + 1:
          sendButton.classList.add("d-none");
          formAnswers.textContent =
            "Дякуємо за вибір! Наш менеджер Вам зателефонує!";
          setTimeout(() => {
            modalBlock.classList.remove("d-block");
          }, 2000);
          break;
      }
    };

    renderQuestions(numberQuestion);

    const checkAnswers = () => {
      const obj = {};

      const inputs = [...formAnswers.elements].filter(
        (input) => input.checked || input.id === "numberPhon",
      );

      inputs.forEach((input, index) => {
        if (numberQuestion >= 0 && numberQuestion <= questions.length - 1) {
          obj[`${index}_${questions[numberQuestion].question}`] = input.value;
        }

        if (numberQuestion === questions.length) {
          obj["Номер телефону"] = input.value;
        }
      });

      finalAnswers.push(obj);
    };

    prevButton.onclick = () => {
      numberQuestion--;
      renderQuestions(numberQuestion);
    };

    nextButton.onclick = () => {
      checkAnswers();
      numberQuestion++;
      renderQuestions(numberQuestion);
    };

    sendButton.onclick = () => {
      checkAnswers();
      numberQuestion++;
      renderQuestions(numberQuestion);
      firebase.database().ref().child("contacts").push(finalAnswers);
    };
  };
});
