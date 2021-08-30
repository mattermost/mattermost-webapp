// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as UserAgent from '../utils/user_agent';
import * as Utils from '../utils/utils';

// TODO: once we provide a solution to support the global header in mobile views we can get rid of this selector
export function getGlobalHeaderEnabled(): boolean {
    return !(UserAgent.isMobile() || Utils.isMobile());
}
