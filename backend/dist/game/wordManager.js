"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomWords = getRandomWords;
const words_1 = require("./words");
const categories = Object.keys(words_1.WORDS);
function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}
function getRandomWords(count = 3) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const words = words_1.WORDS[category];
    return shuffle(words).slice(0, count);
}
