// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {CSSTransition} from 'react-transition-group';

import {Animations, mapAnimationReasonToClass, Form, TransitionProps} from './steps';

import WizardRadioButton from './wizard_radio_button';

import GithubSVG from './github.svg';
import GitlabSVG from './gitlab.svg';
import JiraSVG from './jira.svg';
import ZoomSVG from './zoom.svg';
import TodoSVG from './todo.svg';

import PageLine from './page_line';

import './plugins.scss';

type Props = TransitionProps & {
    options: Form['plugins'];
    setOption: (option: keyof Form['plugins']) => void;
}
const Plugins = (props: Props) => {
    const {formatMessage} = useIntl();
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('Plugins', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className='Plugins-body'>
                <PageLine height={'100px'}/>
                {props.previous}
                {
                    <ul>
                        <WizardRadioButton
                            onClick={() => props.setOption('github')}
                            icon={<GithubSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.plugins.github'}
                                    defaultMessage='Github'
                                />
                            }
                            checked={props.options.github}
                            tooltip={formatMessage({
                                id: 'onboarding_wizard.plugins.github.tooltip',
                                defaultMessage: 'Subscribe to repositories, stay up to date with reviews, assignments',
                            })}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('gitlab')}
                            icon={<GitlabSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.plugins.gitlab'}
                                    defaultMessage='Gitlab'
                                />
                            }
                            checked={props.options.gitlab}
                            tooltip={formatMessage({
                                id: 'onboarding_wizard.plugins.gitlab.tooltip',
                                defaultMessage: 'Gitlab tooltip',
                            })}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('jira')}
                            icon={<JiraSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.plugins.jira'}
                                    defaultMessage='Jira'
                                />
                            }
                            checked={props.options.jira}
                            tooltip={formatMessage({
                                id: 'onboarding_wizard.plugins.jira.tooltip',
                                defaultMessage: 'Jira tooltip',
                            })}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('zoom')}
                            icon={<ZoomSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.plugins.zoom'}
                                    defaultMessage='Zoom'
                                />
                            }
                            checked={props.options.zoom}
                            tooltip={formatMessage({
                                id: 'onboarding_wizard.plugins.zoom.tooltip',
                                defaultMessage: 'Zoom tooltip',
                            })}
                        />
                        <WizardRadioButton
                            onClick={() => props.setOption('todo')}
                            icon={<TodoSVG/>}
                            msg={
                                <FormattedMessage
                                    id={'onboarding_wizard.plugins.todo'}
                                    defaultMessage='To do'
                                />
                            }
                            checked={props.options.todo}
                            tooltip={formatMessage({
                                id: 'onboarding_wizard.plugins.todo.tooltip',
                                defaultMessage: 'To do tooltip',
                            })}
                        />
                    </ul>
                }
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
                <PageLine height={'calc(100vh - 100px - 400px'}/>
            </div>
        </CSSTransition>
    );
};

export default Plugins;
