// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage} from 'react-intl';

import QuickInput from 'components/quick_input';

import PageLine from './page_line';

import {Animations, mapAnimationReasonToClass, TransitionProps} from './steps';

import './channel.scss';

type Props = TransitionProps & {
    name: string;
    onChange: (newValue: string) => void;
}
const Channel = (props: Props) => {
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('Channel', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className='Channel-body'>
                <PageLine height={'100px'}/>
                {props.previous}
                <FormattedMessage
                    id={'onboarding_wizard.channel.title'}
                    defaultMessage="Let's create your first channel"
                />
                <FormattedMessage
                    id={'onboarding_wizard.channel.description'}
                    defaultMessage='Channels are where you can communicate with your team about a topic or project. What are you working on right now?'
                />
                <button
                    className='btn btn-primary'
                    onClick={props.next}
                >
                    <FormattedMessage
                        id={'onboarding_wizard.next'}
                        defaultMessage='Continue'
                    />
                </button>
                <button
                    className='tertiary-button'
                    onClick={props.skip}
                >
                    <FormattedMessage
                        id={'onboarding_wizard.skip'}
                        defaultMessage='Skip for now'
                    />
                </button>
                <QuickInput
                    value={props.name}
                    onChange={(e) => props.onChange(e.target.value)}
                    autoFocus={true}
                />
                <PageLine height={'calc(100vh - 100px - 400px'}/>
            </div>
        </CSSTransition>
    );
};

export default Channel;
