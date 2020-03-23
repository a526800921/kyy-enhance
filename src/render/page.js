
const hooks = []

const _Page = (params, options) => {
  // 处理数据
  hooks.forEach(fn => fn(params, options))

  // 页面类型
  params.getConnectType = () => 'usePage'

  return params
}

_Page.use = fn => hooks.push(fn) 

export default _Page