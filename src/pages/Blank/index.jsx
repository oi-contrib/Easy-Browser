import React from 'react'
import './index.scss'

import pkg from '../../../package.json'

document.getElementsByTagName('title')[0].innerText = "启动页"

class Blank extends React.Component {

    doSearch(event) {
        let keycode = event.keyCode || event.which
        if (keycode != 13 || event.target.value.trim() == '') return

        window.location.href = "https://cn.bing.com/search?q=" + event.target.value
    }

    goto(pagename) {
        globalThis.nodeRequire.ipcRenderer.send("refresh-view", {
            url: "browser://" + pagename,
            updateUrl: true
        })
    }

    render() {
        return (<div className='blank-view'>

            {/* 查询输入框 */}
            <div className="search">
                <input placeholder='搜索一下，你就知道～' onKeyDown={(event) => this.doSearch.call(this, event)} />
            </div>

            {/* 工具列表 */}
            <div className='tools'>
                <ul>
                    <li className='talker' onClick={() => this.goto.call(this, "talker")}>
                        Talker 聊天室
                    </li>
                </ul>
            </div>

            {/* 版本 */}
            <a className="version" href='https://github.com/fragement-contrib/Easy-Browser/blob/master/CHANGELOG' target="_blank">
                版本：{pkg.version}
            </a>

        </div>)
    }
}

export default Blank