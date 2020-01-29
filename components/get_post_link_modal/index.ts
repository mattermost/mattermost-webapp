// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';

import {getSiteURL} from 'utils/url';

import GetPostLinkModal from './get_post_link_modal';

function mapStateToProps(state: GlobalState) {
    const currentTeam = getCurrentTeam(state) || {};
    const currentTeamUrl = `${getSiteURL()}/${currentTeam.name}`;
    return {
        currentTeamUrl,
    };
}

export default connect(mapStateToProps)(GetPostLinkModal);
