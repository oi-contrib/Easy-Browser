import React from 'react'
import { HashRouter, Route, Routes } from "react-router-dom"
import LazyComponent from '../../lazy-component.jsx'

import './styles/App.scss'

import store from './stores/index'
import dialogs from './dialogs/lazy-load'

// 引入页面
let Index = LazyComponent(() => import('./pages/Index/index.jsx'))
let Blank = LazyComponent(() => import('./pages/Blank/index.jsx'))
let Talker = LazyComponent(() => import('./pages/Talker/index.jsx'))

class UiDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      pages: []
    }

    // 监听store改变
    store.subscribe(() => {
      this.setState({
        pages: store.getState()["dialogInstance"]
      })

    })
  }

  render() {
    return (<div className="dialog-view">
      {/* 统一遮罩 */}
      <div className="mask"></div>
      {
        this.state.pages.map((item, index) => <div key={index}>{(() => {
          let NyDialog = dialogs[item.id]

          return (<NyDialog data={item.data}></NyDialog>)
        })()}</div>)
      }</div>)
  }
}

class App extends React.Component {
  render() {
    return (<>

      {/* 主体内容 */}
      <div className="main-view">

        {/* 配置路由 */}
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />}></Route>
            <Route path="blank" element={<Blank />}></Route>
            <Route path="talker" element={<Talker />}></Route>
          </Routes>
        </HashRouter>

      </div>

      {/* 弹框 */}
      <UiDialog></UiDialog>

    </>)
  }
}

export default App
