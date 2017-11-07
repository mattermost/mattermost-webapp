// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getCurrentTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import GetPostLinkModal from './get_post_link_modal';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        currentTeamUrl: getCurrentTeamUrl(state)
    };
}

export default connect(mapStateToProps)(GetPostLinkModal);
