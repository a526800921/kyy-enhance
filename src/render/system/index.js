/****
 * 所有系统方法
 */
import proxy from './proxy'
import router from '@system.router'
import storage from '@system.storage'
import device from '@system.device'
import app from '@system.app'
import prompt from '@system.prompt'
import webview from '@system.webview'
import shortcut from '@system.shortcut'
import network from '@system.network'
import notification from '@system.notification'
import request from '@system.request'
import fetch from '@system.fetch'
import clipboard from '@system.clipboard'
import pkg from '@system.package'
import wifi from '@system.wifi'
import media from '@system.media'
import push from '@service.push'
import wxpay from '@service.wxpay'
import alipay from '@service.alipay'

export default {
    router,
    storage: proxy(storage),
    device: proxy(device),
    app,
    prompt: proxy(prompt),
    webview,
    shortcut: proxy(shortcut),
    network: proxy(network),
    notification,
    request: proxy(request),
    fetch: proxy(fetch),
    clipboard: proxy(clipboard),
    package: proxy(pkg),
    wifi: proxy(wifi),
    media: proxy(media),
    push: proxy(push),
    wxpay: wxpay,
    alipay: alipay,
}

// export default (key, subKey, ...params) => {
//     if (system[key] && system[key][subKey]) return system[key][subKey](...params)
    
//     return Promise.reject({ status: 404, msg: `system[${key}][${subKey}] is not a function` })
// }
