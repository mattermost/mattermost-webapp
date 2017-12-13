// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {Preferences} from 'mattermost-redux/constants';
import {getTheme, getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserMentionKeys} from 'mattermost-redux/selectors/entities/users';

import PostMessageView from './post_message_view.jsx';

function mapStateToProps(state) {
    return {
        enableFormatting: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'formatting', true),
        mentionKeys: getCurrentUserMentionKeys(state),
        pluginPostTypes: state.plugins.postTypes,
        theme: getTheme(state)
    };
}

export default connect(mapStateToProps)(PostMessageView);
