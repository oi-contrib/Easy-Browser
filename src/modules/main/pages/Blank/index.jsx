import React from 'react'
import './index.scss'

import store from '../../stores/index'

document.getElementsByTagName('title')[0].innerText = "启动页"

class Blank extends React.Component {

    doSearch(event) {
        let keycode = event.keyCode || event.which
        if (keycode != 13 || event.target.value.trim() == '') return

        window.location.href = "https://cn.bing.com/search?q=" + event.target.value
    }

    // 关于我们
    aboutUS() {
        store.dispatch({
            type: "openDialog",
            data: {
                id: "aboutUS"
            }
        })
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
            <button className="aboutUS" onClick={() => this.aboutUS.call(this)}>
                关于我们
            </button>

        </div>)
    }
}

export default Blank