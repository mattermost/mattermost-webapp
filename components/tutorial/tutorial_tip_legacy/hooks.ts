// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {useMemo} from 'react';

import useElementAvailable from 'components/common/hooks/useElementAvailable';

import {TutorialTipPunchout} from './tutorial_tip_backdrop';

type PunchoutOffset = {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function useMeasurePunchoutsDepricated(elementIds: string[], additionalDeps: any[], offset?: PunchoutOffset): TutorialTipPunchout | null | undefined {
    const elementsAvailable = useElementAvailable(elementIds);

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
            x: `${minX + (offset ? offset.x : 0)}px`,
            y: `${minY + (offset ? offset.y : 0)}px`,
            width: `${(maxX - minX) + (offset ? offset.width : 0)}px`,
            height: `${(maxY - minY) + (offset ? offset.height : 0)}px`,
        };
    }, [...elementIds, ...additionalDeps, elementsAvailable]);
    return channelPunchout;
}
