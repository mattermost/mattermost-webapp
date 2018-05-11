// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import EmojiPage from './emoji_page.jsx';

function mapStateToProps(state) {
    const team = getCurrentTeam(state) || {};

    return {
        teamName: team.name,
        teamDisplayName: team.display_name,
        siteName: state.entities.general.config.SiteName,
    };
}

export default connect(mapStateToProps)(EmojiPage);
