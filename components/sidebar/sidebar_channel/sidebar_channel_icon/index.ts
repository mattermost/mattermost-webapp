// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';

import {getPostDraft} from 'selectors/rhs';
import {StoragePrefixes} from 'utils/constants';
import {GlobalState} from 'types/store';

import SidebarChannelIcon from './sidebar_channel_icon';

type OwnProps = {
    channel?: Channel;
}

function hasDraft(draft: any, currentChannelId?: string, channel?: Channel) {
    return draft && Boolean(draft.message.trim() || draft.fileInfos.length || draft.uploadsInProgress.length) && currentChannelId !== channel?.id;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const currentChannelId = getCurrentChannelId(state);
    const draft = ownProps.channel?.id ? getPostDraft(state, StoragePrefixes.DRAFT, ownProps.channel.id) : false;

    return {
        hasDraft: hasDraft(draft, currentChannelId, ownProps.channel),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarChannelIcon);
