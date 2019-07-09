// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import admin from './admin';
import browser from './browser';
import channel from './channel';
import rhs from './rhs';
import posts from './posts';
import modals from './modals';
import emoji from './emoji';
import i18n from './i18n';
import lhs from './lhs';
import search from './search';
import notice from './notice';
import system from './system';
import channelSelectorModal from './channel_selector_modal';

export default combineReducers({
    admin,
    browser,
    channel,
    rhs,
    posts,
    modals,
    emoji,
    i18n,
    lhs,
    search,
    notice,
    system,
    channelSelectorModal,
});
