// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Channel} from 'mattermost-redux/types/channels';
import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';

import SidebarChannelClose from './sidebar_channel_close';

type OwnProps = {
    channel: Channel;
    show: boolean;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    return {
    };
}

type Actions = {
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarChannelClose);
