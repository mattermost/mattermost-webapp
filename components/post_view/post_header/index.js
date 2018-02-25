// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {Preferences} from 'mattermost-redux/constants';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import PostHeader from './post_header.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';

    return {
        displayNameType: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, 'name_format', 'false'),
        enablePostUsernameOverride,
    };
}

export default connect(mapStateToProps)(PostHeader);
