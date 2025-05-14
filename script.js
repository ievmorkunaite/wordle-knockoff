const ANSWER_LENGTH = 5;
const ROUNDS = 6;
let currLetter = 0;
let currRow = 0;
let responseWord;
let answerLetters;
let allCorrect = false;
const loadSpinner = document.querySelector(".load-indication");
let isLoading = true;

const init = async () => {
  //* get the answer of the day and prep for checking
  setLoading(isLoading);
  const response = await fetch("https://words.dev-apis.com/word-of-the-day");
  const processedResponse = await response.json();
  responseWord = processedResponse.word;
  answerLetters = responseWord.split("");
  isLoading = false;
  setLoading(isLoading);

  //* user inputs the letters
  document.addEventListener("keydown", function (event) {
    if (allCorrect || isLoading) {
      return;
    }
    handleKeyboardClack(event.key);
  });

  document.querySelector(".keys").addEventListener("click", function (event) {
    if (allCorrect || isLoading) {
      return;
    }
    handleScreenClick(event.target.innerText);
  });

  const toggler = document.querySelector(".offscreen");
  toggler.addEventListener("click", () => {
    addDarkMode();
  });
};

//* darkmode
const addDarkMode = () => {
  const fullscreen = document.querySelector("body");

  fullscreen.classList.toggle("dark");
};

const handleKeyboardClack = (value) => {
  if (isLetter(value)) {
    inputNextLetter(value);
  } else if (value === "Enter") {
    validateAnswer();
  } else if (value === "Backspace") {
    deleteLetter();
  }
};

const handleScreenClick = (value) => {
  if (isLetter(value)) {
    const lowercaseValue = value.toLowerCase();
    inputNextLetter(lowercaseValue);
  } else if (value === "ENTER") {
    validateAnswer();
  } else if (value === "DEL") {
    deleteLetter();
  } else {
    return;
  }
};

const isLetter = (letter) => {
  return /^[a-zA-Z]$/.test(letter);
};

const inputNextLetter = (letter) => {
  if (currLetter < 5) {
    document.getElementById(
      `letter-${ANSWER_LENGTH * currRow + currLetter + 1}`
    ).innerHTML = letter;
    currLetter++;
  } else {
    document.getElementById(
      `letter-${ANSWER_LENGTH * currRow + currLetter}`
    ).innerHTML = letter;
  }
};

const validateAnswer = async () => {
  //* if answer is less than 5 letters, do nothing:
  if (currLetter < 5) {
    return;
  }

  //* check that it's an actual word:
  // make word:
  let currWord = "";
  for (let i = 1; i <= 5; i++) {
    // change the letter number to have i
    inputLetter = document.getElementById(
      `letter-${ANSWER_LENGTH * currRow + i}`
    ).innerHTML;

    //put it in a string
    currWord += inputLetter;
  }

  isLoading = true;
  setLoading(isLoading);

  const response = await fetch("https://words.dev-apis.com/validate-word", {
    method: "POST",
    body: JSON.stringify({ word: currWord }),
  });
  const { validWord } = await response.json();
  isLoading = false;
  setLoading(isLoading);
  if (!validWord) {
    markInvalid();
    return;
  }

  //* check if answer is correct:
  checkLetters();

  if (allCorrect) {
    const winnerAnimation = document.querySelector(".name");
    winnerAnimation.classList.add("winner");
    const dialog = document.querySelector(".winning-dialog");
    const closeButton = document.querySelector(".close-btn");

    dialog.showModal();
    closeButton.addEventListener("click", () => {
      dialog.close();
    });
  }

  //* lost the game:
  if (currRow === ROUNDS - 1 && !allCorrect) {
    alert(
      `you lose you loser, heres a fricken popup for your troubles. the word was "${responseWord}", if you even care. idiot`
    );
  }

  //* mark keyboard letters
  for (let i = 0; i < ANSWER_LENGTH; i++) {
    const inputLetter = document.getElementById(
      `letter-${ANSWER_LENGTH * currRow + i + 1}`
    ).innerHTML;
    const markedLetter = document.getElementById(`key-letter-${inputLetter}`);
    const inputElement = document.getElementById(
      `letter-${ANSWER_LENGTH * currRow + i + 1}`
    );
    //green
    if (inputElement.classList.contains("correct-letter")) {
      setTimeout(
        () => markedLetter.classList.add("marked-right", "guess-animation-1"),
        300
      );
    }
    //yellow
    else if (inputElement.classList.contains("wrong-place")) {
      setTimeout(
        () => markedLetter.classList.add("marked-almost", "guess-animation-1"),
        300
      );
    }
    //gray
    else {
      setTimeout(
        () => markedLetter.classList.add("marked-wrong", "guess-animation-1"),
        300
      );
    }
  }

  currLetter = 0;
  currRow++;
};

