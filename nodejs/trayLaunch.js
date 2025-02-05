const { Tray, Menu, nativeImage, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const pkgInfo = require('../package.json');

let tray;
module.exports = function () {

    const icon = nativeImage.createFromPath(path.join(__dirname, "../images/logo16.png"));
    tray = new Tray(icon);

    // https://www.electronjs.org/zh/docs/latest/api/menu-item
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '屏幕画笔',
            type: 'normal',
            icon: path.join(__dirname, "../images/painter16.png"),
            click() {
                let win_painter = new BrowserWindow({
                    resizable: true,
                    frame: false,
                    transparent: true,
                    alwaysOnTop: true,
                    webPreferences: {
                        nodeIntegration: false,
                        webSecurity: true,
                        preload: path.join(__dirname, '../preload.js'),
                        contextIsolation: true
                    }
                });

                win_painter.on("focus", () => {
                    Menu.setApplicationMenu(Menu.buildFromTemplate([{
                        label: 'Easy Browser',
                        submenu: [{
                            label: '关闭',
                            accelerator: 'CmdOrCtrl+Q',
                            click: () => {
                                win_painter.close();
                            }
                        }]
                    }, {
                        label: "编辑",
                        submenu: [{
                            label: '重置',
                            click: () => {
                                win_painter.reload();
                            }
                        }, {
                            type: "separator"
                        }, {
                            label: '复制',
                            role: 'copy'
                        }, {
                            label: '剪切',
                            role: 'cut'
                        }, {
                            label: '粘贴',
                            role: 'paste'
                        }, {
                            label: '全选',
                            role: 'selectall'
                        }]
                    }]));
                });

                win_painter.maximize();

                // 开发模式
                if (process.env.NODE_ENV == 'development') {
                    // win_painter.webContents.openDevTools();
                    win_painter.loadURL('http://localhost:3000/painter.html');
                }

                // 生产模式
                else {
                    win_painter.loadFile('./dist/painter.html');
                }

                ipcMain.on("exit-painter", function () {
                    win_painter.destroy();
                });

            }
        }
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('Easy Browser-' + pkgInfo.version);

};