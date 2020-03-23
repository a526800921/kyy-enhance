let id = 1

class Store {
    constructor(state) {
        this.id = id++
        this.state = state
        this.hooks = []
    }

    set(callback = {}) {
        const newState = typeof callback === 'function' ? callback(this.get()) : callback
        const updates = []

        Object.keys(newState).forEach(key => {
            if (this.state[key] === void 0) return // 初始化不存在的值
            if (newState[key] === void 0) return // 设置的值不能为 undefined

            const update = JSON.stringify(this.state[key]) !== JSON.stringify(newState[key])
            
            if (update) {
                updates.push({
                    key,
                    oldValue: this.state[key],
                    newValue: newState[key],
                })

                this.state[key] = newState[key]
            }
        })
        
        // 更新状态钩子
        if (updates.length) {
            this.hooks.forEach(fn => fn(updates))
            hooks.forEach(fn => fn({ id: this.id, updates }))
        }
    }

    get() {

        return this.state
    }

    subscribe(callback) {
        // 订阅
        this.hooks.push(callback)
    }

    unsubscribe(callback) {
        // 取消订阅
        const index = this.hooks.indexOf(callback)

        if (index > -1) this.hooks.splice(index, 1)
    }
}

const hooks = []
export const subscribe = callback => hooks.push(callback)
export const unsubscribe = callback => {
    // 取消订阅
    const index = hooks.indexOf(callback)

    if (index > -1) hooks.splice(index, 1)
}

export default Store
