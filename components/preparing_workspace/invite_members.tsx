// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage} from 'react-intl';

import {Animations, mapAnimationReasonToClass, TransitionProps} from './steps';

import PageLine from './page_line';
import Title from './title';
import Description from './description';

import './invite_members.scss';

type Props = TransitionProps & {
    disableEdits: boolean;
    showInviteSuccess: boolean;
    className?: string;
}

const InviteMembers = (props: Props) => {
    let className = 'InviteMembers-body';
    if (props.className) {
        className += ' ' + props.className;
    }
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('InviteMembers', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className={className}>
                <PageLine style={{height: '100px'}}/>
                {props.previous}
                <Title>
                    <FormattedMessage
                        id={'onboarding_wizard.invite_members.title'}
                        defaultMessage='Invite your team members'
                    />
                </Title>
                <Description>
                    <FormattedMessage
                        id={'onboarding_wizard.invite_members.description'}
                        defaultMessage='Collaboration is tough by yourself. Invite a few team members. Separate each email address with a space or comma.'
                    />
                </Description>
                <div>
                    <button
                        className='primary-button'
                        disabled={props.disableEdits}
                        onClick={props.next}
                    >
                        <FormattedMessage
                            id={'onboarding_wizard.invite_members.next'}
                            defaultMessage='Send invites'
                        />
                    </button>
                    <button
                        className='tertiary-button'
                        onClick={props.skip}
                    >
                        <FormattedMessage
                            id={'onboarding_wizard.invite_members.skip'}
                            defaultMessage="I'll do this later"
                        />
                    </button>
                </div>
                {/*TODO: <UsersEmailsInput> or something like it here*/}
                <PageLine style={{marginTop: '5px'}}/>
            </div>
        </CSSTransition>
    );
};

export default InviteMembers;
