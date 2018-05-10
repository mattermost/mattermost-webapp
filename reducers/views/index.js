// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import admin from './admin';
import channel from './channel';
import rhs from './rhs';
import posts from './posts';
import modals from './modals';
import emoji from './emoji';
import lhs from './lhs';
import webrtc from './webrtc';
import search from './search';
import notice from './notice';

export default combineReducers({
    admin,
    channel,
    rhs,
    posts,
    modals,
    emoji,
    lhs,
    webrtc,
    search,
    notice,
});
