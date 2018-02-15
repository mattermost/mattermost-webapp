// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {Preferences} from 'mattermost-redux/constants';
import {getTheme, getBool} from 'mattermost-redux/selectors/entities/preferences';

import PostMessageView from './post_message_view.jsx';

const mapStateToProps = (state) => ({
    enableFormatting: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'formatting', true),
    pluginPostTypes: state.plugins.postTypes,
    theme: getTheme(state)
});

export default connect(mapStateToProps)(PostMessageView);
