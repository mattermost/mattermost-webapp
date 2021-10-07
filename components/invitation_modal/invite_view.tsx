// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap'

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';

import InviteAs, {As} from './invite_as';

type CustomMessage = {
    message: string,
    sendCustomMessage: boolean,
};

export const defaultInviteState = deepFreeze({
    as: 'member',
    customMessage: {
        message: '',
        sendCustomMessage: false,
    },
    to: [],
    sending: false,
});

export type InviteState = {
    customMessage: CustomMessage,
    to: string[],
    as: As,
    sending: boolean,
};

type Props = InviteState & {
    setInviteAs: (as: As) => void,
    invite: () => void,
    inviteToTeamTreatment: InviteToTeamTreatments,
}

export default function InviteView(props: Props) {
    return (
        <>
            <Modal.Header>
                {'Invite {as} to {team_name}'}
            </Modal.Header>
            <Modal.Body>
                <InviteAs
                    as={props.as}
                    setInviteAs={props.setInviteAs}
                    inviteToTeamTreatment={props.inviteToTeamTreatment}
                />
                body
            </Modal.Body>
            <Modal.Footer>
                <span>
                    Copy invite link
                </span>
                <button disabled={true} onClick={props.invite}>
                    invite
                </button>
            </Modal.Footer>
        </>
    );
}
