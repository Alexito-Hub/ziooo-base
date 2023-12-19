const fs = require('fs');
const path = require('path');
const cfonts = require('cfonts');
const axios = require('axios');

const ANIMATION_INTERVAL = 120;
const MESSAGE_LIMIT = 80;

function banner() {
    const bannerConfig = {
        font: 'simple',
        align: 'center',
        gradient: ['green', 'blue']
    };
    return cfonts.render("I'm ziooo", bannerConfig).string;
}

function copyright() {
    const copyrightConfig = {
        font: 'console',
        align: 'center',
        gradient: ['green', 'blue']
    };
    return cfonts.render('All rights reserved|@zio', copyrightConfig).string;
}

const spinnerFrames = ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛'];

let globalSpinner;

const getGlobalSpinner = () => {
    if (!globalSpinner) {
        let currentFrame = 0;
        let interval;
        globalSpinner = {
            start: (text) => {
                process.stdout.write(text + ' ' + spinnerFrames[currentFrame]);
                interval = setInterval(() => {
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    currentFrame = (currentFrame + 1) % spinnerFrames.length;
                    process.stdout.write(text + ' ' + spinnerFrames[currentFrame]);
                }, ANIMATION_INTERVAL);
            },
            succeed: (text) => {
                clearInterval(interval);
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                console.log(text);
            }
        };
    }
    return globalSpinner;
};

function splitMessage(text, limit = MESSAGE_LIMIT) {
    const chunks = [];
    while (text.length > 0) {
        if (text.length <= limit) {
            chunks.push(text);
            break;
        }
        const currentChunk = text.slice(0, limit);
        chunks.push(currentChunk);
        text = text.slice(limit);
    }
    return chunks;
}

module.exports = {
    banner,
    copyright,
    splitMessage,
    getGlobalSpinner
};
