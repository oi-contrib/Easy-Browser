const electron = require('electron');
const { spawn } = require('child_process');

let electronApp;
class TimelinePlugin {
    apply(compiler) {
        compiler.hooks.afterEmit.tap('TimelinePlugin', (compilation, callback) => {

            if (electronApp) {
                // electronApp.removeListener('exit', process.exit);
                // electronApp.kill('SIGINT');
                // electronApp = null;
            } else {
                process.env.NODE_ENV = "development";
            }

            if (!electronApp) {
                electronApp = spawn(String(electron), ['--inspect', '.'], {
                    stdio: 'inherit'
                });

                electronApp.addListener('exit', process.exit);
            }
        })
    }
}

module.exports = TimelinePlugin;