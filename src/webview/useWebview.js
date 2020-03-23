import merge from './merge'

/**
 * 在当前页面使用 webview
 * @param {String} webId web组件的id
  */
export default (webId) => {

    return {
        type: 'useWebview',
        use: (params, $router, $store) => {
            merge({ page: params, webId, $router, $store })
            
            // onShow, onHide, onDestroy封装
            const lastOnShow = params.WEBVIEW_onShow
            params.WEBVIEW_onShow = function (...arg) {
                params[`${webId}_onShow`].call(this, ...arg)

                return lastOnShow && lastOnShow.call(this, ...arg)
            }

            const lastOnHide = params.WEBVIEW_onHide
            params.WEBVIEW_onHide = function (...arg) {
                params[`${webId}_onHide`].call(this, ...arg)

                return lastOnHide && lastOnHide.call(this, ...arg)
            }

            const lastOnDestroy = params.WEBVIEW_onDestroy
            params.WEBVIEW_onDestroy = function (...arg) {
                params[`${webId}_onDestroy`].call(this, ...arg)

                return lastOnDestroy && lastOnDestroy.call(this, ...arg)
            }

            return params
        }
    }
}

export const injectLifecycle = addLifecycle => {
    addLifecycle('onShow', function () {
        this.WEBVIEW_onShow && this.WEBVIEW_onShow()
    }, { target: 'page' })

    addLifecycle('onHide', function () {
        this.WEBVIEW_onHide && this.WEBVIEW_onHide()
    }, { target: 'page' })

    addLifecycle('onDestroy', function () {
        this.WEBVIEW_onDestroy && this.WEBVIEW_onDestroy()
    }, { target: 'page' })
}