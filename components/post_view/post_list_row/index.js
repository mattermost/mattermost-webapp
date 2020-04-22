// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getShortcutReactToLastPostEmittedFrom} from 'selectors/emojis';
import {emitShortcutReactToLastPostFrom} from 'actions/post_actions.jsx';

import PostListRow from './post_list_row.jsx';

function mapStateToProps(state, ownProps) {
    const shortcutReactToLastPostEmittedFrom = getShortcutReactToLastPostEmittedFrom(state);

    return {
        post: ownProps.post,
        channel: ownProps.channel,
        shortcutReactToLastPostEmittedFrom
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            emitShortcutReactToLastPostFrom,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostListRow);
