import store, { subscribe, unsubscribe } from './store'
import { Store, addStore, addStoreAfter } from './addStore'
import { useStore, injectLifecycle } from './useStore'
import { $store, storeReadyAfter, storeReadyBefore } from './middleware'
import storage, { initStorage } from './storage'

// store 添加完成
// storage 初始化完成
// store 准备完毕

// 使用本地缓存
$store.use(storage)
// 在 ready 之前准备数据
storeReadyBefore(initStorage)

export default {
    store,
    subscribe,
    unsubscribe,
    Store,
    addStore,
    addStoreAfter,
    useStore,
    injectLifecycle,
    $store,
    storeReadyAfter,
    storeReadyBefore,
}