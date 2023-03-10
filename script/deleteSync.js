const fs = require('fs');
const path = require('path');

// 删除文件或文件夹
module.exports = function deleteSync(target) {

    // 如果文件夹不存在，直接返回即可
    if (!fs.existsSync(target)) return;

    console.log("> [delete] "+target);

    // 如果是文件，直接删除即可
    if (!fs.lstatSync(target).isDirectory()) {
        fs.unlinkSync(target);
    } else {

        // 读取子文件
        const subFiles = fs.readdirSync(target);

        subFiles.forEach(function (file) {

            // 调用这个方法，删除子文件或文件夹
            const curPath = path.join(target, "./" + file);
            deleteSync(curPath);

        });

        // 等子文件或文件夹删除完毕以后，删除本文件夹
        fs.rmdirSync(target);
    }
};