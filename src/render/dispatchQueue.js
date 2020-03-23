// dispatch队列
const dispatchQueue = {};
const dispatchRuning = {};
const dispatchRunQueue = async key => {
    const current = dispatchQueue[key].shift()

    if (!current) return dispatchRuning[key] = false

    dispatchRuning[key] = true

    await Promise.race([
        Promise.resolve(current.callback())
            .then(res => current.resolve(res))
            .catch(err => console.error('runQueue', key, err))
        ,
        new Promise(resolve => setTimeout(resolve, 5000))
    ])

    dispatchRunQueue(key)
}

const start = (key) => !dispatchRuning[key] && dispatchRunQueue(key)

export const addDispatchQueue = (key, callback) => {
    if (!dispatchQueue[key]) dispatchQueue[key] = []

    return new Promise(resolve => {
        dispatchQueue[key].push({
            callback,
            resolve,
        })

        start(key)
    })
}