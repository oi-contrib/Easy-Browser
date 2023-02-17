import React from 'react'
import './index.scss'

import pkg from '../../../package.json'

document.getElementsByTagName('title')[0].innerText = "启动页"

class Blank extends React.Component {

    doSearch(event) {
        var keycode = event.keyCode || event.which
        if (keycode != 13) return

        window.location.href = "https://cn.bing.com/search?q=" + event.target.value
    }

    render() {
        return (<div className='blank-view'>

            {/* 查询输入框 */}
            <div className="search">
                <input placeholder='搜索一下，你就知道～' onKeyDown={(event) => this.doSearch.call(this, event)} />
            </div>

            {/* 常用链接 */}
            <div className="links">
                <a href="https://github.com/fragement-contrib/Easy-Browser" target="_blank">源代码</a>
                ｜
                <a href="https://zxl20070701.github.io/notebook" target="_blank">查询文档</a>
                ｜
                <a href="https://zxl20070701.github.io/toolbox" target="_blank">在线工具</a>
                ｜
                <a href="https://github.com/zxl20070701/laboratory" target="_blank">实验仓库</a>
            </div>

            {/* 版本 */}
            <div className="version">
                版本：{pkg.version}
            </div>

        </div>)
    }
}

export default Blank
