// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineEpics} from 'redux-observable';

import {changeToCloudLicenseEpic} from './entities';

export default combineEpics(changeToCloudLicenseEpic);
