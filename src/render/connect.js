const queue = []
export const addConnectQueue = callback => queue.push(callback)

export default (...arg) => {
    if (arg.length < 1) return {}

    const params = arg.find(item => !item.type) || {}
    const useStores = arg.filter(item => item.type === 'useStore')
    const useComputed = arg.find(item => item.type === 'useComputed')
    const useWatch = arg.find(item => item.type === 'useWatch')

    // 有执行顺序
    useStores.forEach(item => item.use(params))
    useComputed && useComputed.use(params)
    useWatch && useWatch.use(params)

    queue.forEach(callback => callback(arg, params))

    return params
}
