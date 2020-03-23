import messageToWeb, { encode, decode, stringify } from './message-to-web'

const getParams = (webId, $router, { dispatch }) => ({
    data: {
        [`${webId}_allowthirdpartycookies`]: true,
        [`${webId}_trustedurl`]: [/^http[\s\S]+/],
    },

    methods: {
        [`${webId}_onPageStart`](e) {
            console.log('### pagestart ###', e.url, new Date())
        },
        [`${webId}_onTitleReceive`](e) {
            console.log('### onTitleReceive ###', e.title, new Date())
        },
        [`${webId}_onError`](e) {
            console.log('### pageError ###', e, new Date())
        },
        [`${webId}_isCanForward`]() {
            // 检测页面路由是否可以前进
            const web = this.$element(webId)

            if (!web) return $router.back()

            web.canForward({ callback: e => e && web.forward() })
        },
        [`${webId}_isCanBack`]() {
            // 检测页面路由是否可以返回
            const web = this.$element(webId)

            if (!web) return $router.back()

            web.canBack({
                callback: (e) => {
                    if (e) web.back() 
                    else $router.back()
                }
            })
        },
        [`${webId}_onPageFinish`](e) {
            console.log('### onPageFinish ###', e, new Date())

            // 页面加载完成
            this[`${webId}_onPostMessage`]({ key: 'onInit' })
            // 页面展示
            this[`${webId}_onPostMessage`]({ key: 'onResume' })

            // 展示关闭按钮
            const web = this.$element(webId)
            if (web) web.canBack({
                callback: flag => {
                    console.log('emit onPageFinish', flag)

                    this.onPageFinish && this.onPageFinish({ webId, closeShow: !!flag })
                }
            })
            else this.onPageFinish && this.onPageFinish({ webId, closeShow: false })
        },
        [`${webId}_onMessage`](e) {
            // web给快应用发送消息
            console.log('web给快应用发送消息', decode(e.message))
            const { key, data } = JSON.parse(decode(e.message))

            // 炮灰
            if (key === 'kyy_push_notice') return

            try {
                messageToWeb[key]({
                    success: arg => this[`${webId}_onPostMessage`]({ key: 'successCallback', data: arg }),
                    fail: arg => this[`${webId}_onPostMessage`]({ key: 'errorCallback', data: arg }),
                    cancel: arg => this[`${webId}_onPostMessage`]({ key: 'cancelCallback', data: arg }),
                    page: this,
                }, ...data)

            } catch (error) {
                console.error(key, '方法不存在或执行错误', error)

                this[`${webId}_onPostMessage`]({ key: 'errorCallback', data: { key, error: error.stack } })
            }
        },
        [`${webId}_onPostMessage`]({ key, data }) {
            // 快应用给web发送消息
            console.log('快应用给web发送消息', key, data)
            const web = this.$element(webId)

            if (web) {
                // 发送内容
                web.postMessage({ message: encode(stringify({ key, data })) })

                // 给h5一个立即的答复，防止具体内容被吞
                web.postMessage({ message: encode(stringify({ key: 'kyy_push_notice', data: {} })) })
            }
        },
        [`${webId}_onShow`]() {
            // 页面展示
            this[`${webId}_onPostMessage`]({ key: 'onResume' })
        },
        [`${webId}_onHide`]() {
            // 页面隐藏
            this[`${webId}_onPostMessage`]({ key: 'onPause' })
        },
        [`${webId}_onDestroy`]() {
            // 页面销毁
            this[`${webId}_onPostMessage`]({ key: 'onStop' })
            // 页面销毁的时候刷新用户信息
            // 在外部改变用户信息时，应用本身无法感知
            // dispatch('Profile/getUserInfo', { reset: true })
        },
    }
})

export default ({ page, webId, $router, $store }) => {
    const { data, methods } = getParams(webId, $router, $store)
    if (!page.data) page.data = {}
    if (typeof page.data === 'function') {
        const fn = page.data

        page.data = function (...arg) {
            return {
                ...fn.apply(this, arg),
                ...data,
            }
        }
    } else Object.assign(page.data, data)

    Object.assign(page, methods)

    return page
}