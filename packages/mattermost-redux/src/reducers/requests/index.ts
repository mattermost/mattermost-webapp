// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import channels from './channels';
import files from './files';
import general from './general';
import posts from './posts';
import teams from './teams';
import users from './users';
import admin from './admin';
import jobs from './jobs';
import search from './search';
import roles from './roles';

export default combineReducers({
    channels,
    files,
    general,
    posts,
    teams,
    users,
    admin,
    jobs,
    search,
    roles,
});
