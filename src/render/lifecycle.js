const hooks = {}
const runHooks = (_this, { target, options }, type, ...arg) => {
    if (!hooks[type]) return

    for (let i = 0; i < hooks[type].length; i++) {
        const item = hooks[type][i]

        if (!item.target || item.target === target) {
            const flag = item.callback.call(_this, ...arg, options)
            
            // 阻断该回调之后的回调执行
            if (item.interdict && flag === true) return
        }
    }
}
    

export const addLifecycle = (type, callback, { target, priority, interdict } = {}) => {
    if (!hooks[type]) hooks[type] = []
    // 强制给页面
    // onShow onHide 对组件完成支持
    if (!target && [/* 'onShow', 'onHide',  */'onBackPress'].indexOf(type) > -1) target = 'page'
    // 添加的数据
    const data = { target, callback, priority, interdict }

    // 优先级高为 0 ，数字越大 优先级越小
    // 赋予方法阶段优先级为 0 ~ 5
    // 赋值阶段为 6 ~ 10
    // 其他为 11 以后
    if (typeof priority === 'number' && hooks[type].length > 0) {
        // 最近一个没有优先级的
        const noWeight = hooks[type].findIndex(item => item.priority === void 0)

        // 当前队列没有有优先级的，则添加到第一个
        if (noWeight === 0) hooks[type].unshift(data)
        // 当前队列有或都有优先级的
        else {
            // 最近一个低于当前优先级的
            const index = hooks[type].findIndex(item => item.priority && item.priority > priority)
            // 当前优先级就是最小优先级
            if (index === -1) {
                // 该队列所有成员都有优先级，则添加到最后一个
                if (noWeight === -1) hooks[type].push(data)
                // 否则添加到优先级的最后一个
                else hooks[type] = [
                    ...hooks[type].slice(0, noWeight), 
                    data, 
                    ...hooks[type].slice(noWeight, hooks[type].length)
                ]
            }
            // 有比当前优先级还要小的，则插入到更小的前面一个位置
            else hooks[type] = [
                ...hooks[type].slice(0, index),
                data,
                ...hooks[type].slice(index, hooks[type].length)
            ]
        }
    }
    else hooks[type].push(data)
}

export default (params, { target = 'page', options }) => {
    const { onInit, onShow, onReady, onHide, onDestroy, onBackPress } = params

    params.onInit = function (...arg) {
        runHooks(this, { target, options }, 'onInit', ...arg)

        return onInit && onInit.apply(this, arg)
    }

    params.onReady = function () {
        runHooks(this, { target, options }, 'onReady')

        return onReady && onReady.apply(this)
    }

    params.onDestroy = function () {
        runHooks(this, { target, options }, 'onDestroy')

        return onDestroy && onDestroy.apply(this)
    }
    
    // onShow onHide 对组件完成支持
    params.onShow = function () {
        runHooks(this, { target, options }, 'onShow')

        return onShow && onShow.apply(this)
    }

    params.onHide = function () {
        runHooks(this, { target, options }, 'onHide')

        return onHide && onHide.apply(this)
    }

    if (target === 'page') {
        // 只有页面才有这些
        params.onBackPress = function () {
            const flag = onBackPress ? onBackPress.apply(this) : void 0
            runHooks(this, { target, options }, 'onBackPress', flag)

            return flag
        }
    }
}

