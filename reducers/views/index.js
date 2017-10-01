// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';

import channel from './channel';
import rhs from './rhs';

export default combineReducers({
    rhs,
    channel
});
