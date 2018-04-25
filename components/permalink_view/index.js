// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getPostsAfter, getPostsBefore, getPostThread} from 'mattermost-redux/actions/posts';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import PermalinkView from './permalink_view';

function mapStateToProps(state) {
    return {
        currentTeam: getCurrentTeam(state),
        currentChannel: getCurrentChannel(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getPostThread,
            getPostsAfter,
            getPostsBefore,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PermalinkView);
