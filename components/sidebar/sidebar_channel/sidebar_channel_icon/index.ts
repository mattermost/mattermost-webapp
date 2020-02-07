// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';

import {getPostDraft} from 'selectors/rhs';
import {StoragePrefixes} from 'utils/constants';

import SidebarChannelIcon from './sidebar_channel_icon';

type OwnProps = {
    channel: Channel;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const currentChannelId = getCurrentChannelId(state);
    const draft = ownProps.channel.id ? getPostDraft(state, StoragePrefixes.DRAFT, ownProps.channel.id) : false;

    return {
        hasDraft: draft && Boolean(draft.message.trim() || draft.fileInfos.length || draft.uploadsInProgress.length) && currentChannelId !== ownProps.channel.id,
        channelIsArchived: ownProps.channel.delete_at !== 0,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarChannelIcon);
