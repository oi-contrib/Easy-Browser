import React from 'react'
import './index.scss'

import store from '../../stores/index'

document.getElementsByTagName('title')[0].innerText = "欢迎页面"

class Blank extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            inputVal: ""
        }
    }

    doSearch() {
        if (this.state.inputVal.trim() == '') return
        setTimeout(() => {
            window.location.href = "https://cn.bing.com/search?q=" + this.state.inputVal
        })
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

    open(url) {
        let el = document.createElement("a")
        el.setAttribute("href", url)
        el.setAttribute("target", "_blank")
        el.click()
    }

    render() {
        return (<div className='blank-view'>

            {/* 查询输入框 */}
            <form onSubmit={() => this.doSearch.call(this)}>
                <div className="search">
                    <input type="text" value={this.state.inputVal} onChange={
                        (event) => this.setState({ inputVal: event.target.value })
                    } placeholder='搜索一下，你就知道～' spellCheck="false" autoComplete="off" />
                    <div className="btn" onClick={() => this.doSearch.call(this)}>
                        Search
                    </div>
                </div>
            </form>

            {/* 工具列表 */}
            <div className='tools'>
                <ul>
                    <li onClick={() => this.open.call(this, "https://oi-contrib.github.io/VISLite")}>
                        <i className='vislite link'></i>
                        VISLite
                    </li>
                    <li onClick={() => this.goto.call(this, "talker")}>
                        <i className="talker"></i>
                        聊天室
                    </li>
                    <li onClick={() => this.open.call(this, "https://zxl20070701.github.io/notebook")}>
                        <i className='notebook link'></i>
                        文档笔记
                    </li>
                    <li onClick={() => this.open.call(this, "https://zxl20070701.github.io/toolbox")}>
                        <i className='toolbox link'></i>
                        工具箱
                    </li>
                </ul>
            </div>

            {/* 版本 */}
            <div className="aboutUS" onClick={() => this.aboutUS.call(this)}>
                <i></i>关于我们
            </div>

        </div>)
    }
}

export default Blank