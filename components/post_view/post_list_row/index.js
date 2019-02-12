// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {Preferences} from 'utils/constants.jsx';

import PostListRow from './post_list_row.jsx';

function mapStateToProps(state, ownProps) {
    const post = getPost(state, ownProps.listId) || null;

    return {
        post,
        channel: ownProps.channel,
        fullWidth: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.CHANNEL_DISPLAY_MODE, Preferences.CHANNEL_DISPLAY_MODE_DEFAULT) === Preferences.CHANNEL_DISPLAY_MODE_FULL_SCREEN,
    };
}

export default connect(mapStateToProps)(PostListRow);
