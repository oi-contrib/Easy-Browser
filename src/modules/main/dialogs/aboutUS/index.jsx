import React from 'react'
import "./index.scss"

import pkg from '../../../../../package.json'
import store from '../../stores/index'

class confirm extends React.Component {

    closeDialog() {
        store.dispatch({
            type: "closeDialog"
        })
    }

    render() {
        return (<div className='info-view'>
            <div className="logo"></div>
            <header>
                <span>Easy Browser</span>
                <div>(版本：<span>{pkg.version}</span>)</div>
            </header>
            <div className="content">
                <div>
                    <h2>介绍</h2>
                    ：本项目是一个简单的定制化浏览器，由<a href="https://github.com/zxl20070701" target='_blank'>z Z ...</a>开发，我们会逐步丰富。
                </div>
                <div>
                    <h2>初衷</h2>
                    ：为日常提供便捷使用。
                </div>
                <div>
                    欢迎任何人贡献代码！
                </div>
            </div>
            <div className="btn-list">
                <span className='btn' onClick={() => this.closeDialog.call(this)}>关闭</span>
                <a className='btn' href="https://github.com/zxl20070701/Easy-Browser" target="_blank">访问源码</a>
            </div>
        </div >)
    }
}

export default confirm