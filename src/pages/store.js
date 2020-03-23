import render, { Store, addDispatchQueue } from '../render'
import { userInfoEach, getId, deep, getOAID } from '../utils/utils'

const { $native, $router, $store: { dispatch, getState } } = render

export const storage = ['enterApp', 'IMEI', 'OAID', 'systemInfo']
export const store = new Store({
    b: 0,
    enterApp: 0, // 第几次进入快应用
    IMEI: '',
    OAID: '',
    systemInfo: { // 系统相关信息
        appInfo: null,
        deviceInfo: null,
        androidId: null,
    },
    isHUAWEI: false, // 是否是华为手机
    outPageTime: 300, // 被动退出页面延时
    network: '', // 网络状态
    hasInstalled: true, // 是否已添加桌面图标
    outPageNum: 0, // 需要退出页面的层数，用作多层页面退出
    envType: '', // 环境类型
})

userInfoEach(['update', 'out'], () => {
    // 用户切换/登出时，清除数据

})

export const setB = (b) => store.set({ b })

// 进入快应用次数计数
export const setEnterApp = () => store.set(state => ({ enterApp: state.enterApp + 1 }))

// 获取系统信息
export const getSystemInfo = () => addDispatchQueue('getSystemInfo', async () => {
    const { systemInfo } = store.get()

    if (systemInfo.appInfo && systemInfo.deviceInfo && systemInfo.androidId) return deep(systemInfo)

    const obj = {}

    if (!systemInfo.appInfo) obj.appInfo = await $native.app.getInfo()
    if (!systemInfo.deviceInfo) obj.deviceInfo = await $native.device.getInfo().catch(() => null)
    if (!systemInfo.androidId) obj.androidId = await $native.device.getUserId().then(res => res.userId).catch(() => null)

    const lastData =  {
        ...systemInfo,
        ...obj,
    }
    const brand = ((lastData.deviceInfo || {}).brand || '').toLowerCase()
    const isHUAWEI = ['huawei', 'honor'].find(name => brand.indexOf(name) > -1)

    store.set({
        systemInfo: lastData,
        isHUAWEI: !!isHUAWEI,
    })

    return deep(store.get().systemInfo)
})

// 系统授权
export const getIMEI = async () => {
    const { IMEI, OAID } = store.get()

    if (IMEI) return { IMEI, OAID }

    const { IMEI: imei, OAID: oaid, code } = await getId()

    if (code) return { code }

    const data = Object.assign(
        { IMEI: imei },
        oaid ? { OAID: oaid } : {}
    )

    store.set(data)

    return deep(data)
}

// 监听网络
export const setNetwork = () => {
    $native.network.subscribe({
        callback: function (res) {
            store.set({ network: res.type })
        }
    })
}

// 检测是否已添加桌面图标
export const inspectHasInstalled = async (status) => {
    if (status === true) return store.set({ hasInstalled: true })

    const { hasInstalled } = store.get()

    const res = await $native.shortcut.hasInstalled()
    const flag = res ? true : false

    hasInstalled !== flag && store.set({ hasInstalled: flag })
}

// 设置需要退出页面的层数，用作多层页面退出
export const setOutPageNum = (num = 0) => num >= 0 && store.set({ outPageNum: num }) 

// 设置当前环境类型 kfw -> 快服务
export const setEnvType = (type) => store.set({ envType: type })
