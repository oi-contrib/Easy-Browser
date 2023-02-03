import React from 'react'

export default (lazyFunction) => {

    // 然后一个组件，这里组件就是辅助显示懒加载组件的
    return class MyComponent extends React.Component {
        constructor() {
            super()
            this.state = {
                YourComponent: null
            }
        }

        /**
         * 组件装载完毕以后，调用这个钩子，
         * 然后这个钩子就执行懒加载函数，返回一个promise，
         * 在真正的组件返回以后，再挂载即可。
         */
        componentDidMount() {

            /**
             * lazyFunction其实就是
             *      ()=>import('./xxx.jsx')
             * 这样的一个promise，
             * 通过then获取真正的组件
             */
            lazyFunction().then(module => {

                // 获取以后，设置
                this.setState({
                    YourComponent: module.default
                })

            })
        }
        render() {
            let { YourComponent } = this.state

            if (YourComponent) {
                /*

                判断组件是否存在，如果存在，渲染

                此外，为什么会有下面这条语句：
                {...this.props}

                如果用懒加载组件的地方写了属性，这里如果没有这句，会获取不到
                */
                return <YourComponent {...this.props}></YourComponent>
            } else {
                return null
            }
        }
    }
}
