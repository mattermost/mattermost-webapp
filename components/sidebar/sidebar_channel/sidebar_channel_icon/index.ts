// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';

import {hasPostDraft} from 'selectors/drafts';

import {GlobalState} from 'types/store';

import SidebarChannelIcon from './sidebar_channel_icon';

type OwnProps = {
    channel?: Channel;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const channel = ownProps.channel;

    const currentChannelId = getCurrentChannelId(state);

    return {
        hasDraft: currentChannelId !== channel?.id && hasPostDraft(state, channel?.id ?? ''),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarChannelIcon);
