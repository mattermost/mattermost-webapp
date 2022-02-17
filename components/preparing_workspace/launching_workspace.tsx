// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage} from 'react-intl';

import LogoSvg from 'components/common/svg_images_components/logo_dark_blue_svg';

import loadingIcon from 'images/spinner-48x48-blue.apng';

import Title from './title';
import Description from './description';

import {Animations, mapAnimationReasonToClass, PreparingWorkspacePageProps} from './steps';

import './launching_workspace.scss';

type Props = PreparingWorkspacePageProps & {
    fullscreen?: boolean;
    zIndex?: number;
};

// Want to make sure background channels has rendered to limit animation jank,
// including things like tour tips auto-showing
export const START_TRANSITIONING_OUT = 500;

// needs to be on top. Current known highest is tour tip at 1000
export const LAUNCHING_WORKSPACE_FULLSCREEN_Z_INDEX = 1001;

function LaunchingWorkspace(props: Props) {
    const [hasEntered, setHasEntered] = useState(false);
    useEffect(props.onPageView, []);

    useEffect(() => {
        if (hasEntered) {
            return;
        }
        if (!props.fullscreen) {
            return;
        }
        (window as any).setHasEntered = setHasEntered;
        setTimeout(() => {
            setHasEntered(true);
        }, START_TRANSITIONING_OUT);
    }, [hasEntered, props.fullscreen]);

    let bodyClass = 'LaunchingWorkspace-body';
    if (!props.fullscreen) {
        bodyClass += ' LaunchingWorkspace-body--non-fullscreen';
    }
    const body = (
        <div className={bodyClass}>
            <div className='LaunchingWorkspace__spinner'>
                <img
                    src={loadingIcon}
                />
            </div>
            <Title>
                <FormattedMessage
                    id='onboarding_wizard.launching_workspace.title'
                    defaultMessage='Launching your workspace now'
                />
            </Title>
            <Description>
                <FormattedMessage
                    id='onboarding_wizard.launching_workspace.description'
                    defaultMessage='It’ll be ready in a moment'
                />
            </Description>
        </div>
    );

    let content = null;
    if (props.fullscreen) {
        content = (
            <CSSTransition
                in={props.show && !hasEntered}
                timeout={500}
                classNames={'LaunchingWorkspaceFullscreenWrapper'}
                exit={true}
                enter={false}
                mountOnEnter={true}
                unmountOnExit={true}
            >
                <div
                    className='LaunchingWorkspaceFullscreenWrapper-body'
                    style={{
                        zIndex: props.zIndex,
                    }}
                >
                    <div className='LaunchingWorkspaceFullscreenWrapper__logo'>
                        <LogoSvg/>
                    </div>
                    {body}
                </div>
            </CSSTransition>

        );
    } else {
        content = (
            <CSSTransition
                in={props.show}
                timeout={Animations.PAGE_SLIDE}
                classNames={mapAnimationReasonToClass('LaunchingWorkspace', props.transitionDirection)}
                mountOnEnter={true}
                unmountOnExit={true}
            >
                {body}
            </CSSTransition>
        );
    }
    return content;
}

export default LaunchingWorkspace;
