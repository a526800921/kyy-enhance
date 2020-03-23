import { getItem, setItem, removeItem } from '../../utils/utils'

const getKey = (k1, k2) => `storage_${k1}/${k2}`

// 将需要缓存的store数据进行缓存
const useStorage = ({ key, updates, storage = [] }) => {
    if (!storage || !storage.length) return

    const filter = updates.filter(item => storage.indexOf(item.key) > -1)

    filter.forEach(item => {
        if (item.newValue === void 0) removeItem(getKey(key, item.key))
        else setItem(getKey(key, item.key), item.newValue)
    })
}

export default Store => {
    // store改变监听
    Object.keys(Store).forEach(key =>
        Store[key].store.subscribe(updates =>
            useStorage({
                key,
                updates,
                storage: Store[key].storage,
            })
        )
    )
}

export const initStorage = Store => new Promise(resolve => {
    // 初始化store数据
    const storages = Object.keys(Store)
        .map(key => ({ key, storage: Store[key].storage }))
        .filter(item => item.storage)
    // .reduce((a, b) => a.concat(b.storage.map(key => ([b.key, key]))), [])

    if (storages.length === 0) return resolve()

    let typeCount = 0
    storages.forEach(async item => {
        const values = await Promise.all(
            item.storage.map(key =>
                getItem(getKey(item.key, key))
                    .then(res => ({ [key]: res }))
                    .catch(() => ({}))
            )
        )

        Store[item.key].store && Store[item.key].store.set(() => values.reduce((a, b) => Object.assign(a, b), {}))

        typeCount++
        if (typeCount === storages.length) {
            // 全部store数据都赋值完毕
            resolve()
        }
    })
})
