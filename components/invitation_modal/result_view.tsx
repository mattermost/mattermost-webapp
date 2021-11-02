// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {t} from 'utils/i18n';

import {As} from './invite_as';
import ResultTable, {InviteResult} from './result_table';

export type InviteResults = {
    sent: InviteResult[];
    notSent: InviteResult[];
}

export type ResultState = {
    sent: InviteResult[];
    notSent: InviteResult[];
    error: boolean;
};

export const defaultResultState = deepFreeze({
    sent: [],
    error: false,
    notSent: [],
});

type Props = {
    invitedAs: As;
    currentTeamName: string;
    onDone: () => void;
    inviteMore: () => void;
} & ResultState;

export default function ResultView(props: Props) {
    const {formatMessage} = useIntl();
    return (
        <>
            <Modal.Header>
                <FormattedMessage
                    id='invite_modal.invited'
                    defaultMessage='{as} invited to {team_name}'
                    values={{
                        as: formatMessage({
                            id: props.invitedAs === 'member' ? t('invite_modal.invited_members') : t('invite_modal.invited_guests'),
                            defaultMessage: props.invitedAs === 'member' ? 'Members' : 'Guests',
                        }),
                        team_name: props.currentTeamName,
                    }}
                />
            </Modal.Header>
            <Modal.Body>
                {props.notSent.length > 0 && (
                    <ResultTable
                        sent={false}
                        rows={props.notSent}
                    />
                )}
                {props.sent.length > 0 && (
                    <ResultTable
                        sent={true}
                        rows={props.sent}
                    />
                )}
            </Modal.Body>
            <Modal.Footer>
                <button
                    onClick={props.inviteMore}
                >
                    <FormattedMessage
                        id='invitation_modal.invite.more'
                        defaultMessage='Invite More People'
                    />
                </button>
                <button
                    onClick={props.onDone}
                >
                    <FormattedMessage
                        id='invitation_modal.confirm.done'
                        defaultMessage='Done'
                    />
                </button>
            </Modal.Footer>
        </>
    );
}
