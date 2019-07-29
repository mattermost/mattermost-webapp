// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
//
// Based on debounce-promise implementation from
// https://github.com/bjoerge/debounce-promise by Bjørge Næss

export default function debouncePromise(fn, wait = 0, options = {}) {
    let lastCallAt;
    let deferred;
    let timer;
    let pendingArgs = [];

    function flush() {
        const thisDeferred = deferred;
        clearTimeout(timer);

        Promise.resolve(options.accumulate ? fn.call(this, pendingArgs) : fn.apply(this, pendingArgs[pendingArgs.length - 1])).then(thisDeferred.resolve, thisDeferred.reject);

        pendingArgs = [];
        deferred = null;
    }

    return function debounced(...args) {
        const currentWait = getWait(wait);
        const currentTime = new Date().getTime();

        const isCold = !lastCallAt || (currentTime - lastCallAt) > currentWait;

        lastCallAt = currentTime;

        if (isCold && options.leading) {
            return options.accumulate ? Promise.resolve(fn.call(this, [args])).then((result) => result[0]) : Promise.resolve(fn.call(this, ...args));
        }

        if (deferred) {
            clearTimeout(timer);
        } else {
            deferred = defer();
        }

        pendingArgs.push(args);
        timer = setTimeout(flush.bind(this), currentWait);

        if (options.accumulate) {
            const argsIndex = pendingArgs.length - 1;
            return deferred.promise.then((results) => results[argsIndex]);
        }

        return deferred.promise;
    };
}

function getWait(wait) {
    return (typeof wait === 'function') ? wait() : wait;
}

function defer() {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}
