// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import RadioGroup from 'components/common/radio_group';

import './invite_as.scss';
import Toggle from 'components/toggle';

export const As = {
    MEMBER: 'MEMBER',
    GUEST: 'GUEST',
} as const;

export type As = typeof As[keyof typeof As];

export type Props = {
    setInviteAs: (as: As) => void;
    as: As;
    titleClass?: string;
    inviteToTeamTreatment: InviteToTeamTreatments;
}

export default function InviteAs(props: Props) {
    let title = (
        <FormattedMessage
            id='invite_modal.as'
            defaultMessage='Invite as'
        />
    );
    let control = (
        <div>
            <RadioGroup
                onChange={(e) => props.setInviteAs(e.target.value as As)}
                value={props.as}
                id='invite-as'
                values={[
                    {
                        key: (
                            <FormattedMessage
                                id='invite_modal.choose_member'
                                defaultMessage='Member'
                            />
                        ),
                        value: As.MEMBER,
                    },
                    {
                        key: (
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
                        ),
                        value: As.GUEST,
                    },
                ]}
            />
        </div>
    );

    if (props.inviteToTeamTreatment === InviteToTeamTreatments.TOGGLE) {
        title = (
            <FormattedMessage
                id='invite_modal.as_guest'
                defaultMessage='Invite as Guest'
            />
        );
        control = (
            <div className='InviteAs__toggle'>
                <div className='InviteAs__toggleDescription'>
                    {props.as === As.GUEST &&
                    <>
                        <FormattedMarkdownMessage
                            id='invite_modal.permanent'
                            defaultMessage="**This can't be undone.**"
                        />
                        {' '}
                    </>
                    }
                    <FormattedMessage
                        id='invite_modal.guest_purpose'
                        defaultMessage='Guests are for temporary accounts that are limited to select channels or teams.'
                    />
                </div>
                <Toggle
                    toggled={props.as === As.GUEST}
                    onToggle={() => {
                        props.setInviteAs(props.as === As.GUEST ? As.MEMBER : As.GUEST);
                    }}
                />
            </div>
        );
    }

    return (
        <div className='InviteAs'>
            <div className={props.titleClass}>
                {title}
            </div>
            {control}
        </div>
    );
}
