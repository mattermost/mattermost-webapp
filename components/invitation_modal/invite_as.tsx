// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';

export type As = 'member' | 'guest'

type Props = {
    setInviteAs: (as: As) => void,
    as: As
    inviteToTeamTreatment: InviteToTeamTreatments
}


export default function InviteAs(props: Props) {
    if (props.inviteToTeamTreatment === InviteToTeamTreatments.NONE) {
        console.error(`invariant violated. InviteAs should only be used with ${InviteToTeamTreatments.LIGHTBOX} or ${InviteToTeamTreatments.LIGHTBOX_SLIDER} treatments, but received ${props.inviteToTeamTreatment}`)
        return null;
    }
    let control = (
        <div>
            <span>This can't be undone.</span>
            <span>Guests are for temporary accounts that are limited to select channels or teams.</span>
            <span>{'off <-> on'}</span>

        </div>
    );
    if (props.inviteToTeamTreatment === InviteToTeamTreatments.LIGHTBOX) {
        control = (
            <div>
                <p>
                    Member
                </p>
                <p>
                    <span>
                    Guest
                    </span>
                    -
                    <span>
                        limited to select channels and teams
                    </span>
                </p>
            </div>
        );
    }
    return control
}
