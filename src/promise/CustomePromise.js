const PENDING = 'pending'
const REJECTED = 'rejected'
const FULFILLED = 'fulfilled'
function _resolve (val) {
    this.status = FULFILLED
    this.value = val
    this.onFulfilledList.forEach((fn) => fn(this.value))
}
function _reject (val) {
    this.status = REJECTED
    this.reason = val
    this.onRejectedList.forEach((fn) => fn(this.reason))
}
function isFn (param) {
    return typeof param === 'function'
}
// promise解决过程
function resolvePromise (promise2, x, resolve, reject) {
    if(promise2 === x){
        reject(new TypeError('Chaining cycle'))
    }
    if(x && typeof x === 'object' || typeof x === 'function'){
        let used; // 只调用一次
        try {
            let then = x.then
            if(typeof then === 'function'){
                then.call(x, (y)=>{
                    if (used) return;
                    used = true
                    resolvePromise(promise2, y, resolve, reject) // y可能是promise,需要递归调用
                }, (r) =>{
                    if (used) return;
                    used = true
                    reject(r)
                })
            } else {
                if (used) return;
                used = true
                resolve(x)
            }
        } catch(e){
            if (used) return;
            used = true
            reject(e)
        }
    } else {
        resolve(x)
    }
 }
class CustomePromise {
    constructor(executor) {
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
    then (onFulfilled, onRejected) {
        /**
         * 这一步完善简单的promise，因为要处理返回值，并且对这个返回值进行处理，把处理过程封装在resolvePromise里
         * 由于then的回调是异步执行的，因此我们需要把onFulfilled和onRejected执行放到异步中去执行，同时做一下错误的处理：
         */
        let _this = this
        onFulfilled = isFn(onFulfilled) ? onFulfilled : (value) => value
        onRejected = isFn(onRejected) ? onRejected : (reason) => { throw reason }
        const promise2 = new Promise((resolve, reject) => {
            if (this.status === PENDING) {
                _this.onFulfilledList.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(_this.value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    }, 0)
                })
                _this.onRejectedList.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(_this.reason)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    }, 0)
                })
            }
            if (this.status === FULFILLED) {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(_this.value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                }, 0)
            }
            if (this.status === REJECTED) {
                setTimeout(() => {
                    try {
                        let x = onRejected(_this.reason)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                }, 0)
            }
        })
        return promise2
    }
    catch () { }
    finally () { }
    static resolve () { }
    static reject () { }
    static all () { }
    static race () { }
    static allSettled () { }
    static any () { }
}

// 测试数据
// const  p = new CustomePromise((resolve, reject) => {
//     // setTimeout(reject, 1000, 'test')
//         reject('testets')
// })
// p.then(null, console.log)
// p.then(console.log,(str) => {
//     console.log(str + 1111)
// })

// 测试promise规范，注意要先安装promises-aplus-tests
CustomePromise.defer = CustomePromise.deferred = function () {
    let dfd = {}
    dfd.promise = new CustomePromise((resolve, reject) => {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}
module.exports = CustomePromise
