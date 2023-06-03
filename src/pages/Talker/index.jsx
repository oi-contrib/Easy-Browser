import React from 'react'
import './index.scss'
import { animation } from "vislite"

document.getElementsByTagName('title')[0].innerText = "Talker 聊天室"

class Talker extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            username: "",
            list: [], // 好友列表
            mac: [], // 本机所有网络端口Mac
            ip: [], // 本机所有ip v4
            activeIp: "", // 当前激活窗口ip

        }

        this.refInput = React.createRef() // 创建输入的ref对象
        this.refTalks = React.createRef() // 创建内容区域的ref对象
    }

    render() {
        return (<div className='talker-view'>
            <div className='nav'>
                <div className='active' onClick={() => this.changNav.call(this, 'talker')}>
                    聊天室
                </div>
                <div onClick={() => this.changNav.call(this, 'history')}>
                    历史记录
                </div>
            </div>
            <div className='list'>
                {this.state.list.map((item, index) => <div className={item.ip == this.state.activeIp ? 'active' : ''} title={item.mac} key={index} onClick={() => this.changTalker.call(this, item)}>
                    <h2>{item.name}</h2>
                    <div>{item.ip}</div>
                </div>)}
            </div>
            <div className='view'>
                <div className="info">
                    {this.getItem().name}
                </div>
                <div className="talks" ref={this.refTalks}>
                    {this.getItem().messages.map((message, index) => <div className={"item-view " + message.type} key={index}><div className="item-value">
                        <pre>{message.data.value}</pre>
                    </div></div>)}
                </div>
                <div className="input">
                    <textarea placeholder='输入内容后回车即可发送......' ref={this.refInput} value={this.state.input} onKeyDown={(event) => this.doSend.call(this, event.code)}></textarea>
                </div>
            </div>
        </div>)
    }

    getItem() {
        for (let index = 0; index < this.state.list.length; index) {
            if (this.state.list[index].ip == this.state.activeIp) {
                return this.state.list[index]
            }
        }
        return {
            messages: []
        }
    }

    changNav(navName) {
        if (navName == 'history')
            alert('开发中，敬请期待！')
    }

    changTalker(item) {
        this.setState({
            activeIp: item.ip
        })
    }

    isToMe(target) {

        // 如果是广播，接收
        if (target == '255.255.255.255') return true

        // 如果和目标ip一样，接收
        for (let index = 0; index < this.state.ip.length; index++) {
            if (this.state.ip[index] == target) return true
        }

        return false
    }

    pushMessage(targetIp, message) {
        for (let index = 0; index < this.state.list.length; index++) {
            if (targetIp == this.state.list[index].ip) {
                this.state.list[index].messages.push(message)
                break
            }
        }

        this.setState({
            list: this.state.list
        })

        let oldTop = this.refTalks.current.scrollTop
        animation(deep => {
            this.refTalks.current.scrollTop = oldTop + deep * (this.refTalks.current.scrollHeight - oldTop)
        }, 500, () => {
            this.refTalks.current.scrollTop = this.refTalks.current.scrollHeight
        })
    }

    // 按下发送按钮
    doSend(code) {

        // 按下了回车
        if (code == 'Enter') {

            this.sendMsg({
                type: 'talker',
                value: this.refInput.current.value,
                send: this.state.ip[0]
            }, this.state.activeIp)

            this.pushMessage(this.state.activeIp, {
                type: "self",
                data: {
                    type: "text",
                    value: this.refInput.current.value
                }
            })

            setTimeout(() => {
                this.refInput.current.value = ""
            })
        }

    }

    // 发送信息
    // target表示接收者的ip，如果是“255.255.255.255”，就是发送给所有的
    sendMsg(data, target = "255.255.255.255") {
        let msg = {
            target,
            data
        }
        globalThis.nodeRequire.ipcRenderer.send('send-msg', JSON.stringify(msg))
    }

    // 发送同步好友列表的请求
    doSync() {
        /**
         * 同步的流程：
         * 1.先清空自己的好友列表，
         * 2、然后发送信息告诉所有人，
         * 3.收到信息的人会在自己的列表检查是否包含发送请求的人，如果不存在就加进去
         * 4.收到信息的再发送一个专门的请求告诉请求同步的自己可以被添加到列表中去
         */
        this.setState({
            list: []
        })

        this.sendMsg({
            type: "sync",
            username: this.state.username,
            mac: this.state.mac[0]
        })
    }

    componentDidMount() {
        let computer = globalThis.nodeRequire.ipcRenderer.sendSync("computer")
        this.setState({
            mac: computer.mac,
            ip: computer.ip,
            username: computer.username
        })

        // 启动事件监听主进程
        globalThis.nodeRequire

            // 监听别的软件发送来的信息
            .receive("get-msg", (event, data) => {
                let msg = JSON.parse(decodeURIComponent(data.msg))

                // 如果是发送给自己的
                if (this.isToMe(msg.target)) {

                    // 如果是同步信息
                    if (msg.data.type == 'sync') {

                        let isHad = false
                        for (let index = 0; index < this.state.list.length; index++) {
                            if (this.state.list[index].ip == data.ip) {
                                isHad = true
                                break
                            }
                        }

                        if (!isHad) {
                            this.state.list.push({
                                ip: data.ip,
                                name: msg.data.username,
                                mac: msg.data.mac,
                                messages: []
                            })
                            this.setState({
                                list: this.state.list
                            })

                            // 检查是否存在被选中
                            let noCheck = true
                            for (let index = 0; index < this.state.list.length; index++) {
                                if (this.state.list[index].ip == this.state.activeIp) {
                                    noCheck = false
                                    break
                                }
                            }
                            if (noCheck) {
                                this.setState({
                                    activeIp: this.state.list[0].ip
                                })
                            }

                        }

                        // 如果是广播，还需要反馈对方
                        if (msg.target == '255.255.255.255') {

                            this.sendMsg({
                                type: "sync",
                                username: this.state.username,
                                mac: this.state.mac[0]
                            }, data.ip)

                        }

                    }

                    // 如果是接收到的聊天信息
                    else if (msg.data.type == 'talker') {
                        this.pushMessage(msg.data.send, {
                            type: "you",
                            data: {
                                type: "text",
                                value: msg.data.value
                            }
                        })
                    }
                }
            })

        setTimeout(() => {

            // 同步好友列表
            this.doSync()
        })
    }
}

export default Talker