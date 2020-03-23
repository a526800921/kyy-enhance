export default class NodeStat {
    constructor({ max = 8, $stat } = {}) {
        this.max = max
        this.nodes = []
        this.history = []
        this.timer = null
        this.$stat = $stat
    }

    add(params) {
        // 添加节点
        this.nodes.push(params)
        
        Promise.resolve().then(() => this.upload())
        // clearTimeout(this.timer)
        // this.timer = setTimeout(() => this.upload(), 500)
    }

    upload() {
        // 上报
        if (!this.nodes.length) return

        const obj = {}
        const last = this.nodes
            .splice(0, this.nodes.length) // 取出
            .slice(-this.max) // 拿最后几个
            .filter(item => obj[item.id] ? false : (obj[item.id] = true)) // 重复过滤
            .filter(item => this.history.indexOf(item.id) === -1) // 已上传过滤

        if (!last.length) return

        // 上报
        this.$stat(last)
        // 加入上报历史
        this.history.push(...last.map(item => item.id))
    }
}
