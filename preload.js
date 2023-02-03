const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nodeRequire', {
    ipcRenderer: ipcRenderer,
    receive: function (eventName, callback) {
        ipcRenderer.on(eventName, callback);
    }
});