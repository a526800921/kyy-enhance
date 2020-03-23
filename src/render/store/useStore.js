import { deep } from '../../utils/utils'
import { Store } from './addStore'
import { subscribe, unsubscribe } from './store'

// 使用 store
export const useStore = (key, callback) => {
    if (!Store[key]) throw new Error(`useStore 没有找到状态库 ${key}`)

    const { store } = Store[key]
    const getState = (id) => (!id || id === store.id) ? callback(deep(store.get())) : {}

    return {
        type: 'useStore',
        use: (params) => {
            if (!params.data) params.data = {}

            // 给 data 注入 state
            if (typeof params.data === 'function') {
                const fn = params.data

                params.data = function (...arg) {
                    return {
                        ...fn.apply(this, arg),
                        ...getState(),
                    }
                }
            } else Object.assign(params.data, getState())

            // 将获取值的方法绑定到页面
            // 多 useStore 需叠加函数
            const { getStateData } = params
            params.getStateData = (id) => Object.assign(getStateData ? getStateData() : {}, getState(id))

            return params
        }
    }
}

// 给 当前页面或组件 注入 store 监听
export const injectLifecycle = addLifecycle => {
    addLifecycle('onInit', function () {
        if (!this.getStateData) return

        this.updateStateFlag = true // 在页面隐藏时优化渲染
        this.updateStateRun = false // 页面隐藏时有执行，则在 onShow 执行
        this.updateState = ({ id } = {}) => // 更新数据方法， id 用作优化不必要的值
            this.updateStateFlag ?
                this.setData(this.getStateData(id), { sync: true }) :
                (this.updateStateRun = true)

        subscribe(this.updateState)
        
        // 初始化时再走一遍数据赋值，以防在别的地方改变了但并未初始化造成的不同步
        this.updateState()
    }, { priority: 6 })

    addLifecycle('onDestroy', function () {
        if (!this.getStateData) return

        unsubscribe(this.updateState)
        this.updateState = null
    })

    addLifecycle('onShow', function () {
        if (!this.getStateData) return

        this.updateStateFlag = true
        if (this.updateStateRun) {
            this.updateStateRun = false
            this.updateState()
        }
    })

    addLifecycle('onHide', function () {
        if (!this.getStateData) return

        this.updateStateFlag = false
    })
}
