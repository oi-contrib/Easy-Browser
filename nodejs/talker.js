const { ipcMain } = require("electron");
const dgram = require("dgram");
const { network } = require("oipage");

module.exports = function () {

    // 获取本机数据
    ipcMain.on("computer", function (event) {

        let IPv4s = network().IPv4;
        let ip = [], mac = [], username = require('os').hostname()
        for (let index = 0; index < IPv4s.length; index++) {
            ip.push(IPv4s[index].address);
            mac.push(IPv4s[index].mac);
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