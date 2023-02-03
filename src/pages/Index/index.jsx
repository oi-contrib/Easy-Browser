import React from 'react'
import './index.scss'

class Index extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            current: "",
            navs: []
        }

        this.refInput = React.createRef()
    }

    // 关闭应用并退出
    exit() {
        globalThis.nodeRequire.ipcRenderer.send("exit")
    }

    // 最小化应用
    minimize() {
        globalThis.nodeRequire.ipcRenderer.send("minimize")
    }

    // 打开新页面
    newNav(url) {
        let uniqueHash = new Date().valueOf()

        // 补充到navs中记录起来
        this.setState({
            current: uniqueHash,
            navs: [...this.state.navs, {
                key: uniqueHash,
                url,
                title: "loading...",
                favicon: ""
            }]
        })

        // 创建新的页签
        globalThis.nodeRequire.ipcRenderer.send("new-view", {
            key: uniqueHash,
            url
        })

        this.refInput.current.value = url
    }

    // 显示页签
    changeNav(nav) {
        if (nav.key == this.state.current) return

        globalThis.nodeRequire.ipcRenderer.send("show-view", {
            key: nav.key
        })

        this.setState({
            current: nav.key
        })

        this.refInput.current.value = nav.url
    }

    // 刷新
    refresh() {
        globalThis.nodeRequire.ipcRenderer.send("refresh-view", {
            url: this.refInput.current.value
        })

        for (let index = 0; index < this.state.navs.length; index++) {
            if (this.state.navs[index].key == this.state.current) {
                this.state.navs[index].url = this.refInput.current.value
            }
        }

        this.setState({
            navs: this.state.navs
        })
    }

    // 关闭
    close(event, index) {
        event.stopPropagation();

        let newIndex = index + 1 < this.state.navs.length ? index : index - 1
        globalThis.nodeRequire.ipcRenderer.send("destory-view", {
            key: this.state.navs[index].key
        })

        this.state.navs.splice(index, 1)
        this.setState({
            navs: this.state.navs
        })
        if (newIndex >= 0) {
            this.changeNav(this.state.navs[newIndex])
        } else {
            this.newNav("browser://blank")
        }

    }

    // 地址栏键盘事件
    inputKeyEvent(event) {
        var keycode = event.keyCode || event.which
        if (keycode != 13) return

        this.refresh()
    }

    componentDidMount() {

        // 监听标题改变
        globalThis.nodeRequire.receive("update-pageinfo", (event, data) => {
            for (let index = 0; index < this.state.navs.length; index++) {
                if (this.state.navs[index].key == data.key) {

                    for (let key in data) {
                        if (key != 'key') {
                            this.state.navs[index][key] = data[key]
                        }
                    }

                    if ("url" in data && data.key == this.state.current) {
                        this.refInput.current.value = data.url
                    }

                    this.setState({
                        navs: this.state.navs
                    })
                    break
                }
            }
        })

        // 监听新页面打开
        globalThis.nodeRequire.receive("new-nav", (event, data) => {
            this.newNav(data.url)
        })

        this.newNav("browser://blank")
    }

    render() {
        return (<div className='index-view'>
            <header>
                <div className="win-btns">
                    <button className="min" onClick={this.minimize}>最小化</button>
                    <button className="close" onClick={this.exit}>关闭</button>
                </div>
            </header>
            <div className="top">
                <div className="content">
                    <span className="logo"></span>
                    <input spellCheck="false" type="text" defaultValue={(() => {
                        for (let index = 0; index < this.state.navs.length; index++) {
                            if (this.state.navs[index].key == this.state.current) {
                                return this.state.navs[index].url
                            }
                        }
                        return ""
                    })()} ref={this.refInput} onKeyDown={(event) => this.inputKeyEvent.call(this, event)} />
                    <button onClick={() => this.refresh.call(this)}>刷新</button>
                </div>
                <div className="navs">
                    {this.state.navs.map((nav, index) => (<span title={nav.title + "\n" + nav.url} className={nav.key == this.state.current ? 'active' : ''} key={nav.key} onClick={() => this.changeNav.call(this, nav)}>
                        <em style={{
                            backgroundImage: "url(" + nav.favicon + ")"
                        }} ></em>
                        {nav.title}
                        <i onClick={(event) => this.close.call(this, event, index)}>×</i>
                    </span>))}
                    <button onClick={() => this.newNav.call(this, "browser://blank")}>＋</button>
                </div>
            </div>
        </div>)
    }
}

export default Index
