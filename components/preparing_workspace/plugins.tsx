// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {CSSTransition} from 'react-transition-group';

import {t} from 'utils/i18n';
import MultiSelectCards from 'components/common/multi_select_cards';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import GithubSVG from 'components/common/svg_images_components/github_svg';
import GitlabSVG from 'components/common/svg_images_components/gitlab_svg';
import JiraSVG from 'components/common/svg_images_components/jira_svg';
import ZoomSVG from 'components/common/svg_images_components/zoom_svg';
import TodoSVG from 'components/common/svg_images_components/todo_svg';

import {Animations, mapAnimationReasonToClass, Form, TransitionProps} from './steps';

import PageLine from './page_line';

import './plugins.scss';

type Props = TransitionProps & {
    options: Form['plugins'];
    setOption: (option: keyof Form['plugins']) => void;
    className?: string;
}
const Plugins = (props: Props) => {
    const {formatMessage} = useIntl();
    let className = 'Plugins-body';

    if (props.className) {
        className += ' ' + props.className;
    }
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('Plugins', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className={className}>
                <PageLine style={{height: '100px'}}/>
                {props.previous}
                {
                    <MultiSelectCards
                        next={props.next}
                        cards={[
                            {
                                onClick: () => props.setOption('github'),
                                icon: <GithubSVG/>,
                                id: t('onboarding_wizard.plugins.github'),
                                defaultMessage: 'Github',
                                checked: props.options.github,
                                tooltip: formatMessage({
                                    id: 'onboarding_wizard.plugins.github.tooltip',
                                    defaultMessage: 'Subscribe to repositories, stay up to date with reviews, assignments',
                                }),
                            },
                            {
                                onClick: () => props.setOption('gitlab'),
                                icon: <GitlabSVG/>,
                                id: t('onboarding_wizard.plugins.gitlab'),
                                defaultMessage: 'Gitlab',
                                checked: props.options.gitlab,
                                tooltip: formatMessage({
                                    id: 'onboarding_wizard.plugins.gitlab.tooltip',
                                    defaultMessage: 'Gitlab tooltip',
                                }),
                            },
                            {
                                onClick: () => props.setOption('jira'),
                                icon: <JiraSVG/>,
                                id: t('onboarding_wizard.plugins.jira'),
                                defaultMessage: 'Jira',
                                checked: props.options.jira,
                                tooltip: formatMessage({
                                    id: 'onboarding_wizard.plugins.jira.tooltip',
                                    defaultMessage: 'Jira tooltip',
                                }),
                            },
                            {
                                onClick: () => props.setOption('zoom'),
                                icon: <ZoomSVG/>,
                                id: t('onboarding_wizard.plugins.zoom'),
                                defaultMessage: 'Zoom',
                                checked: props.options.zoom,
                                tooltip: formatMessage({
                                    id: 'onboarding_wizard.plugins.zoom.tooltip',
                                    defaultMessage: 'Zoom tooltip',
                                }),
                            },
                            {
                                onClick: () => props.setOption('todo'),
                                icon: <TodoSVG/>,
                                id: t('onboarding_wizard.plugins.todo'),
                                defaultMessage: 'To do',
                                checked: props.options.todo,
                                tooltip: formatMessage({
                                    id: 'onboarding_wizard.plugins.todo.tooltip',
                                    defaultMessage: 'To do tooltip',
                                }),
                            },
                        ]}
                    />
                }
                <div className='Plugins__marketplace'>
                    <FormattedMarkdownMessage
                        id='onboarding_wizard.plugins.marketplace'
                        defaultMessage='More tools can be added once your workspace is set up. To see all available integrations, **[visit the marketplace](https://mattermost.com/marketplace/)**'
                    />
                </div>
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
                    <button
                        className='tertiary-button'
                        onClick={props.skip}
                    >
                        <FormattedMessage
                            id={'onboarding_wizard.skip'}
                            defaultMessage='Skip for now'
                        />
                    </button>
                </div>
                <PageLine/>
            </div>
        </CSSTransition>
    );
};

export default Plugins;
