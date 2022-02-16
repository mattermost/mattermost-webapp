// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {CSSTransition} from 'react-transition-group';
import styled from 'styled-components';

import {FormattedMessage} from 'react-intl';

import completedImg from 'images/completed.svg';

const CompletedWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100px 8px;
    margin: auto;
    text-align: center;
    word-break: break-word;
    width: 100%;
    height: 100%;

    &.fade-enter {
        transform: scale(0);
    }
    &.fade-enter-active {
        transform: scale(1);
    }
    &.fade-enter-done {
        transform: scale(1);
    }
    &.fade-exit {
        transform: scale(1);
    }
    &.fade-exit-active {
        transform: scale(1);
    }
    &.fade-exit-done {
        transform: scale(1);
    }
    button {
        padding: 10px 20px;
        background: var(--button-bg);
        border-radius: 4px;
        color: var(--sidebar-text);
        border: none;
        font-weight: bold;
    }

    h2 {
        font-size: 20px;
        padding: 0 24px;
        margin: 0 0 10px;
    }

    p {
        font-size: 14px;
        color: rgba(var(--center-channel-color-rgb), 0.72);
        padding: 4px 24px;
    }
`;

interface Props {
    dismissAction: () => void;
}

const Completed = (props: Props): JSX.Element => {
    const {dismissAction} = props;

    return (
        <>
            <CSSTransition
                in={true}
                timeout={150}
                classNames='fade'
            >
                <CompletedWrapper>
                    <img
                        src={completedImg}
                        alt={'completed tasks image'}
                    />
                    <h2>
                        <FormattedMessage
                            id={'onboardingTask.checklist.completed_title'}
                            defaultMessage='Well done. You’ve completed all of the tasks!'
                        />
                    </h2>
                    <p>
                        <FormattedMessage
                            id={'onboardingTask.checklist.completed_subtitle'}
                            defaultMessage='We hope Mattermost is more familiar now. Need more help? '
                        />
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href={'https://docs.mattermost.com/'}
                        >
                            <FormattedMessage
                                id='onboardingTask.checklist.documentation_link'
                                defaultMessage='See our documentation.'
                            />
                        </a>
                    </p>
                    <button onClick={dismissAction}>
                        <FormattedMessage
                            id={'collapsed_reply_threads_modal.confirm'}
                            defaultMessage='Got it'
                        />
                    </button>
                </CompletedWrapper>
            </CSSTransition>
        </>
    );
};

export default Completed;
