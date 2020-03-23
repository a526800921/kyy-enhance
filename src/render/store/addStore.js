// 总状态
export const Store = {}

// 状态载入完毕
let addStoreEnd = false
const addStoreQueue = []
export const addStoreAfter = callback => addStoreEnd ? callback(Store) : addStoreQueue.push(callback)
export const addStore = stores => {
    Object.keys(stores).forEach(key => Store[key] = stores[key])

    addStoreEnd = true
    addStoreQueue.splice(0, addStoreQueue.length).forEach(fn => fn(Store))
}