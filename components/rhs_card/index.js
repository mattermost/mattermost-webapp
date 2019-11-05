// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {closeRightHandSide} from 'actions/views/rhs';

import {getSelectedPostCard} from 'selectors/rhs.jsx';

import RhsCard from './rhs_card.jsx';

function mapStateToProps(state) {
    const selected = getSelectedPostCard(state);
    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';

    return {
        enablePostUsernameOverride,
        selected,
        pluginPostCardTypes: state.plugins.postCardTypes,
        teamUrl: getCurrentRelativeTeamUrl(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeRightHandSide,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RhsCard);
