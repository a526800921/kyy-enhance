import device from '@system.device'
import $native from '../render/system'
import $router from '../render/router'

export { addDispatchQueue } from '../render/dispatchQueue'

export const deep = obj => JSON.parse(JSON.stringify(obj))

// 缓存
export const setItem = (key, value) => $native.storage.set({ key, value: JSON.stringify(value) })
export const getItem = (key) =>
    $native.storage.get({ key, default: 'storage_default' })
        .then(res => {

            try {
                return JSON.parse(res)
            } catch (error) {
                return res
            }
        })
        .then(res => {
            if (res === 'storage_default') return void 0

            return res
        })
export const removeItem = (key) => $native.storage.delete({ key })

// 跳转到webview页面
export const toWebview = (url, params = {}, { type = 'push' } = {}) => $router[type]('/Webview', { url: encodeURIComponent(url), ...params })

// 处理钩子的函数，返回函数销毁当前钩子
const hooks = {}
export const addHook = (key, callback) => {
    if (!hooks[key]) hooks[key] = {
        id: 0,
        queue: [],
    }

    const current = hooks[key]
    const params = {
        id: current.id++,
        callback,
    }

    current.queue.push(params)

    return () => {
        const index = current.queue.findIndex(item => item.id === params.id)

        if (index > -1) current.queue.splice(index, 1)
    }
}
export const getHook = key => (hooks[key] ? hooks[key].queue : []).map(item => item.callback)

// 添加桌面图标
export const iconInstall = (params) => new Promise(resolve => {
    const { $stat, $store: { dispatch, getState } } = getContext()
    const message = getState('AppConfig').installMessage

    // 调用前钩子
    getHook('iconInstall/beforeEach').forEach(fn => fn())

    // 调用结束钩子
    const afterEach = flag => getHook('iconInstall/afterEach').forEach(fn => fn(flag, params))

    // 加桌埋点
    $stat({
        target: '系统加桌弹窗',
    })

    // 回调
    const callback = flag => {
        // 加桌埋点
        $stat({
            target: '系统加桌弹窗',
            action: 'click',
            actionParams: {
                status: flag ? '添加' : '取消'
            }
        })

        resolve(flag)
        afterEach(flag)
        setTimeout(() => dispatch('Root/inspectHasInstalled', flag), 4)
    }

    $native.shortcut.install({
        message,
        success: () => callback(true),
        fail: () => callback(false),
    })
})
// 添加桌面图标钩子
iconInstall.beforeEach = callback => addHook('iconInstall/beforeEach', callback)
iconInstall.afterEach = callback => addHook('iconInstall/afterEach', callback)

// 用户信息钩子 enter get update out
export const userInfoEach = (type = [], callback) => addHook(`getUserInfo/change`, (_type, ...arg) => (type === 'change' || type.indexOf(_type) > -1) && callback(...arg))

// 系统授权
export const getId = () => new Promise(resolve => {
    const { $stat } = getContext()

    $stat({ target: '系统授权弹框' })

    $native.device.getId({
        type: ['device', 'oaid'],
        success: (data) => {
            $stat({
                target: '系统授权弹框',
                action: 'click',
                actionParams: { status: '允许' },
            })

            resolve({
                IMEI: data.device,
                OAID: data.oaid || '',
            })
        },
        fail: (data, code) => {
            $stat({
                target: '系统授权弹框',
                action: 'click',
                actionParams: { status: '拒绝' },
            })

            resolve({ code })
        }, // code == 201 -> 用户拒绝授权
    });
})

// 授权之后获取OAID
export const getOAID = async () => {
    const [a, b] = await Promise.all([
        new Promise(resolve => {
            $native.device.getId({
                type: ['oaid'],
                success: (data) => resolve(data.oaid || ''),
                fail: () => resolve(''),
            });
        }),
        // 1060+ 的方法，尝试获取oaid
        device.getOAID ?
            new Promise(resolve => {
                device.getOAID({
                    success: (data) => resolve(data.oaid || ''),
                    fail: () => resolve(''),
                })
            }) : ''
    ])

    return a || b
}

export const formatTime = time => {
    // 格式化时间 2019-05-22 19:33:03
    const fill = num => num < 10 ? `0${num}` : `${num}`

    const date = new Date(+time)
    const YYYY = date.getFullYear()
    const MM = date.getMonth() + 1
    const DD = date.getDate()
    const tt = date.getHours()
    const mm = date.getMinutes()
    const ss = date.getSeconds()

    return `${YYYY}-${fill(MM)}-${fill(DD)} ${fill(tt)}:${fill(mm)}:${fill(ss)}`
}

//验证手机号
export const validatePhone = (phone) => {
    if (!phone) return '您的手机号不能为空！';
    if (!/^1[123456789]\d{9}$/.test(phone)) return '您的输入的号码有误，请重新输入';
    return '';
};
