// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Preferences} from 'mattermost-redux/constants';
import {getTheme, getBool} from 'mattermost-redux/selectors/entities/preferences';

import {selectPost} from 'actions/views/rhs';
import {getIsRhsExpanded, getIsRhsOpen} from 'selectors/rhs';

import PostMessageView from './post_message_view.jsx';

function mapStateToProps(state) {
    return {
        enableFormatting: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'formatting', true),
        isRHSExpanded: getIsRhsExpanded(state),
        isRHSOpen: getIsRhsOpen(state),
        pluginPostTypes: state.plugins.postTypes,
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            selectPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostMessageView);
