// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import UserSettingsThemes from './themes_tab';

export function makeMapStateToProps() {
    return (state: GlobalState) => {
        const config = getConfig(state);
        const allowCustomThemes = config.AllowCustomThemes === 'true';

        return {
            allowCustomThemes,
        };
    };
}

export default connect(makeMapStateToProps)(UserSettingsThemes);
