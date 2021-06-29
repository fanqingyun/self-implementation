const PENDING = 'pending'
const REJECTED = 'rejected'
const FULFILLED = 'fulfilled'
function _resolve(val) {
    this.status = FULFILLED
    this.value = val
    this.onFulfilledList.forEach(fn => fn(this.value))
}
function _reject(val) {
    this.status = REJECTED
    this.reason = val
    this.onRejectedList.forEach(fn => fn(this.reason))
}
class CustomePromise {
    constructor (executor) {
        this.value = undefined
        this.reason = undefined
        this.status = PENDING
        this.onFulfilledList = []
        this.onRejectedList = []
        executor(_resolve.bind(this), _reject.bind(this))
    }
    /**
     * 在then里面如果状态为pending,则收集回调，放在一个数组里，因为then可能执行多次；否则立即执行
     * 在resolve或者reject中执行这些回调
     * 说明回调的执行在2个地方，then里面：当状态不为pending; resolve/reject里面，执行缓存的数组回调
     */
    then(onFulfilled, onRejected) {
        let _this = this
        const p = new Promise((nextResolve, nextReject) => {
            if (this.status === PENDING) {
                typeof onFulfilled === 'function' && _this.onFulfilledList.push(onFulfilled)
                typeof onRejected === 'function' && _this.onRejectedList.push(onRejected)
            }
            if (this.status === FULFILLED) {
                if (typeof onFulfilled === 'function') {
                    let x = onFulfilled(_this.value)
                    if (x === p) {
                        nextReject(new Error('TypeError')) 
                    } else if (typeof x === 'object') {
                        if (x.then) {
                            if (typeof x.then === 'function') {
                                x.then(nextResolve, nextReject)
                            } else {
                                nextResolve(x)
                            }
                        }
                    }
                }
            }
            if (this.status === REJECTED) {
                typeof onRejected === 'function' && onRejected(_this.reason)
            }
        })
        return p
    }
    catch () {

    }
    finally() {

    }
    static resolve() {

    }
    static reject() {

    }
    static all() {

    }
    static race() {

    }
    static allSettled() {

    }
    static any() {

    }
}

// 测试数据
const  p = new CustomePromise((resolve, reject) => {
    // setTimeout(reject, 1000, 'test')
        reject('testets')
})
p.then(null, console.log)
p.then(console.log,(str) => {
    console.log(str + 1111)
})