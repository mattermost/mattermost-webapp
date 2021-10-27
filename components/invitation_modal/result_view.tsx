// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import deepFreeze from 'mattermost-redux/utils/deep_freeze';

export type ResultState = {
    sent: string[];
    error: boolean;
    not_sent: string[];
};

export const defaultResultState = deepFreeze({
    sent: [],
    error: false,
    not_sent: false,
});

export default function ResultView() {
    return (
        <>
            <Modal.Header>
                {'{as} invited to {team_name}'}
            </Modal.Header>
            <Modal.Body/>
            <Modal.Footer>
                <FormattedMessage
                    id='invitation_modal.invite.more'
                    defaultMessage='Invite More People'
                />
                <FormattedMessage
                    id='invitation_modal.confirm.done'
                    defaultMessage='Done'
                />
            </Modal.Footer>
        </>
    );
}
