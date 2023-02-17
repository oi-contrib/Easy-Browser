const { ipcMain, app, BrowserView, Menu } = require("electron");
const path = require('path');

module.exports = function (win) {

    // 退出
    ipcMain.on("exit", function () {
        app.quit();
    });

    // 最小化
    ipcMain.on("minimize", function () {
        win.minimize();
    });

    /**
     *  窗口管理
     */

    let views = {}, current, topH = 96;
    let browserUrls = {}, loadBrowser;

    // 开发模式
    if (process.env.NODE_ENV == 'development') {
        loadBrowser = function (webContents, urlVal) {
            if (!browserUrls[urlVal]) browserUrls[urlVal] = 'http://localhost:3000/#/' + urlVal;
            webContents.loadURL(browserUrls[urlVal]);
        }
    }

    // 生产模式
    else {
        loadBrowser = function (webContents, urlVal) {
            if (!browserUrls[urlVal]) browserUrls[urlVal] = ("file://" + path.join(__dirname, '../dist/index.html#/') + urlVal).replace(/\\/g, '\/');
            webContents.loadURL(browserUrls[urlVal]);
        }
    }

    let loadURL = (webContents, url) => {
        if (/^browser:\/\//.test(url)) {
            loadBrowser(webContents, url.replace(/^browser:\/\//, ''));
        } else {
            webContents.loadURL(url);
        }
    }

    win.on("resize", () => {
        let bounds = win.getBounds();
        for (let key in views) {
            views[key].setBounds({ x: 0, y: topH, width: bounds.width, height: bounds.height - topH });
        }
    });

    // 打开新窗口
    ipcMain.on("new-view", function (event, viewInfo) {
        current = viewInfo.key;

        let bounds = win.getBounds();

        const view = new BrowserView();
        win.setBrowserView(view);
        view.setBounds({ x: 0, y: topH, width: bounds.width, height: bounds.height - topH });

        loadURL(view.webContents, viewInfo.url);

        views[viewInfo.key] = view;

        // 监听标题改变
        view.webContents.on("page-title-updated", function (event, title) {
            win.webContents.send("update-pageinfo", {
                key: viewInfo.key,
                title
            });
        });

        // 监听地址改变
        view.webContents.on("did-start-navigation", function (event, url) {
            if (url == 'about:blank') return;

            for (let key in browserUrls) {
                try {
                    if (decodeURIComponent(browserUrls[key]).replace(/^file:\/{2,3}/, '') == decodeURIComponent(url).replace(/^file:\/{2,3}/, '')) {
                        return;
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            win.webContents.send("update-pageinfo", {
                key: viewInfo.key,
                url
            });
        });

        // 监听logo改变
        view.webContents.on("page-favicon-updated", function (event, favicons) {
            win.webContents.send("update-pageinfo", {
                key: viewInfo.key,
                favicon: favicons[0]
            });
        });

        // 监听新页面打开
        view.webContents.setWindowOpenHandler(function (details) {
            win.webContents.send("new-nav", {
                url: details.url
            });
            return { action: 'deny' };
        });

    });

    // 销毁窗口
    ipcMain.on("destory-view", function (event, viewInfo) {
        delete views[viewInfo.key];
    });

    // 显示窗口
    ipcMain.on("show-view", function (event, viewInfo) {
        current = viewInfo.key;
        win.setBrowserView(views[current]);
    });

    // 刷新窗口
    ipcMain.on("refresh-view", function (event, viewInfo) {
        loadURL(views[current].webContents, viewInfo.url);
    });

    /**
     * 菜单管理
     */

    Menu.setApplicationMenu(Menu.buildFromTemplate([{
        label: 'Easy Browser',
        submenu: [{
            label: '关闭',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
                app.quit();
            }
        }]
    }, {
        label: "编辑",
        submenu: [{
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
    }, {
        label: "开发",
        submenu: [{
            label: '页面检查器',
            accelerator: process.platform == 'darwin' ? 'CmdOrCtrl+Alt+I' : 'F12',
            click: () => {
                views[current].webContents.toggleDevTools();
            }
        }]
    }]));

};