
const hooks = []

const _Component = params => {
  // 处理数据
  hooks.forEach(fn => fn(params))

  // 组件类型
  params.getConnectType = () => 'useComponent'

  return params
}

_Component.use = fn => hooks.push(fn)

export default _Component