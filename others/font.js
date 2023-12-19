const cfonts = require("cfonts");

function banner() {
    const bannerConfig = {
        font: "simple",
        align: "center",
        gradient: ["green", "blue"]
    };
    return cfonts.render("I'm ziooo", bannerConfig).string;
}

function copyright() {
    const copyrightConfig = {
        font: "console",
        align: "center",
        gradient: ["green", "blue"]
    };
    return cfonts.render("All rights reserved|@zio", copyrightConfig).string;
}

module.exports = {
    banner,
    copyright
};
