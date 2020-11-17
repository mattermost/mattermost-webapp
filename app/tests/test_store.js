// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

export default function testConfigureStore(initialState = {}) {
    return configureStore([thunk])(initialState);
}
