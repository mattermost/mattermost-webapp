// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import './utils.d';

import {$ID} from 'mattermost-redux/types/utilities';

declare namespace global {
    export = $ID;
}
