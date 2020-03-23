/**
 * component 接入 page 的 onShow onHide 生命周期
 * 需要页面栈、路由等的支持
 * 仅当页面 push 操作时才会有组件的 onHide， back 和 replace 因路由影响无法支持
  */
export default ({
    addLifecycle,
    $stat,
}) => {
    let _CID_ = 0
    const runLifecycle = (type, _this) => {
        if (!type || !_this) return

        if (typeof (_this._options || {})[type] === 'function') _this._options[type].call(_this)
        else if (typeof _this[type] === 'function') _this[type].call(_this)
    }

    addLifecycle('onInit', async function () {
        this._CID_ = _CID_++

        // 等待页面信息加载完成
        await $stat.getCurrentPage()

        // 在组件初始化的时候将该组件标记到当前路由页面
        const page = $stat.getPageStack().pop()

        if (!page.componentNodes) page.componentNodes = {}

        page.componentNodes[this._CID_] = this

        runLifecycle('onShow', this)
    }, { target: 'component' })

    addLifecycle('onDestroy', function () {
        // 在组件销毁时将该组件实例移除
        const page = $stat.getPageStack().pop()

        if (!page || !page.componentNodes) return

        page.componentNodes[this._CID_] = null
        delete page.componentNodes[this._CID_]
    }, { target: 'component' })

    addLifecycle('onShow', async function () {
        // 在页面展示的时候带着组件一起展示
        // 第一次由组件自身展示
        if (!$stat.verifyUnStat(this)) return

        if (!this.componentNodeShowFlag) return this.componentNodeShowFlag = true

        // 等待页面信息加载完成
        await $stat.getCurrentPage()

        const page = $stat.getPageStack().pop()

        Object.keys(page.componentNodes || {})
            .forEach(key => runLifecycle('onShow', page.componentNodes[key]))
    }, { target: 'page' })

    addLifecycle('onHide', function () {
        // 在页面隐藏的时候带着组件一起隐藏
        if (!$stat.verifyUnStat(this)) return

        const page = $stat.getPageStack(0, -1).pop()

        if (page && typeof page.getPageParams === 'function') {
            const { id: pageId } = page.getPageParams()
            const { id: ownId } = this.getOwnPageParams()

            // 说明 page 就是当前页面
            if (pageId === ownId) {
                Object.keys(page.componentNodes || {})
                    .forEach(key => runLifecycle('onHide', page.componentNodes[key]))
            }
        }
    }, { target: 'page' })
}
