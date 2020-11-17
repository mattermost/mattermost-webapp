// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getAllChannels as loadChannels, searchAllChannels} from 'mattermost-redux/actions/channels';

import {setModalSearchTerm} from 'actions/views/search';

import ChannelSelectorModal from './channel_selector_modal.jsx';

function mapStateToProps(state) {
    return {
        searchTerm: state.views.search.modalSearch,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadChannels,
            setModalSearchTerm,
            searchAllChannels,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelSelectorModal);
