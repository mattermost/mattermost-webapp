// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';

import admin from './admin';
import channel from './channel';
import rhs from './rhs';
import posts from './posts';
import modals from './modals';
import emoji from './emoji';
import lhs from './lhs';
import webrtc from './webrtc';

export default combineReducers({
    admin,
    channel,
    rhs,
    posts,
    modals,
    emoji,
    lhs,
    webrtc,
});
