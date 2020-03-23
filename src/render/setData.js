// setData 设置值
// a.b[c].d
// a b c d
const reg = /[.[\]]/g
const change = (a, b) => JSON.stringify(a) !== JSON.stringify(b)
const setData = (target, data) => {
    const updates = []

    if (!target || !data) return updates

    Object.keys(data).forEach(key => {
        if (!reg.test(key)) {
            if (change(target[key], data[key])) {
                updates.push({
                    key,
                    oldValue: target[key],
                    newValue: data[key],
                })

                target[key] = data[key]
            }

            return
        }

        const germ = key.replace(reg, '-').split('-').filter(item => item)

        germ.reduce((a, b, index) => {
            if (index === germ.length - 1) {
                if (change(a[b], data[key])) {
                    updates.push({
                        key,
                        oldValue: a[b],
                        newValue: data[key],
                    })

                    a[b] = data[key]
                }
            }

            return a[b]
        }, target)
    })

    return updates
}

export default function (data = {}, { sync = false } = {}) {
    // 页面/组件已被销毁，则不执行
    if (this._destroyed) return Promise.resolve()

    if (sync) {
        // 异步的设置值不能保证 dispatch 后能立刻拿到值
        const updates = setData(this, data)

        // 设置完成之后走钩子
        updates.length && this.setDataHooks && this.setDataHooks.forEach(fn => fn.call(this, updates))

        return Promise.resolve()
    } else {
        // 平时则用异步设置值来优化
        if (!this.setDataQueue) this.setDataQueue = []

        this.setDataQueue.push(data)

        return Promise.resolve()
            .then(() => {
                if (!this.setDataQueue.length) return

                const updates = setData(
                    this,
                    this.setDataQueue
                        .splice(0, this.setDataQueue.length)
                        .reduce((a, b) => Object.assign(a, b), {})
                )

                // 设置完成之后走钩子
                updates.length && this.setDataHooks && this.setDataHooks.forEach(fn => fn.call(this, updates))
            })
    }

}

export const addSetDataHooks = function (callback) {
    if (!this.setDataHooks) this.setDataHooks = []

    this.setDataHooks.push(callback)
}
