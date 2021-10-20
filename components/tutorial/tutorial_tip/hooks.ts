// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useEffect, useRef, useState, useMemo} from 'react';

import {TutorialTipPunchout} from './tutorial_tip_backdrop';

export function notifyElementAvailability(
    elementIds: string[],
): boolean {
    const checkAvailableInterval = useRef<NodeJS.Timeout | null>(null);
    const [available, setAvailable] = useState(false);
    useEffect(() => {
        if (available) {
            if (checkAvailableInterval.current) {
                clearInterval(checkAvailableInterval.current);
                checkAvailableInterval.current = null;
            }
            return;
        } else if (checkAvailableInterval.current) {
            return;
        }
        checkAvailableInterval.current = setInterval(() => {
            if (elementIds.every((x) => document.getElementById(x))) {
                setAvailable(true);
                if (checkAvailableInterval.current) {
                    clearInterval(checkAvailableInterval.current);
                    checkAvailableInterval.current = null;
                }
            }
        }, 500);
    }, []);

    return useMemo(() => available, [available]);
}

export function measurePunchouts(elementIds: string[], additionalDeps: any[]): TutorialTipPunchout | null | undefined {
    const elementsAvailable = notifyElementAvailability(elementIds);
    const channelPunchout = useMemo(() => {
        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;
        for (let i = 0; i < elementIds.length; i++) {
            const rectangle = document.getElementById(elementIds[i])?.getBoundingClientRect();
            if (!rectangle) {
                return null;
            }
            if (rectangle.x < minX) {
                minX = rectangle.x;
            }
            if (rectangle.y < minY) {
                minY = rectangle.y;
            }
            if (rectangle.x + rectangle.width > maxX) {
                maxX = rectangle.x + rectangle.width;
            }
            if (rectangle.y + rectangle.height > maxY) {
                maxY = rectangle.y + rectangle.height;
            }
        }
        return {
            x: `${minX}px`,
            y: `${minY}px`,
            width: `${maxX - minX}px`,
            height: `${maxY - minY}px`,
        };
    }, [...elementIds, ...additionalDeps, elementsAvailable]);
    return channelPunchout;
}
