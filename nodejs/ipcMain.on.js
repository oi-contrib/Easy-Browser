const { ipcMain, app, BrowserView, Menu } = require("electron");
const path = require('path');

let isFullScreen = false, helpSize;
module.exports = function (win) {

    // 退出
    ipcMain.on("exit", function () {
        app.quit();
    });

    // 最小化
    ipcMain.on("minimize", () => {
        win.minimize();
    });

    // 最大化
    ipcMain.on("maximize", () => {
        win.maximize();
    });

    // 计算留白
    let calcHelp = () => {

        // 不是全屏时，如果最大化，需要留白一点
        helpSize = (!isFullScreen && win.isMaximized() && process.platform != 'darwin') ? 15 : 0;
    };

    /**
     *  窗口管理
     */

    let views = {}, current, topH = 96;
    let browserUrls = {}, loadBrowser;

    // 调整所有窗口大小
    let doResize = () => {
        calcHelp();
        let bounds = win.getBounds();

        for (let key in views) {
            views[key].setBounds({ x: 0, y: topH, width: bounds.width - helpSize, height: bounds.height - topH - helpSize });
        }

    };

    // 进入全屏
    win.on("enter-full-screen", () => {
        topH = 0;
        isFullScreen = true;

        doResize();
    });

    // 离开全屏
    win.on("leave-full-screen", () => {
        topH = 96;
        isFullScreen = false;

        // 全屏以后，除了当前页签外，别的都需要重新挂载一下
        for (let key in views) {
            if (key != current) {
                win.addBrowserView(views[key]);
            }
        }

        // 当前显示的需要延迟设置一下
        setTimeout(() => {
            win.setBrowserView(views[current]);
        });

        doResize();
    });

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

    win.on("resize", doResize);

    // 打开新窗口
    ipcMain.on("new-view", function (event, viewInfo) {
        current = viewInfo.key;

        calcHelp();
        let bounds = win.getBounds();

        const view = new BrowserView();
        win.setBrowserView(view);
        view.setBounds({ x: 0, y: topH, width: bounds.width - helpSize, height: bounds.height - topH - helpSize });

        view.setBackgroundColor("white");

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

        // 多媒体开始播放时触发
        view.webContents.on("media-started-playing", function () {
            win.webContents.send("update-pageinfo", {
                key: viewInfo.key,
                player: true
            });
        });

        // 当媒体文件暂停或播放完成的时触发
        view.webContents.on("media-paused", function () {
            try {

                // 如果页面已经销毁就什么也不干
                if (win && win.webContents && !win.webContents.isDestroyed())
                    win.webContents.send("update-pageinfo", {
                        key: viewInfo.key,
                        player: false
                    });

            } catch (e) { }
        });

    });

    // 销毁窗口
    ipcMain.on("destory-view", function (event, viewInfo) {

        // 关闭页面内容
        // 比如有视频播放的时候销毁
        views[viewInfo.key].webContents.close();

        // 移除窗口实例
        win.removeBrowserView(views[viewInfo.key]);

        // 删除记录
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
        label: "编辑操作",
        submenu: [{
            label: '全屏控制',
            accelerator: process.platform == 'darwin' ? 'CmdOrCtrl+Alt+F' : 'F11',
            click: () => {
                win.setFullScreen(!isFullScreen);
            }
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