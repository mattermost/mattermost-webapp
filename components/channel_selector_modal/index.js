// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getAllChannels as loadChannels, searchAllChannels} from 'mattermost-redux/actions/channels';

import {getChannelsForChannelSelector} from 'selectors/views/channel_selector_modal';
import {setModalSearchTerm} from 'actions/views/search';

import ChannelSelectorModal from './channel_selector_modal.jsx';

function mapStateToProps(state) {
    const searchTerm = state.views.search.modalSearch;

    const channels = Object.values(getChannelsForChannelSelector(state) || {}).filter((channel) => {
        return channel.display_name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
               channel.team_display_name.toLowerCase().startsWith(searchTerm.toLowerCase());
    });

    return {
        searchTerm,
        channels,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadChannels,
            setModalSearchTerm,
            searchChannels: searchAllChannels,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelSelectorModal);
