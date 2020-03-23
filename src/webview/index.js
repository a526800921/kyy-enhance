export { default as default } from './useWebview'
import { injectLifecycle } from './useWebview'

export const webviewInit = ({
    addConnectQueue,
    addLifecycle,
    $router,
    $store,
}) => {
    // 将埋点方法注入 页面/组件
    addConnectQueue((arg, params) => {
        const useWebview = arg.find(item => item.type === 'useWebview')

        useWebview && useWebview.use(params, $router, $store)
    })

    // 注入生命周期
    injectLifecycle(addLifecycle)
}
