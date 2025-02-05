import { legacy_createStore as createStore, combineReducers } from 'redux'

import dialogInstance from './dialog.store'

let store = createStore(combineReducers({

    // 弹框
    dialogInstance
}))

export default store