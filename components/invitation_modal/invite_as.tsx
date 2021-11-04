// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import Radio from '@mattermost/compass-components/components/radio';

import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';

import './invite_as.scss';

export type As = 'member' | 'guest'

type Props = {
    setInviteAs: (as: As) => void;
    as: As;
    titleClass?: string;
    inviteToTeamTreatment: InviteToTeamTreatments;
}

export default function InviteAs(props: Props) {
    let control = (
        <div>
            <Radio
                checked={props.as === 'member'}
                onClick={() => {
                    props.setInviteAs('member');
                }}
            >
                <span className='InviteAs__label'>
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
                <span className='InviteAs__label'>
                    <FormattedMessage
                        id='invite_modal.choose_guest_a'
                        defaultMessage='Guest'
                    />
                    <span className='InviteAs__label--parenthetical'>
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

    if (props.inviteToTeamTreatment === InviteToTeamTreatments.SLIDER) {
        control = (
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
    }

    return (
        <div className='InviteAs'>
            <div className={props.titleClass}>
                <FormattedMessage
                    id='invite_modal.as'
                    defaultMessage='Invite as'
                />
            </div>
            {control}
        </div>
    );
}
