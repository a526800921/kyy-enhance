import { addLifecycle } from './lifecycle'
import { storeReadyAfter } from './store/middleware'

export default watchs => {

    return {
        type: 'useWatch',
        use: params => {
            // 将当前监听规则绑定到页面
            params.getWatchParams = () => watchs

            return params
        }
    }
}

export const listener = function (updates) {
    if (this.getWatchParams) {
        const watchs = this.getWatchParams()

        updates.forEach(item => watchs[item.key] && (
            typeof watchs[item.key] === 'function' ?
                watchs[item.key].call(this, item.newValue, item.oldValue) :
                (watchs[item.key].handler && watchs[item.key].handler.call(this, item.newValue, item.oldValue))
        ))
    }
}

addLifecycle('onInit', function () {
    if (this.getWatchParams) {
        const watchs = this.getWatchParams()

        Object.keys(watchs).forEach(key => watchs[key].immediate && watchs[key].handler && storeReadyAfter(watchs[key].handler.bind(this)))
    }
}, { priority: 11 })