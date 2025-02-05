const dialogInstance = (preState, action) => {

    switch (action.type) {

        // 打开弹框
        case 'openDialog':
            return [
                ...preState,
                action.data
            ]

        // 关闭弹框
        case 'closeDialog':

            // 从数组中删除即可关闭
            let dialog = preState.pop()

            // 如果有回调，回调
            if (dialog && typeof dialog.callback === "function") {
                dialog.callback(action.data)
            }

            return preState

        default:
            return preState || []
    }
}

export default dialogInstance