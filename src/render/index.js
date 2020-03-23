import usePage from './page'
import useComponent from './component'
import useConnect, { addConnectQueue } from './connect'
import useWatch, { listener } from './watch'
import useComputed, { update as computedUpdate } from './computed'

computedUpdate.use({ listener })

import setData, { addSetDataHooks } from './setData'
import lifecycle, { addLifecycle } from './lifecycle'

import $native from './system'
import $router, { addRouteHooks } from './router'

import storeGather from './store/index'

const {
  store, // store 类
  // Store, // store 实例集
  subscribe, // store 监听
  unsubscribe, // store 移除监听
  addStore, // 添加 store 文件，至少需导出 export const store = new Store({})
  addStoreAfter, // 添加 store 文件完成之后
  useStore, // 在页面/组件中使用 store
  injectLifecycle, // 将 store 改变与 页面/组件 做数据同步
  $store, // 在页面/组件中使用的方法集 getState dispatch
  storeReadyAfter, // store 初始化之前的准备工作
  // storeReadyBefore, // store 初始化完成之后
} = storeGather

injectLifecycle(addLifecycle)

addStoreAfter(() => console.log('store 页面状态添加完毕', Date.now()))
storeReadyAfter(() => console.log('store 初始化完毕', Date.now()))

// 页面方法封装
usePage.use((params, options) => {
  // 自定义生命周期
  lifecycle(params, { target: 'page', options })
})

// 组件方法封装
useComponent.use(params => {
  // 自定义生命周期
  lifecycle(params, { target: 'component' })
})

// setData集成
addLifecycle('onInit', function () {
  // setData 为异步赋值 如果需要立刻得到结果 则使用 await this.setData()
  this.setData = setData.bind(this)
  this.addSetDataHooks = addSetDataHooks.bind(this)

  // data改变时触发computed的改变
  // 待computed改变完成后触发监听
  // computed 和 watch 都是基于setData做渲染
  this.addSetDataHooks(computedUpdate)
}, { priority: 1 })

export default {
  usePage,
  useComponent,
  useConnect,
  addConnectQueue,
  useWatch,
  useComputed,
  $native,
  $router,
  addRouteHooks,
  addLifecycle,

  $store,
  addStore,
  subscribe,
  unsubscribe,
  useStore,
  storeReadyAfter,
}

export const Store = store
export { addDispatchQueue } from './dispatchQueue'
