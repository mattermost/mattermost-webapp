// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {ActionFunc} from 'mattermost-redux/types/actions';

import {joinChannelById, switchToChannel} from 'actions/views/channel';
import {GlobalState} from 'types/store';

import ForwardPostModal from './forward_post_modal';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeam = getCurrentTeam(state);

    return {
        config,
        currentChannel,
        currentTeam,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, ActionCreatorsMapObject>({
            joinChannelById,
            switchToChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ForwardPostModal);
