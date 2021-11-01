// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {connect, ConnectedProps} from 'react-redux';

import {GenericAction, Action} from 'mattermost-redux/types/actions';

import {ModalData} from 'types/actions';

import {leaveChannel} from 'actions/views/channel';
import {openModal} from 'actions/views/modals';

import LeaveChannel from './leave_channel';

type Actions = {
    leaveChannel: (channelId: string) => void;
    openModal: <P>(modalData: ModalData<P>) => void;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>({
            leaveChannel,
            openModal,
        }, dispatch),
    };
}

const connector = connect(null, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(LeaveChannel);