const deleteLetter = () => {
  if (currLetter > 0) {
    document.getElementById(
      `letter-${ANSWER_LENGTH * currRow + currLetter}`
    ).innerHTML = "";
    currLetter--;
  }
};

const checkLetters = () => {
  let inputLetter = "";
  let answerLetter = "";
  let correctCount = 0;

  //* add green letters:
  for (let i = 1; i <= 5; i++) {
    // change the letter number to have i
    inputLetter = document.getElementById(
      `letter-${ANSWER_LENGTH * currRow + i}`
    ).innerHTML;
    answerLetter = answerLetters[i - 1];

    //color the tile green
    if (inputLetter == answerLetter) {
      const correct = document.getElementById(
        `letter-${ANSWER_LENGTH * currRow + i}`
      );
      correct.classList.add("correct-letter");
      correctCount++;
    }
  }
  //* add yellow letters
  for (let i = 1; i <= 5; i++) {
    // change the letter number to have i
    inputLetter = document.getElementById(
      `letter-${ANSWER_LENGTH * currRow + i}`
    ).innerHTML;

    answerLetter = answerLetters[i - 1];

    // color the tile yellow
    if (answerLetters.includes(inputLetter)) {
      const almost = document.getElementById(
        `letter-${ANSWER_LENGTH * currRow + i}`
      );
      almost.classList.add("wrong-place");
    }
  }

  //* add gray letters
  for (let i = 1; i <= 5; i++) {
    // change the letter number to have i
    inputLetter = document.getElementById(
      `letter-${ANSWER_LENGTH * currRow + i}`
    ).innerHTML;

    answerLetter = answerLetters[i - 1];

    // color the tile gray
    if (!answerLetters.includes(inputLetter)) {
      const wronk = document.getElementById(
        `letter-${ANSWER_LENGTH * currRow + i}`
      );
      wronk.classList.add("wrong-letter");
      allCorrect = false;
    }
  }

  //* add guess animation class
  for (let i = 1; i <= 5; i++) {
    inputLetter = document.getElementById(
      `letter-${ANSWER_LENGTH * currRow + i}`
    ).innerHTML;

    answerLetter = answerLetters[i - 1];

    const guessAnimation = document.getElementById(
      `letter-${ANSWER_LENGTH * currRow + i}`
    );
    guessAnimation.classList.add(`guess-animation-${i}`);
  }

  if (correctCount === 5) {
    allCorrect = true;
  }
};

const setLoading = (isLoading) => {
  loadSpinner.classList.toggle("hidden", !isLoading);
};

const markInvalid = () => {
  for (let i = 0; i < ANSWER_LENGTH; i++) {
    document
      .getElementById(`letter-${ANSWER_LENGTH * currRow + i + 1}`)
      .classList.remove("invalid");

    setTimeout(
      () =>
        document
          .getElementById(`letter-${ANSWER_LENGTH * currRow + i + 1}`)
          .classList.add("invalid"),
      10
    );
  }
};

init();
