// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/// <reference types="@welldone-software/why-did-you-render" />

import React from 'react';

if (process.env.NODE_ENV === 'development') { // eslint-disable-line no-process-env
    const whyDidYouRender = require('@welldone-software/why-did-you-render'); // eslint-disable-line global-require
    whyDidYouRender(React, {
        trackAllPureComponents: false,
    });
}
