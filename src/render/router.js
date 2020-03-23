import $native from './system'
import { addHook, getHook } from '../utils/utils'

// 跳转节流
let flag = {}
setInterval(() => flag = {}, 600)

const fillUrl = url => /^\//.test(url) ? url : `pages/${url}`

const $router = {
  reLaunch(url, params) {

    return runBefore(
      { url, params },
      (_url, _params) => {
        $router.clear()

        return $router.replace(_url, _params)
      }
    )
  },
  push(url, params = {}) {
    if (flag[url]) return
    flag[url] = true

    return runBefore(
      { url, params },
      (_url, _params) => {
        _url = fillUrl(_url)

        runHooks('push', _url, _params)

        return $native.router.push({ uri: _url, params: _params })
      }
    )
  },
  replace(url, params = {}) {
    if (flag[url]) return
    flag[url] = true

    return runBefore(
      { url, params },
      (_url, _params) => {
        _url = fillUrl(_url)

        runHooks('replace', _url, _params)

        return $native.router.replace({ uri: _url, params: _params })
      }
    )
  },
  back(params) {
    return runBefore(
      { url: '' },
      () => {
        runHooks('back', params)

        return $native.router.back()
      }
    )
  },
  clear() {
    runHooks('clear')

    return $native.router.clear()
  },
}

export default $router

const hooks = [
  // {
  //   type: 'push',
  //   callback: () => {}
  // }
]
const runHooks = (type, ...arg) => hooks.forEach(item => item.type === type && item.callback(...arg))

export const addRouteHooks = (type, callback) => hooks.push({ type, callback })

// 导航拦截
$router.beforeEach = callback => addHook('router/beforeEach', callback)

const runBefore = async (params, callback) => {
  await new Promise(resolve => setTimeout(resolve, 4)) // 兼容埋点处理

  const bf = getHook('router/beforeEach').slice()

  const order = (_params) => {
    const fn = bf.shift()

    if (!fn) return _params
    const res = fn(_params)

    // 为 false 时阻止跳转
    if (res === false) return false

    return order(res)
  }

  const res = order(params)
  if (res === false) return

  callback(res.url, res.params)
}


