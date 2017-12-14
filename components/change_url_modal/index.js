// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import {getCurrentTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import ChangeURLModal from './change_url_modal';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        currentTeamURL: getCurrentTeamUrl(state)
    };
}

export default connect(mapStateToProps)(ChangeURLModal);
