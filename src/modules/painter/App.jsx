import React from 'react'
import { Canvas } from 'vislite'

let painter = null  // 屏幕画笔

let painterColor = "red" // 画笔颜色
let painterType = 'auto' // 绘制类型

let isMouseDown = false // 记录鼠标是否按下
let isInputText = false // 记录是否在输入文字

let isMouseDown_setting = false // 记录设置上是否按下键盘
let hadUndone = false // 记录设置界面是否正在移动
let prePosition_setting // 设置界面上鼠标按下时设置界面位置
let leftValue, topValue // 设置界面上鼠标按下时鼠标位置

let textPosition // 文字位置
let initPosition // 画布上鼠标按下时鼠标位置

class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {}

        this.refcanvas = React.createRef() // 画布
        this.refHelpRect = React.createRef() // 矩形辅助
        this.refHelpText = React.createRef() // 文字辅助
        this.refSetting = React.createRef() // 设置
    }

    // 初始化
    componentDidMount() {
        painter = new Canvas(this.refcanvas.current)

        this.doClear()
        setTimeout(() => {
            this.refSetting.current.style.top = "20px"
        })
    }

    // 清空画布
    doClear() {
        painter.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }

    // 重置
    doReset() {
        window.location.reload()
    }

    // 退出
    doExit() {
        window.nodeRequire.ipcRenderer.send('exit-painter')
    }

    // 改变画笔颜色
    changeColor(event) {
        painterColor = event.target.value

        this.refHelpText.current.style.color = painterColor
        this.refHelpText.current.style.borderBottomColor = painterColor
    }

    // 改变绘制类型
    changeType(event) {
        painterType = event.target.value
    }

    // 设置上鼠标按下
    doMouseDown_setting(event) {
        event.stopPropagation()

        let allStyle = document.defaultView.getComputedStyle(this.refSetting.current, null)

        leftValue = allStyle.getPropertyValue('left').replace('px', '')
        topValue = allStyle.getPropertyValue('top').replace('px', '')

        isMouseDown_setting = true
    }

    // 设置上鼠标移动
    doMouseMove_setting(event) {
        if (isMouseDown_setting) {
            if (!prePosition_setting) {
                prePosition_setting = [event.clientX, event.clientY]
            } else if (!hadUndone) {
                hadUndone = true
                setTimeout(() => {
                    if (prePosition_setting) {
                        this.refSetting.current.style.left = (leftValue - (prePosition_setting[0] - event.clientX)) + "px"
                        this.refSetting.current.style.top = (topValue - (prePosition_setting[1] - event.clientY)) + "px"
                    }
                    hadUndone = false
                }, 10)
            }
        }
    }

    // 设置上鼠标松开
    doMouseUp_setting(event) {
        isMouseDown_setting = false
        prePosition_setting = null
    }

    // 画布上鼠标按下
    doMouseDown(event) {
        if (event.target.nodeName != 'CANVAS') return

        painter.config({
            strokeStyle: painterColor,
            fillStyle: painterColor,
            lineWidth: 2,
            fontSize: 20
        })

        // 如果之前在输入文字
        if (isInputText) {
            let inputTexts = (this.refHelpText.current.innerText || "").replace(/\n\n/g, "\n").split(/\n/)
            this.refHelpText.current.innerText = ""

            for (let index = 0; index < inputTexts.length; index++) {
                painter.fillText(inputTexts[index], textPosition[0], textPosition[1] + (index + 0.5) * 26)
            }

            isInputText = false
        }

        isMouseDown = true

        // 自由画笔
        if (painterType == 'auto') {
            painter.beginPath().moveTo(event.clientX, event.clientY)
        }

        // 矩形
        else if (painterType == 'rect-stroke' || painterType == 'rect-fill') {
            initPosition = [event.clientX, event.clientY]

            this.refHelpRect.current.style.display = ""
            this.refHelpRect.current.style.width = "0px"
            this.refHelpRect.current.style.height = "0px"

            if (painterType == 'rect-fill') {
                this.refHelpRect.current.style.backgroundColor = painterColor
                this.refHelpRect.current.style.borderColor = "transparent"
            } else {
                this.refHelpRect.current.style.backgroundColor = "transparent"
                this.refHelpRect.current.style.borderColor = painterColor
            }
        }

        // 文字
        else if (painterType == 'text') {
            this.refHelpText.current.style.display = ""

            textPosition = [event.clientX, event.clientY - 7]

            this.refHelpText.current.style.left = textPosition[0] + "px"
            this.refHelpText.current.style.top = textPosition[1] + "px"
            setTimeout(() => {
                this.refHelpText.current.focus()
            })

            isInputText = true
        }
    }

    // 画布上鼠标移动
    doMouseMove(event) {
        if (event.target.nodeName != 'CANVAS') return

        if (isMouseDown) {

            // 自由画笔
            if (painterType == 'auto') {
                painter.lineTo(event.clientX, event.clientY).stroke().beginPath().moveTo(event.clientX, event.clientY)
            }

            // 矩形
            else if (painterType == 'rect-stroke' || painterType == 'rect-fill') {

                if (event.clientX - initPosition[0] < 0) {
                    this.refHelpRect.current.style.left = event.clientX + "px"
                    this.refHelpRect.current.style.width = (initPosition[0] - event.clientX) + "px"
                } else {
                    this.refHelpRect.current.style.left = initPosition[0] + "px"
                    this.refHelpRect.current.style.width = (event.clientX - initPosition[0]) + "px"
                }

                if (event.clientY - initPosition[1] < 0) {
                    this.refHelpRect.current.style.top = event.clientY + "px"
                    this.refHelpRect.current.style.height = (initPosition[1] - event.clientY) + "px"
                } else {
                    this.refHelpRect.current.style.top = initPosition[1] + "px"
                    this.refHelpRect.current.style.height = (event.clientY - initPosition[1]) + "px"
                }

            }

        }
    }

    // 画布上鼠标松开
    doMouseUp(event) {
        if (event.target.nodeName != 'CANVAS') return

        if (isMouseDown) {

            // 矩形
            if (painterType == 'rect-stroke' || painterType == 'rect-fill') {
                this.refHelpRect.current.style.display = "none"
                painter[(painterType.split('-')[1]) + 'Rect'](initPosition[0], initPosition[1], event.clientX - initPosition[0], event.clientY - initPosition[1])
            }
        }

        isMouseDown = false
    }

    render() {
        return (<div style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            overflow: "hidden"
        }}

            onMouseMove={(event) => {
                this.doMouseMove_setting.call(this, event)
                this.doMouseMove.call(this, event)
            }}
            onMouseUp={(event) => {
                this.doMouseUp_setting.call(this, event)
                this.doMouseUp.call(this, event)
            }}>

            {/* 画布 */}
            <div style={{
                width: "100vw",
                height: "100vh"
            }} ref={this.refcanvas} onMouseDown={(event) => this.doMouseDown.call(this, event)}></div>

            {/* 辅助框 */}
            <div style={{
                position: "fixed",
                borderStyle: "solid",
                borderWidth: "2px",
                pointerEvents: "none"
            }} ref={this.refHelpRect}></div>
            <div style={{
                position: "fixed",
                minWidth: "100px",
                minHeight: "14px",
                fontSize: "20px",
                lineHeight: "26px",
                outline: "none",
                color: "red"
            }} ref={this.refHelpText} contentEditable></div>

            {/* 配置 */}
            <div style={{
                position: "fixed",
                left: "50vw",
                top: "-500px",
                transform: "translateX(-50%)",
                backgroundColor: "white",
                paddingRight: "10px",
                userSelect: "none",
                whiteSpace: "nowrap",
                boxShadow: "0 0 3px #797979",
                borderRadius: "5px"
            }} ref={this.refSetting}>
                <header style={{
                    cursor: "move",
                    fontSize: "16px",
                    verticalAlign: "revert",
                    padding: "10px",
                    backgroundColor: "#e8e8e8",
                    color: "#126a7d",
                    borderRadius: "5px 0 0 5px",
                    display: "inline-block"
                }} onMouseDown={(event) => this.doMouseDown_setting.call(this, event)}>
                    屏幕画笔
                </header>
                <h2 style={{
                    fontSize: "14px",
                    marginLeft: "15px",
                    display: "inline-block"
                }}>
                    类型:
                </h2>
                <select style={{
                    height: "20px",
                    border: "none",
                    borderBottom: "2px solid black",
                    verticalAlign: "middle",
                    outline: "none"
                }} name="type" onChange={(event) => this.changeType.call(this, event)}>
                    <option value="auto">自由画笔</option>
                    <option value="rect-stroke">矩形框</option>
                    <option value="rect-fill">填充矩形</option>
                    <option value="text">文字</option>
                </select>
                <h2 style={{
                    fontSize: "14px",
                    marginLeft: "15px",
                    display: "inline-block"
                }}>
                    颜色:
                </h2>
                <input style={{
                    width: "50px",
                    height: "30px",
                    padding: "0",
                    border: "none",
                    backgroundColor: "transparent",
                    verticalAlign: "middle"
                }} type="color" value="#ff0000" onChange={(event) => this.changeColor.call(this, event)} />
                <div style={{
                    position: "absolute",
                    backgroundColor: "#000000",
                    padding: "5px",
                    margin: "0 5px",
                    borderRadius: "0 0 5px 5px"
                }}>
                    <button style={{
                        outline: "none",
                        border: "none",
                        backgroundColor: "#c5d1db",
                        color: "white"
                    }} onClick={this.doClear}>清空</button>
                    <button style={{
                        outline: "none",
                        border: "none"
                    }} onClick={this.doReset}>重置</button>
                    <button style={{
                        outline: "none",
                        border: "none",
                        backgroundColor: "red",
                        color: "white"
                    }} onClick={this.doExit}>退出</button>
                </div>
            </div>

        </div>)
    }
}

export default App
