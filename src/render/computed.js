import { deep } from '../utils/utils'
import { addLifecycle } from './lifecycle'

const getComputed = (computeds, target, { updates = [], isComponent } = {}) => {
    if (!target) return updates

    const keys = Object.keys(computeds)
    let flag = false

    keys.forEach((key) => {
        const oldValue = target[key]
        const newValue = (() => {
            // 组件初始化不做计算
            if (isComponent) return null

            try {
                const data = computeds[key].call(target)

                return data === void 0 ? null : data
            } catch (error) {
                // 处理 props 中深层嵌套的报错
                console.error('computed: ', error)
                return null
            }
        })();

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            if (oldValue !== void 0) {
                flag = true

                updates.push({
                    key,
                    oldValue: deep(oldValue),
                    newValue,
                })
            }

            target[key] = newValue
        }
    })

    if (flag) return getComputed(computeds, target, { updates, isComponent })
    else return updates
}

const setComputed = (...arg) => {
    const start = Date.now()
    const last = getComputed(...arg)

    times.push(Date.now() - start)
    showTime()

    return last
}

const times = []
const showTime = () => Promise.resolve().then(() => {
    if (!times.length) return

    const time = times.splice(0, times.length).reduce((a, b) => a + b, 0)

    // console.log('======= computed end =======', time)
}) 

export default computeds => {

    return {
        type: 'useComputed',
        use: params => {
            const isComponent = params.getConnectType ? params.getConnectType() === 'useComponent' : ''

            if (!params.data) params.data = {}

            // 给 data 注入 computed
            if (typeof params.data === 'function') {
                const fn = params.data

                params.data = function (...arg) {
                    const initData = fn.apply(this, arg)

                    setComputed(computeds, initData, { isComponent })

                    return deep(initData)
                }
            } else {
                setComputed(computeds, params.data, { isComponent })

                params.data = deep(params.data)
            }

            // 将当前计算规则绑定到页面
            params.getComputedParams = () => computeds

            // 监听props改变
            if (params.props) {
                const keys = Array.isArray(params.props) ? params.props : Object.keys(params.props)

                if (keys.length) {
                    params.getComputedProps = () => keys

                    // 组件做监听
                    if (isComponent) {
                        keys.forEach(key => params[`onComputedForProps_${key}`] = function (newValue, oldValue) {
                            if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return

                            // 更新
                            update.call(this, [{
                                key,
                                oldValue,
                                newValue,
                            }])
                        })
                    }
                }
            }

            return params
        }
    }
}

addLifecycle('onInit', function () {
    // 监听 props 改变，触发 computed 改变
    if (this.getComputedProps) {
        const keys = this.getComputedProps()

        keys.forEach(key => this.$watch(key, `onComputedForProps_${key}`))

        // 初始化数值，因 parms 的 props 中拿不到值
        this.getComputedParams && setComputed(this.getComputedParams(), this)
    }
}, { target: 'component', priority: 7 })

addLifecycle('onInit', function () {
    if (this.getComputedProps) {
        // 初始化数值，因 parms 的 props 中拿不到值
        this.getComputedParams && setComputed(this.getComputedParams(), this)
    }
}, { target: 'page', priority: 7 })

export const update = function (updates) {
    const computedUpdates = this.getComputedParams ? setComputed(this.getComputedParams(), this) : []
    const repeat = {}

    // 拿真的旧值和最后的新值
    computedUpdates.forEach(item => {
        if (!repeat[item.key]) repeat[item.key] = { oldValue: item.oldValue, newValue: item.newValue }
        else repeat[item.key].newValue = item.newValue
    })

    const realUpdates = Object.keys(repeat).map(key => ({ key, ...repeat[key] }))

    // 给watch使用
    update.listener && update.listener.call(this, updates.concat(realUpdates))
}

update.use = params => Object.keys(params).forEach(key => update[key] = params[key])
