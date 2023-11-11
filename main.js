"use strict";
const fs = require("fs");
const prompt = require("prompt-sync")();
const userInput = prompt("enter your search :  ");
const lucene = require("lucene");

const spaceRegex = new RegExp("\\s+");
const wordMap = new Map();

const documents = [
  "A-Christmas.txt",
  "Alices.txt",
  "Dracula.txt",
  "Romeo-and-Juliet.txt",
  "The-Great-Gatsby.txt",
];

function AND(left_array, right_array, NOT_AND = false) {
  if (NOT_AND) {
    return left_array.filter((el) => !right_array.includes(el));
  } else {
    return left_array.filter((el) => right_array.includes(el));
  }
}

function OR(left_array, right_array) {
  return [...new Set([...left_array, ...right_array])];
}

const createInvertedIndex = () => {
  for (let index in documents) {
    const words = fs
      .readFileSync(`./documents/${documents[index]}`)
      .toString()
      .split(spaceRegex)
      .filter((el) => el.trim() !== "");
    for (let word of words) {
      if (![undefined, null, ""].includes(wordMap.get(word))) {
        wordMap.set(
          word,
          wordMap.get(word).includes(index)
            ? wordMap.get(word)
            : [...wordMap.get(word), index]
        );
      } else {
        wordMap.set(word, [index]);
      }
    }
  }

  if (lucene.parse(userInput).operator == "AND") {
    return AND(
      wordMap.get(lucene.parse(userInput).left.term),
      wordMap.get(lucene.parse(userInput).right.term)
    );
  } else if (lucene.parse(userInput).operator == "OR") {
    return OR(
      wordMap.get(lucene.parse(userInput).left.term),
      wordMap.get(lucene.parse(userInput).right.term)
    );
  } else if (lucene.parse(userInput).operator == "NOT") {
    return AND(
      wordMap.get(lucene.parse(userInput).left.term),
      wordMap.get(lucene.parse(userInput).right.term),
      true
    );
  }
  return wordMap.get(userInput) || "not found";
};

console.log(createInvertedIndex());
