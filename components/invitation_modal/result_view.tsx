// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';
import {t} from 'utils/i18n';

import {As} from './invite_as';
import ResultTable, {InviteResult} from './result_table';

import './result_view.scss';

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
    headerClass: string;
    footerClass: string;
    inviteMore: () => void;
} & ResultState;

export default function ResultView(props: Props) {
    const {formatMessage} = useIntl();
    return (
        <>
            <Modal.Header className={props.headerClass}>
                <h1>
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
                </h1>
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
            <Modal.Footer className={props.footerClass}>
                <button
                    onClick={props.inviteMore}
                    className='btn btn-cancel ResultView__inviteMore'
                    data-testid='invite-more'
                >
                    <FormattedMessage
                        id='invitation_modal.invite.more'
                        defaultMessage='Invite More People'
                    />
                </button>
                <button
                    onClick={props.onDone}
                    className='btn btn-primary'
                    data-testid='confirm-done'
                    aria-label='Close'
                    title='Close'
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
