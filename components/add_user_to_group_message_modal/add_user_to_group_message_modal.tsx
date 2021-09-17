// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {openModal} from 'actions/views/modals';
import GenericModal from 'components/generic_modal';
import MoreDirectChannels from 'components/more_direct_channels';
import ChannelInviteModal from 'components/channel_invite_modal';
import {GlobalState} from 'types/store';
import {ModalIdentifiers} from 'utils/constants';

type Props = {
    onHide: () => void;
    actions: {
        openModal: (modalData: { modalId: string; dialogType: any; dialogProps?: any }) => void;
    };
}

const AddUserToGroupMessageModal: React.FC<Props> = (props: Props) => {
    const dispatch = useDispatch();
    const channel = useSelector((state: GlobalState) => getCurrentChannel(state));
    const currentTeamId = useSelector((state: GlobalState) => getCurrentTeamId(state));

    const channelWithTeamId = {
        ...channel,
        team_id: currentTeamId,
    };
    const [hasSeenModal, setHasSeenModal] = useState(false);

    const handleAddToNewGroup = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.CREATE_DM_CHANNEL,
            dialogType: MoreDirectChannels,
        }));

        setHasSeenModal(true);
    };

    const handleAddToExistingGroup = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel: channelWithTeamId},
        }));

        setHasSeenModal(true);
    };

    return (
        <GenericModal
            show={!hasSeenModal}
            onHide={props.onHide}
            modalHeaderText={(
                <FormattedMessage
                    id={'add_users_to_group_message_modal.title'}
                    defaultMessage={'Add People to Group Message'}
                />
            )}
            handleConfirm={handleAddToExistingGroup}
            handleCancel={handleAddToNewGroup}
            confirmButtonText={(
                <FormattedMessage
                    id={'add_users_to_group_message_modal.confirm'}
                    defaultMessage='Add to existing'
                />
            )}
            cancelButtonText={(
                <FormattedMessage
                    id={'add_users_to_group_message_modal.cancel'}
                    defaultMessage='Start a new group'
                />
            )}
        >
            <span className='SidebarWhatsNewModal__helpText'>
                <FormattedMessage
                    id={'add_users_to_group_message_modal.description'}
                    defaultMessage='Do you want to add people to this group with the existing conversation history or start a new group?'
                />
            </span>
        </GenericModal>
    );
};

export default AddUserToGroupMessageModal;
