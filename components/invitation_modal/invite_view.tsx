// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';
import {Channel} from 'mattermost-redux/types/channels';

import InviteAs, {As} from './invite_as';
import AddToChannels, {CustomMessageProps, InviteChannels, defaultCustomMessage, defaultInviteChannels} from './add_to_channels';

export const defaultInviteState = deepFreeze({
    as: 'member',
    customMessage: defaultCustomMessage,
    to: [],
    sending: false,
    inviteChannels: defaultInviteChannels,
});

export type InviteState = {
    customMessage: CustomMessageProps;
    to: string[];
    as: As;
    sending: boolean;
    inviteChannels: InviteChannels;
};

type Props = InviteState & {
    setInviteAs: (as: As) => void;
    invite: () => void;
    onChannelsChange: (channels: Channel[]) => void;
    onChannelsInputChange: (channelsInputValue: string) => void;
    currentTeamName: string;
    currentChannelName: string;
    inviteToTeamTreatment: InviteToTeamTreatments;
    setCustomMessage: (message: string) => void;
    toggleCustomMessage: () => void;
    channelsLoader: (value: string, callback?: (channels: Channel[]) => void) => Promise<Channel[]>;
}

export default function InviteView(props: Props) {
    return (
        <>
            <Modal.Header>
                <FormattedMessage
                    id='invite_modal.title'
                    defaultMessage={'Invite {as} to {team_name}'}
                    values={{
                        as: (
                            props.as === 'member' ?
                                <FormattedMessage
                                    id='invite_modal.members'
                                    defaultMessage='members'
                                /> :
                                <FormattedMessage
                                    id='invite_modal.guests'
                                    defaultMessage='guests'
                                />
                        ),
                        team_name: props.currentTeamName,
                    }}
                />
            </Modal.Header>
            <Modal.Body>
                <InviteAs
                    as={props.as}
                    setInviteAs={props.setInviteAs}
                    inviteToTeamTreatment={props.inviteToTeamTreatment}
                />
                {props.as === 'guest' && (
                    <AddToChannels
                        setCustomMessage={props.setCustomMessage}
                        toggleCustomMessage={props.toggleCustomMessage}
                        customMessage={props.customMessage}
                        onChannelsChange={props.onChannelsChange}
                        onChannelsInputChange={props.onChannelsInputChange}
                        inviteChannels={props.inviteChannels}
                        channelsLoader={props.channelsLoader}
                        currentChannelName={props.currentChannelName}
                    />
                )}
            </Modal.Body>
            <Modal.Footer>
                <FormattedMessage
                    id='invite_modal.copy_link'
                    defaultMessage='Copy invite link'
                />
                <button
                    disabled={true}
                    onClick={props.invite}
                >
                    <FormattedMessage
                        id='invite_modal.invite'
                        defaultMessage='Invite'
                    />
                </button>
            </Modal.Footer>
        </>
    );
}
