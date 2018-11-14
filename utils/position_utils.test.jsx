// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {popOverOverlayPosition} from 'utils/position_utils.jsx';

test('Should return placement position for overlay based on bounds, space required and innerHeight', () => {
    const targetBounds = {
        top: 400,
        bottom: 500,
    };

    expect(popOverOverlayPosition(targetBounds, 1000, {above: 300})).toEqual('top');
    expect(popOverOverlayPosition(targetBounds, 1000, {above: 500, below: 300})).toEqual('bottom');
    expect(popOverOverlayPosition(targetBounds, 1000, {above: 450})).toEqual('bottom');
    expect(popOverOverlayPosition(targetBounds, 1000, {above: 600})).toEqual('left');
});
