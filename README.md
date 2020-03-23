

## 后期优化

> 缓存按需加载，防止第一次进入页面时间过长 -> 目前耗时100~300ms

> 组件store更新优化，在页面隐藏时 -> 已完成

> 目前 useWatch 需通过 useComputed 触发 -> 已修复

## 当前可用

> useConnect 用作连接扩展和页面/组件

> useStore 使用Store 状态注入

> useComputed 使用计算属性

> useWatch 使用监听, 支持 immediate

> useStat 使用埋点 提供:
     
* $stat(params) 自主埋点
    * $stat.getCurrentPage 获取当前页面信息 Promise
* $nodeStat({ id, ...params }) 节点埋点

> useWebview 在当前页面使用webview

> usePage 页面扩展 提供: 

* this.setData(data) 修改值所用的方法，用于触发computed watch，异步赋值

> useComponent 组件扩展，提供api同 usePage

> app.ux

* getContext, 提供
    * useConnect(...arg)
    * useStore(key, callback) callback: state => ({})
    * useComputed(obj)
    * useWatch(obj)
    * useStat(callback) callback: () => ({})
    * usePage(obj)
    * useComponent(obj)
    * $store 
        * dispatch('key/callback', ...arg) 用作触发导出的方法
        * getState(key?) 传入key时获取指定局部状态，未传入时获取全局状态
    * $native.prompt.showToast(...arg) 用不用没关系
    * $router
        * push(url, params)
        * replace(url, params)
        * back()
        * reLaunch(url, params) 销毁其他页面进行跳转
    * $utils
        * deep(obj) 深拷贝
        * setItem(key, value) 设置缓存
        * getItem(key) 获取缓存
        * removeItem(key) 删除缓存
        * iconInstall 添加桌面弹窗
        * addHook(key, callback) 处理钩子的函数，返回函数销毁当前钩子
        * getHook(key): Array<Function> 获取当前钩子队列
* onPageInit() 页面自定义生命周期，store 初始化完成后执行
* onPageShow() 同 onPageInit

> render
    
* addDispatchQueue(key, callback) 按顺序执行回调

> store文件

```js
// 状态声明好了之后需要在 /store/index 中加入
import render, { Store } from '../render'

// 需要 dispatch 从render中获取
const { $store: { dispatch } } = render

// 需要缓存的字段
export const storage = ['xx']
// 状态，这个必须导出
export const store = new Store({
    xx: 0
})

export const setXx = (aa) => {
    const { xx } = store.get()

    // 两种写法都行
    if (!xx) store.set({ xx: 2 })
    else store.set(state => ({ xx: state.xx - 2 }))
}
```
