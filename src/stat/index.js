export { default as default, $stat, $nodeStat } from './useStat'

import stack, { getCurrentPage, verifyUnStat, getStatOptions } from './stack'
import { $stat } from './useStat'

// 埋点初始化
export const statInit = ({
    addConnectQueue,
    addRouteHooks,
    addLifecycle,
    $native,
    $store,
    usePage,
    $utils,
    $router,
}) => {
    // 将埋点方法注入 页面/组件
    addConnectQueue((arg, params) => {
        const useStat = arg.find(item => item.type === 'useStat')

        useStat && useStat.use(params)
    })

    // 页面路由
    stack({ addRouteHooks, addLifecycle, $native })

    // 页面end时间
    let time = 0

    addLifecycle('onShow', async function () {
        if (!verifyUnStat(this)) return

        time = Date.now()

        // 当前页面如果需要准备埋点数据则等待准备完成再上报
        if (getStatOptions(this).sync && this.syncStatReady === void 0) await new Promise(resolve => this.syncStatReady = () => resolve(this.syncStatReady = null))

        $stat()
    }, { target: 'page' })

    addLifecycle('onHide', function () {
        if (!verifyUnStat(this)) return

        $stat({
            target: '页面end',
            actionParams: { duration: Date.now() - time },
        }, { outPage: true, useLast: true })
    }, { target: 'page' })

    console.log('stat 初始化完成', Date.now())
}