import React from 'react'
import './index.scss'

document.getElementsByTagName('title')[0].innerText = "空白页"

class Blank extends React.Component {

    render() {
        return (<div className='blank-view'>

        </div>)
    }
}

export default Blank
