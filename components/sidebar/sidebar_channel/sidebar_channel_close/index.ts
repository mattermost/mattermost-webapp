// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {getCurrentChannelId, shouldHideDefaultChannel} from 'mattermost-redux/selectors/entities/channels';
import {Channel} from 'mattermost-redux/types/channels';
import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';

import Constants from 'utils/constants';

import SidebarChannelClose from './sidebar_channel_close';

type OwnProps = {
    channel: Channel;
    show: boolean;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const currentChannelId = getCurrentChannelId(state);
    const active = ownProps.channel.id === currentChannelId;

    let shouldHideChannelClose = false;
    if (
        ownProps.channel.name === Constants.DEFAULT_CHANNEL &&
        !active &&
        shouldHideDefaultChannel(state, ownProps.channel) &&
        !isFavoriteChannel(state.entities.preferences.myPreferences, ownProps.channel.id)
    ) {
        shouldHideChannelClose = true;
    }

    return {
        show: ownProps.show && !shouldHideChannelClose,
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
