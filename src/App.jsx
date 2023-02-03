import React from 'react'
import { HashRouter, Route, Routes } from "react-router-dom"
import LazyComponent from './lazy-component.jsx'

// 引入页面
let Index = LazyComponent(() => import('./pages/Index/index.jsx'))
let Blank = LazyComponent(() => import('./pages/Blank/index.jsx'))

class App extends React.Component {
  render() {
    return (<div>

      {/* 配置路由 */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />}></Route>
          <Route path="blank" element={<Blank />}></Route>
        </Routes>
      </HashRouter>

    </div>)
  }
}

export default App
