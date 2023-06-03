const { ipcMain } = require("electron");
const dgram = require("dgram");

module.exports = function () {

    // 获取本机数据
    ipcMain.on("computer", function (event) {

        let networks = require('os').networkInterfaces()
        let ip = [], mac = [], username = require('os').hostname()

        for (let typeName in networks) {
            let network = networks[typeName]
            for (let index = 0; index < network.length; index++) {
                if (network[index].family == 'IPv4' && network[index].address != '127.0.0.1') {
                    ip.push(network[index].address);
                    mac.push(network[index].mac);
                }
            }
        }

        event.returnValue = {
            ip, mac, username
        };
    });

    // 发送信息
    ipcMain.on('send-msg', function (event, data) {

        // 编码
        data = encodeURIComponent(data);

        let socket = dgram.createSocket("udp4");
        socket.bind(function () {
            socket.setBroadcast(true);
        });
        let message = Buffer.from(data);
        socket.send(message, 0, message.length, 50000, '255.255.255.255', function (err, bytes) {
            socket.close();
        });

    });

    
};