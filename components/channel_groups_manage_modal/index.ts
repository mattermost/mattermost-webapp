// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {connect} from 'react-redux';

import {getGroupsAssociatedToChannel, unlinkGroupSyncable, patchGroupSyncable} from 'mattermost-redux/actions/groups';
import {getMyChannelMember} from 'mattermost-redux/actions/channels';
import {GlobalState} from '@mattermost/types/store';
import {Action} from 'mattermost-redux/types/actions';

import {closeModal, openModal} from 'actions/views/modals';

import {ModalData} from 'types/actions';

import ChannelGroupsManageModal from './channel_groups_manage_modal';

const mapStateToProps = (state: GlobalState, ownProps: any) => {
    return {
        channel: state.entities.channels.channels[ownProps.channelID],
    };
};

type Actions = {
    getGroupsAssociatedToChannel: (channelId: string, searchTerm: string, pageNumber: number, DEFAULT_NUM_PER_PAGE: number) => Promise<{
        data: boolean;
    }>;
    unlinkGroupSyncable: (itemId: string, channelId: string, type: string) => Promise<{
        data: boolean;
    }>;
    patchGroupSyncable: (itemId: string, channelId: string, groupsSyncableTypeChannel: string, params: {scheme_admin: boolean}) => Promise<{
        data: boolean;
    }>;
    getMyChannelMember: (channelId: string) => Promise<{
        data: boolean;
    }>;
    closeModal: (modalId: string) => void;
    openModal: <P>(modalData: ModalData<P>) => void;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators<ActionCreatorsMapObject<Action>, Actions>(
        {
            getGroupsAssociatedToChannel,
            closeModal,
            openModal,
            unlinkGroupSyncable,
            patchGroupSyncable,
            getMyChannelMember,
        },
        dispatch,
    ),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelGroupsManageModal);
