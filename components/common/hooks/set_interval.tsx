// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useRef, useEffect, MutableRefObject} from 'react';

export function useInterval(callback: any, delay: number) {
    const savedCallback: MutableRefObject<any> = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            if (savedCallback !== undefined && savedCallback.current !== undefined) {
                savedCallback.current();
            }
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
        return delay;
    }, [delay]);
}
