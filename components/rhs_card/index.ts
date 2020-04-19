// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {Post} from 'mattermost-redux/types/posts';

import {getSelectedPostCard} from 'selectors/rhs.jsx';
import {GlobalState} from 'types/store';

import RhsCard from './rhs_card';

function mapStateToProps(state: GlobalState) {
    const selected = getSelectedPostCard(state) as Post;
    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';

    return {
        enablePostUsernameOverride,
        selected,
        pluginPostCardTypes: state.plugins.postCardTypes,
        teamUrl: getCurrentRelativeTeamUrl(state),
    };
}

export default connect(mapStateToProps)(RhsCard);
