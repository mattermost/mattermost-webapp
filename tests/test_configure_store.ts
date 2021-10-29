// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {AnyAction} from 'redux';
import thunk, {ThunkDispatch} from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {GlobalState} from 'types/store';

type TestStoreDispatch = ThunkDispatch<GlobalState, undefined, AnyAction>;

export default function testConfigureStore(initialState = {}) {
    return configureStore<GlobalState, TestStoreDispatch>([thunk])(initialState as GlobalState);
}
