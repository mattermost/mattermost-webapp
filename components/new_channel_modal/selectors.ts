// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {isMinimumServerVersion} from 'mattermost-redux/utils/helpers';

import {GlobalState} from 'types/store';

import {suitePluginIds} from 'utils/constants';

export function canCreateBoards(state: GlobalState) {
    const config = getConfig(state);
    if (config.FeatureFlagBoardsProduct === 'true') {
        return true;
    }

    // 7.2.1 is the minimum required; it exposes the boards templates api
    const focalboardManifest = state.plugins.plugins.focalboard;
    return focalboardManifest &&
        focalboardManifest.id === suitePluginIds.focalboard &&
        isMinimumServerVersion(focalboardManifest.version, 7, 2, 1);
}
