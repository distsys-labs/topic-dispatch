const matcher = require('../src/matcher')
const _ = require('fauxdash')

function on (topics, topic, fn) {
    if (typeof fn !== 'function') {
        throw new Error(`Cannot attach ${typeof fn} to '${topic}' as a handler`)
    }
    var m = matcher.create(topic)
    if (!topics[topic]) {
        var obj = {
            test: m.test,
            calls: [fn]
        }
        topics[topic] = obj
    } else {
        topics[topic].calls.push(fn)
    }
}

function once (topics, topic, fn) {
    if (typeof fn !== 'function') {
        throw new Error(`Cannot attach ${typeof fn} to '${topic}' as a handler`)
    }
    var callOnce = function callOnce(t, e) {
        fn(t, e)
        removeListener(topics, topic, callOnce)
    }
    on(topics, topic, callOnce)
}

function emit (topics, topic, event) {
    _.each(topics, (v) => {
        if (v.test(topic)) {
            var filtered = _.filter(v.calls).slice(0)
            _.each(filtered, c => {
                try {
                    c.call(null, topic, event)
                } catch (e) {
                    console.error(`exception caught emiting event to topic '${topic}':\n  ${e.stack}`)
                }
            })
        }
    })
}

function removeListener (topics, topic, fn) {
    var m = matcher.create(topic)
    var bindings = topics[m.topic]
    if (bindings) {
        let list = bindings.calls
        list.splice(list.indexOf(fn), 1)
        if (list.length == 0) {
            delete topics[m.topic]
        }
    }
}

function removeAllListeners (topics, topic) {
    if (topic != undefined) {
        var m = matcher.create(topic)
        delete topics[m.topic]
    } else {
        _.each(topics, (v, k) => {
            delete topics[k]
        })
    }
}

module.exports = function() {
    const topics = {}
    return {
        emit: emit.bind(null, topics),
        on: on.bind(null, topics),
        once: once.bind(null, topics),
        removeListener: removeListener.bind(null, topics),
        removeAllListeners: removeAllListeners.bind(null, topics)
    }
}