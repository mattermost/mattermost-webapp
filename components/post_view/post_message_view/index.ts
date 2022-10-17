// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getTheme, isPostFormattingEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import {getIsRhsExpanded, getIsRhsOpen} from 'selectors/rhs';

import {GlobalState} from 'types/store';

import PostMessageView from './post_message_view';

function mapStateToProps(state: GlobalState) {
    return {
        enableFormatting: isPostFormattingEnabled(state),
        isRHSExpanded: getIsRhsExpanded(state),
        isRHSOpen: getIsRhsOpen(state),
        pluginPostTypes: state.plugins.postTypes,
        theme: getTheme(state),
        currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
    };
}

export default connect(mapStateToProps)(PostMessageView);
