const fs = require('fs');
const { deleteSync } = require("devby");

fs.copyFileSync('./public/logo.png', './dist/logo.png');

// 删除release
console.log("\n >>> 打包前环境重置 release <<< \n");

try {
    deleteSync("./release");
} catch (e) { }

console.log("\n\n");