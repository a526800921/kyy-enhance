import pageName from './pageName'

// 页面前进路线
const pageChain = []
export const addPageChain = (data = null) => {
    if (pageChain.length >= 10) pageChain.shift()
    pageChain.push(data)
}
const updatePageChain = data => {
    const index = pageChain.length - 1

    pageChain.splice(index, 1, data)

    // 更新页面后将推入的方法执行
    getLastPageQueue.splice(0, getLastPageQueue.length).forEach(fn => fn())
}
export const getPageChain = (start, end) => pageChain.slice(start, end)

const getLastPageQueue = []
// 获取上一个页面信息
export const getLastPage = async () => {
    const current = getPageChain().pop()

    if (current === null) await new Promise(resolve => getLastPageQueue.push(resolve))

    return getPageChain().pop()
}

// 页面栈
const pageStack = []
const pageStackFn = {
    push(data) { pageStack.push(data) },
    replace(data) { pageStackFn.back(); pageStackFn.push(data) },
    back() { pageStack.pop() },
    clear() { pageStack.splice(0, pageStack.length - 1) },
}
export const updatePageStack = (type, data = {}) => pageStackFn[type](data)
const updatePageStackLast = callback => {
    const index = pageStack.length - 1

    // pageStack.splice(index, 1, callback)
    pageStack[index].getPageParams = callback

    // 更新页面后将推入的方法执行
    getCurrentPageQueue.splice(0, getCurrentPageQueue.length).forEach(fn => fn())
}
export const getPageStack = (start, end) => pageStack.slice(start, end)

const getCurrentPageQueue = []
// 获取当前页面信息
export const getCurrentPage = async () => {
    const current = getPageStack().pop() || {}
    if (typeof current.getPageParams !== 'function') await new Promise(resolve => getCurrentPageQueue.push(resolve))

    return (getPageStack().pop()).getPageParams()
}

export const getStatOptions = _this => (_this.getStatOptions ? _this.getStatOptions() : {})
export const verifyUnStat = _this => !getStatOptions(_this).unStat

// 页面id
let pageId = 0

export default ({ addRouteHooks, addLifecycle, $native }) => {
    let skipType = ''

    addRouteHooks('push', function (url, params) {
        addPageChain()
        updatePageStack('push', { url, params })
    })

    addRouteHooks('replace', function (url, params) {
        addPageChain()
        updatePageStack('replace', { url, params })
    })

    addRouteHooks('back', function ({ unUpdate } = {}) {
        // 不更新页面，由 onBackPress 更新，仅限 tabbar 页面
        if (unUpdate) return

        skipType = 'back'
        addPageChain()
        updatePageStack('back')
    })

    addRouteHooks('clear', function () {
        updatePageStack('clear')
    })

    addLifecycle('onInit', function () {
        if (!verifyUnStat(this)) return

        // 赋值页面id
        const id = pageId++
        const { path = '' } = $native.router.getState()

        this.getOwnPageParams = () => ({ id, path })

        const length = $native.router.getLength()
        const flag = length > getPageStack().length

        // 页面栈数量与实际不符合时推入一层
        // 1、第一个页面
        // 2、在快应用启动中从外部跳转到另一个页面
        if (flag) {
            const { props } = this._options
            const params = props ?
                (Array.isArray(props) ? props : Object.keys(props))
                    .reduce((obj, key) => {
                        obj[key] = this[key]

                        return obj
                    }, {})
                : {}

            updatePageStack('push', { url: path.slice(6), params })
        }
    }, { target: 'page', priority: 10 })

    addLifecycle('onShow', function () {
        if (!verifyUnStat(this)) return

        skipType = ''

        // 页面展示的时候更新当前页面的参数
        updatePageStackLast(() => {
            const statParams = this.getStatDefaultParams ? this.getStatDefaultParams.call(this, this) : {}
            const { id, path } = this.getOwnPageParams()

            return {
                path,
                name: pageName[path] ? pageName[path].page : '',
                id,
                statParams,
            }
        })
    }, { target: 'page', priority: 10 })

    addLifecycle('onHide', function () {
        if (!verifyUnStat(this)) return

        skipType = ''
        const statParams = this.getStatDefaultParams ? this.getStatDefaultParams.call(this, this) : {}
        const { id, path } = this.getOwnPageParams()

        // 页面离开的时候更新最后一个页面的参数
        updatePageChain({
            path,
            name: pageName[path] ? pageName[path].page : '',
            id,
            statParams,
        })
    }, { target: 'page', priority: 10 })

    addLifecycle('onBackPress', function (flag) {
        if (!verifyUnStat(this)) return

        if (flag !== true) {
            if (skipType === 'back') skipType = ''
            else {
                addPageChain()
                updatePageStack('back')
            }
        }
    }, { target: 'page' })
}
