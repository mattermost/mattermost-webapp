// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

export * from './generic_modal/generic_modal';

export {CircleSkeletonLoader, RectangleSkeletonLoader} from './skeleton_loader';

export function componentLibraryTest() {
    return 'testing result';
}

export function MyComponent() {
    return (
        <div>
            {'Testing '}
        </div>
    );
}
