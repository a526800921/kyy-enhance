export default (target) => {
    return Object.keys(target).reduce((obj, key) => {
        obj[key] = (params) => new Promise((resolve, reject) => {

            try {
                target[key]({
                    success: (res) => resolve(res),
                    // callback: (res) => resolve(res),
                    fail: (err) => {
                        console.error(`API调用错误[${key}]：`, err)

                        reject(err)
                    },
                    ...params,
                })
            } catch (error) {
                console.error(`${key} API有误：`, error)

                reject(error)
            }
        })

        return obj
    }, {})
}