import render from '../render'

const { $native, $store: { dispatch, getState }, $router } = render

// 华为 undefined 会报错
export const stringify = data => JSON.stringify(data)

// 编码，因有些字符传不过去
export const encode = str => encodeURIComponent(str).replace(/[']/g, '_dyh_')
export const decode = str => decodeURIComponent(str.replace(/_dyh_/g, `'`))

export default {
    async getInfo({ success, fail, cancel }) {
        // 获取设备信息
        const { IMEI } = getState('Root')
        const { appInfo, deviceInfo } = await dispatch('Root/getSystemInfo')

        const data = {
            "versionName": appInfo.versionName, // "1.1.0",
            "deviceType": deviceInfo.osType,
            "appName": appInfo.name, // "xxx",
            "osver": deviceInfo.osVersionName, // "8.1.0",
            "appTypeCode": deviceInfo.osVersionCode, // "28",
            "appPackageName": appInfo.packageName, // "com.xx.xx",
            "imei": IMEI, // "865092047806428",
            "phoneName": `${deviceInfo.brand} ${deviceInfo.model}`, // "PBCM30"
        }

        success(stringify(data))
    },
}

