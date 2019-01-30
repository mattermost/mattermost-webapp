// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import {getSelectedPostCard} from 'selectors/rhs.jsx';

import RhsCard from './rhs_card.jsx';

function mapStateToProps(state) {
    const selected = getSelectedPostCard(state);
    let channel = null;
    if (selected) {
        channel = getChannel(state, selected.channel_id);
    }

    return {
        selected,
        channel,
        pluginPostCardTypes: state.plugins.postCardTypes,
    };
}

export default connect(mapStateToProps)(RhsCard);
