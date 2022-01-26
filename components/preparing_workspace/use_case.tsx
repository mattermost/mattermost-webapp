// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage} from 'react-intl';

import {t} from 'utils/i18n';
import MultiSelectCards from 'components/common/multi_select_cards';

import BoardsSVG from 'components/common/svg_images_components/boards.svg';
import PlaybooksSVG from 'components/common/svg_images_components/playbooks.svg';
import ChannelsSVG from 'components/common/svg_images_components/channels.svg';

import LaptopSVG from 'components/common/svg_images_components/laptop.svg';

import {Animations, mapAnimationReasonToClass, Form, TransitionProps} from './steps';

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
    className?: string;
}

const UseCase = (props: Props) => {
    let className = 'UseCase-body';
    if (props.className) {
        className += ' ' + props.className;
    }
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('UseCase', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className={className}>
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
                    <MultiSelectCards
                        next={props.next}
                        cards={[
                            {
                                onClick: () => props.setOption('channels'),
                                icon: <ChannelsSVG/>,
                                id: t('onboarding_wizard.use_case.channels'),
                                defaultMessage: 'Team communication and collaboration',
                                checked: props.options.channels,
                            },
                            {
                                onClick: () => props.setOption('boards'),
                                icon: <BoardsSVG/>,
                                id: t('onboarding_wizard.use_case.boards'),
                                defaultMessage: 'Project planning and management',
                                checked: props.options.boards,
                            },
                            {
                                onClick: () => props.setOption('playbooks'),
                                icon: <PlaybooksSVG/>,
                                id: t('onboarding_wizard.use_case.playbooks'),
                                defaultMessage: 'Processes, workflows, and automation',
                                checked: props.options.playbooks,
                            },
                        ]}
                    />
                    <div>
                        <button
                            className='primary-button'
                            onClick={props.next}
                        >
                            <FormattedMessage
                                id={'onboarding_wizard.next'}
                                defaultMessage='Continue'
                            />
                        </button>
                    </div>
                </div>
            </div>
        </CSSTransition>
    );
};

export default UseCase;
