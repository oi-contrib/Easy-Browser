module.exports = function (win, filePath) {

    setTimeout(() => {
        win.webContents.send("reset-nav", {
            url: filePath
        });

    }, 1000);
};