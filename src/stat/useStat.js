import { getPageChain, getCurrentPage, getLastPage, addPageChain, updatePageStack, getPageStack, verifyUnStat } from './stack'
import render from '../render'
import NodeStat from './nodeStat'

const { $store: { dispatch, getState }, addLifecycle } = render

// 上报队列
const uploadQueue = []
const amountCache = []
// 上报防抖
let uploadTimer = null

// 上报
const upload = async () => {
    const records = uploadQueue.splice(0, uploadQueue.length)

    console.log('stat', records)
}

// 埋点流程1，用于获取页面信息数据
const flow1 = async ({ useLast = false } = {}) => {
    const { name: currentPage, statParams: currentParams } = await (useLast ? getLastPage() : getCurrentPage())
    const { name: parentPage = '', statParams: parentParams = {} } = (useLast ? getPageChain(0, -1) : getPageChain()).pop() || {}

    return {
        currentPage,
        currentParams,
        parentPage,
        parentParams,
    }
}

// 埋点流程2，用于格式化数据
const flow2 = async ({
    param,
    currentPage,
    currentParams,
    parentPage,
    parentParams,
}) => {
    const { androidId } = await dispatch('Root/getSystemInfo')
    const { OAID } = getState('Root')

    if (!Array.isArray(param)) param = [param]

    // 格式化
    const records = param.map(item => {
        return {
            triggerTime: new Date().getTime().toString(),
            page: item.page || currentParams.page || currentPage || '/',
            pageParams: JSON.stringify(Object.assign(
                {
                    androidId,
                    OAID: OAID || null,
                },
                currentParams.pageParams || {},
                item.pageParams || {},
            )),
            parentPage: item.parentPage || parentParams.page || parentPage || '/',
            parentParams: parentParams.pageParams ? JSON.stringify(parentParams.pageParams) : '',
            action: item.action || currentParams.action || 'view',
            actionParams: (item.actionParams || currentParams.actionParams) ? JSON.stringify(item.actionParams || currentParams.actionParams) : '',
            target: item.target || currentParams.target || '页面',
        }
    })

    return records
}

/**
 * 埋点
 * @param {Object|Array} param 
 * @param {Object} useOwnFlow 使用在某一时刻保存的 flow1 作为参数
 */
export const $stat = async (param = {}, { outPage = false, useLast = false, amount = 0, useOwnFlow } = {}) => {
    const {
        currentPage,
        currentParams,
        parentPage,
        parentParams,
    } = (useOwnFlow ? useOwnFlow : (await flow1({ useLast })))

    const records = await flow2({
        param,
        currentPage,
        currentParams,
        parentPage,
        parentParams,
    })

    // 满 x 条才上传
    if (amount) {
        if (amountCache.length + records.length >= amount) {
            // 可以上传
            records.push(...amountCache.splice(0, amountCache.length))
        } else return amountCache.push(...records)
    }

    // 退出页面将缓存上传
    if (outPage) records.push(...amountCache)

    uploadQueue.push(...records)

    clearTimeout(uploadTimer)
    if (outPage) upload()
    else uploadTimer = setTimeout(() => upload(), 1000)
}

// 页面路径，页面栈控制
$stat.addPageChain = addPageChain
$stat.updatePageStack = updatePageStack
$stat.getCurrentPage = getCurrentPage
$stat.getPageStack = getPageStack
$stat.flow1 = flow1
$stat.verifyUnStat = verifyUnStat

// 节点埋点
export const $nodeStat = async function (params) {
    if (!params.id) return

    if (params.action === 'click') params.id = `nodeStat-${Date.now()}`

    // 获取当前页面
    const current = getPageStack().pop()
    const currentStat = await getCurrentPage()

    if (!current.nodeStat) current.nodeStat = new NodeStat({ max: currentStat.statParams.nodeMax, $stat })

    current.nodeStat.add(params)
}

export default (callback, { unStat, sync } = {}) => {
    // unStat 当前页面不进行上报和更新
    // sync 等待准备完成后上报

    return {
        type: 'useStat',
        use: params => {

            // 将获取埋点参数方法绑定到页面
            params.getStatDefaultParams = callback

            params.getStatOptions = () => ({ unStat, sync })

            return params
        }
    }
}
