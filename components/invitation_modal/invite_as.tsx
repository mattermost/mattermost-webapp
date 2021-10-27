// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import Radio from '@mattermost/compass-components/components/radio';

import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';

export type As = 'member' | 'guest'

type Props = {
    setInviteAs: (as: As) => void;
    as: As;
    inviteToTeamTreatment: InviteToTeamTreatments;
}

export default function InviteAs(props: Props) {
    if (props.inviteToTeamTreatment === InviteToTeamTreatments.NONE) {
        // eslint-disable-next-line no-console
        console.error(`invariant violated. InviteAs should only be used with ${InviteToTeamTreatments.LIGHTBOX} or ${InviteToTeamTreatments.LIGHTBOX_SLIDER} treatments, but received ${props.inviteToTeamTreatment}`);
        return null;
    }
    let control = (
        <div>
            <FormattedMessage
                id='invite_modal.permanent'
                defaultMessage="This can't be undone."
            />
            <FormattedMessage
                id='invite_modal.guest_purpose'
                defaultMessage='Guests are for temporary accounts that are limited to select channels or teams.'
            />
            <span>{'slider: off <-> on'}</span>
        </div>
    );
    if (props.inviteToTeamTreatment === InviteToTeamTreatments.LIGHTBOX) {
        control = (
            <div>
                <Radio
                    checked={props.as === 'member'}
                    onClick={() => {
                        props.setInviteAs('member');
                    }}
                >
                    <span style={{color: 'black'}}>
                        <FormattedMessage
                            id='invite_modal.choose_member'
                            defaultMessage='Member'
                        />
                    </span>
                </Radio>
                <Radio
                    checked={props.as === 'guest'}
                    onClick={() => {
                        props.setInviteAs('guest');
                    }}
                >
                    <span style={{color: 'black'}}>
                        <FormattedMessage
                            id='invite_modal.choose_guest_a'
                            defaultMessage='Guest'
                        />
                        <span>
                            {' - '}
                            <FormattedMessage
                                id='invite_modal.choose_guest_b'
                                defaultMessage='limited to select channels and teams'
                            />
                        </span>
                    </span>
                </Radio>
            </div>
        );
    }
    return (<div>
        <FormattedMessage
            id='invite_modal.as'
            defaultMessage='Invite as'
        />
        {control}
    </div>);
}
