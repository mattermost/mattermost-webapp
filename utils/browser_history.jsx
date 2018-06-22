// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import createBrowserHistory from 'history/createBrowserHistory';

export const browserHistory = createBrowserHistory({basename: window.basename});
