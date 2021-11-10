// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import Radio from '@mattermost/compass-components/components/radio';

import {InviteToTeamTreatments} from 'mattermost-redux/constants/config';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

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
    const checkedClass = ' InviteAs__radio--checked';
    let title = (
        <FormattedMessage
            id='invite_modal.as'
            defaultMessage='Invite as'
        />
    );
    let control = (
        <div>
            <Radio
                checked={props.as === As.MEMBER}
                onClick={() => {
                    props.setInviteAs(As.MEMBER);
                }}
                className={'InviteAs__radio' + (props.as === As.MEMBER ? checkedClass : '')}
                label={
                    <span className='InviteAs__label'>
                        <FormattedMessage
                            id='invite_modal.choose_member'
                            defaultMessage='Member'
                        />
                    </span>
                }
            />
            <Radio
                checked={props.as === As.GUEST}
                onClick={() => {
                    props.setInviteAs(As.GUEST);
                }}
                className={'InviteAs__radio' + (props.as === As.GUEST ? checkedClass : '')}
                label={
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
                }
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
