// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap'

import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';
import deepFreeze from 'mattermost-redux/utils/deep_freeze';

export type ResultState = {
    sent: string[],
    error: boolean,
    not_sent: string[],
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
            <Modal.Body>
            </Modal.Body>
            <Modal.Footer>
                <span>invite more people</span>
                    <span>done</span>
            </Modal.Footer>
        </>
    );
}
