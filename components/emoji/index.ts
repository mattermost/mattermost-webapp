// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {loadRolesIfNeeded} from 'mattermost-redux/actions/roles';

import {GlobalState} from 'types/store';

import EmojiPage from 'components/emoji/emoji_page';

function mapStateToProps(state: GlobalState) {
    const team = getCurrentTeam(state) || {};

    return {
        teamId: team.id,
        teamName: team.name,
        teamDisplayName: team.display_name,
        siteName: state.entities.general.config.SiteName,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            loadRolesIfNeeded,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmojiPage);
