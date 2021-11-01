// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {Action} from 'mattermost-redux/types/actions';

import {ModalData} from 'types/actions';

import {leaveChannel} from 'actions/views/channel';
import {openModal} from 'actions/views/modals';

import SidebarBaseChannel from './sidebar_base_channel';

type Actions = {
    leaveChannel: (channelId: any) => Promise<{
        error: any;
        data?: undefined;
    } | {
        data: boolean;
        error?: undefined;
    }>;
    openModal: <P>(modalData: ModalData<P>) => void;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
            leaveChannel,
            openModal,
        }, dispatch),
    };
}

const connector = connect(null, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SidebarBaseChannel);
