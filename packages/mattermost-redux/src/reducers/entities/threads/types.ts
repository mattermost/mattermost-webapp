// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserThread} from 'mattermost-redux/types/threads';

export type ExtraData = {
    threadsToDelete?: UserThread[];
}
