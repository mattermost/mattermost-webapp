// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage} from 'react-intl';

import {Animations, mapAnimationReasonToClass, Form, TransitionProps} from './steps';

import WizardRadioButton from './wizard_radio_button';

import BoardsSVG from './boards.svg';
import PlaybooksSVG from './playbooks.svg';
import ChannelsSVG from './channels.svg';

import LaptopSVG from './laptop.svg';

import PageLine from './page_line';
import Title from './title';
import Description from './description';

import './use_case.scss';

const UseCases = {
    Boards: 'Boards',
    Channels: 'Channels',
    Playbooks: 'Playbooks',
} as const;

type UseCase = typeof UseCases [keyof typeof UseCases];
type Props = TransitionProps & {
    options: Form['useCase'];
    setOption: (options: keyof Form['useCase']) => void;
}

const UseCase = (props: Props) => {
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('UseCase', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className='UseCase-body'>
                <div className='UseCase-left-col'>
                    <PageLine
                        height={'100px'}
                        noLeft={true}
                    />
                    <LaptopSVG/>
                    <PageLine
                        height={'calc(100vh - 250px)'}
                        noLeft={true}
                    />
                </div>
                <div className='UseCase-form-wrapper'>
                    {props.previous}
                    <Title>
                    <FormattedMessage
                        id={'onboarding_wizard.use_case.title'}
                        defaultMessage='How do you plan to use Mattermost?'
                    />
                    </Title>
                    <Description>
                    <FormattedMessage
                        id={'onboarding_wizard.use_case.description'}
                        defaultMessage="This will help us set up your workspace in a way that's most relevant to you. Select all that apply."
                    />
                    </Description>
                    <ul>
                        <WizardRadioButton
                            onClick={() => props.setOption('channels')}
                            icon={<ChannelsSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.use_case.channels'}
                                    defaultMessage='Team communication and collaboration'
                                />
                            }
                            checked={props.options.channels}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('boards')}
                            icon={<BoardsSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.use_case.boards'}
                                    defaultMessage='Project planning and management'
                                />
                            }
                            checked={props.options.boards}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('playbooks')}
                            icon={<PlaybooksSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.use_case.playbooks'}
                                    defaultMessage='Processes, workflows, and automation'
                                />
                            }
                            checked={props.options.playbooks}
                        />
                    </ul>
                    <button
                        className='btn btn-primary'
                        onClick={props.next}
                    >
                        <FormattedMessage
                            id={'onboarding_wizard.next'}
                            defaultMessage='Continue'
                        />
                    </button>
                </div>
            </div>
        </CSSTransition>
    );
};

export default UseCase;
