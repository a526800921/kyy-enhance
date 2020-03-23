const {resolve} = require('path');

// 加载本地node_modules下模块, 不影响其他私有模块执行
function loadNpmModule(module) {
  /*eslint-disable*/
  return resolve(__dirname, `../node_modules/${module}`);
}

module.exports = function (babel) {

  const {types: t} = babel;

  // 为所有js自动添加 async await 支持
  const autoFileImports = {
    'regeneratorRuntime': loadNpmModule('@babel/runtime/regenerator')
  };

  return {
    name: 'sx-transform', // not required
    visitor: {

      Program(path) {
        
        // 空文件
        if (path.node.end === 0) return;

        Object.keys(autoFileImports).forEach(item => {

          const imp = path.node.body.findIndex(block => {
            
            if (!t.isImportDeclaration(block)) return;

            const isSpecifiers = block.specifiers.findIndex(specifier => {
              if (!t.isImportDefaultSpecifier(specifier)) return;
              return specifier.local.name === item;
            });

            return isSpecifiers >= 0;
          }) >= 0;

          // 已经存在
          if (imp) return;

          path.node.body.unshift(
            t.importDeclaration(
              [
                t.importDefaultSpecifier(
                  t.Identifier(item)
                )
              ],
              t.stringLiteral(autoFileImports[item])
            )
          );
        });
      }
    }
  };
};
