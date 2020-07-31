export const SEND_RATE = 20;
export const CHAT_SOUND = 'resources/sounds/chat_message.wav'
export const SERVER_SOUND = 'resources/sounds/server_message.wav'

// Regexp
const BOLD_REGEXP = /\*{2}(.*?)\*{2}/gm;
const ITALICS_REGEXP = /\*(.*?)\*/gm;
const DEVIL_REGEXP = /_(.*?)_/gm;

export const regexp = { BOLD_REGEXP, ITALICS_REGEXP, DEVIL_REGEXP };