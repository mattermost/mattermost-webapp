// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

export function makeAsyncComponent(LazyComponent, loadingScreen) {
    return (props) => (
        <React.Suspense fallback={loadingScreen}>
            <LazyComponent {...props}/>
        </React.Suspense>
    );
}
