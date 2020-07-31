import { CHAT_SOUND, SERVER_SOUND } from "./constants.js";

// Sound
const chatSound = new Audio(CHAT_SOUND);
const serverSound = new Audio(SERVER_SOUND);

chatSound.volume = 0.2;
serverSound.volume = 0.2;

// Background
const canvasBG = document.getElementById("backgroundCanvas");
const contextBG = canvasBG.getContext("2d");
canvasBG.style.cursor = "default";
contextBG.canvas.width = window.innerWidth;
contextBG.canvas.height = window.innerHeight;
contextBG.imageSmoothingEnabled = false;

// Canvas
const canvas = document.getElementById("mainCanvas");
const context = canvas.getContext("2d");
canvas.style.cursor = "default";
context.canvas.width = window.innerWidth;
context.canvas.height = window.innerHeight;
context.imageSmoothingEnabled = false;

// client
const client = io();

export { canvasBG, contextBG, canvas, context, chatSound, serverSound, client }