// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {connect} from 'react-redux';
import {canManageChannelMembers} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'mattermost-redux/types/store';
import {ActionFunc} from 'mattermost-redux/types/actions';

import {openModal} from 'actions/views/modals';

import ChannelMembersModal from './channel_members_modal';

const mapStateToProps = (state: GlobalState) => ({
    canManageChannelMembers: canManageChannelMembers(state),
});

type Actions = {
    openModal: (modalData: {
        modalId: string;
        dialogProps: {};
        dialogType: (props: {}) => React.ReactElement | null;
    }) => Promise<{data: boolean}>;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({openModal}, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelMembersModal);
