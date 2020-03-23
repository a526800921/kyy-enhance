import { Store, addStoreAfter } from './addStore'

// store 初始化完成后执行
let storeReady = false
const storeAfterReadyQueue = []
export const storeReadyAfter = fn => storeReady ? fn() : storeAfterReadyQueue.push(fn)

// store 在 onReady 做的事情
const storeBeforeReadyQueue = []
export const storeReadyBefore = callback => storeBeforeReadyQueue.push(callback)

export const $store = {
    getState(key) {
        // 获取全部状态

        if (key) return Store[key] ? Store[key].store.get() : console.error(`Store[${key}] 不存在`)
        else return Object.keys(Store).reduce((state, key) => Object.assign(state, { [key]: Store[key].store.get() }), {})
    },
    async dispatch(key, payload, ...arg) {
        // 执行
        // store 未准备完成则等待
        if (!storeReady) await new Promise(resolve => storeReadyAfter(resolve))

        const [title, action] = key.split('/')

        if (Store[title] && Store[title][action]) {
            if (payload === void 0) return Store[title][action]()
            
            const data = typeof payload === 'function' ? payload(Store[title].store.get()) : payload

            return Store[title][action](...[data, ...arg])
        }
        else console.error(`dispatch 没有找到方法 ${key}`)
    },
    async onReady(callback) {
        // 准备
        await Promise.all(storeBeforeReadyQueue.splice(0, storeBeforeReadyQueue.length).map(fn => fn(Store)))
        
        // 准备完毕
        storeReady = true
        storeAfterReadyQueue.splice(0, storeAfterReadyQueue.length).forEach(fn => fn())

        callback()
    },
    use(callback) {
        // 增强功能
        addStoreAfter(callback)
        // addStoreAfter(Store => callback(Store))
    },
}

