const { app, BrowserWindow } = require('electron');
const path = require('path');
const watchLauchFromIPC = require("./nodejs/watchLauchFromIPC");

function createWindow() {
    // 创建浏览器窗口
    let win = new BrowserWindow({
        resizable: true,
        frame: false,
        webPreferences: {
            nodeIntegration: false,
            webSecurity: false,
            preload: path.join(__dirname, './preload.js'),
            contextIsolation: true
        }
    });

    //  默认最大化
    win.maximize();

    // win.webContents.openDevTools();

    // 开发模式
    if (process.env.NODE_ENV == 'development') {
        win.loadURL('http://localhost:3000/');
    }

    // 生产模式
    else {
        win.loadFile('./dist/index.html');
    }

    return win;

}

let win;
app.whenReady().then(() => {

    // 系统托盘
    require('./nodejs/trayLaunch.js')();

    // 创建主界面
    win = createWindow();

    // 监听来自主界面的请求
    require('./nodejs/ipcMain.on.js')(win);

    let hadLoad = false;
    win.on("ready-to-show", () => {
        if (process.platform !== "darwin") {

            if (process.argv.length > 1 && !hadLoad) {
                hadLoad = true;

                const filePath = process.argv[process.argv.length - 1];

                // 开发启动的时候传递了一个"."，这种情况需要排除一下 
                if (filePath && filePath != ".") {
                    watchLauchFromIPC(win, "file:///" + (filePath.replace(/\\/g, "/")));
                }
            }
        }

    });

});

// macos ipc 文件启动
app.on("will-finish-launching", () => {
    app.on("open-file", (event, filePath) => {
        event.preventDefault();

        setTimeout(() => {
            watchLauchFromIPC(win, "file:///" + filePath);
        }, 500);
    });
});

app.on('window-all-closed', () => {
    // 点击关闭按钮，直接退出
    app.quit();
});

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
