// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';

import {usePopper} from 'react-popper';

import {CSSTransition} from 'react-transition-group';

import {ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';

import {Icon} from './formatting_icon';

import {useFormattingBarControls, useUpdateOnVisibilityChange} from './hooks';

const FormattingBarContainer = styled.div`
    display: flex;
    max-height: 0;
    transform-origin: top;
    overflow: hidden;
    transition: max-height 0.25s ease;
    background: rgba(61, 60, 64, 0.04);
    height: 48px;
    align-items: center;
    padding-left: 4px;

    &.isOpen {
        max-height: 100px;
        display: flex;
        align-items: center;
    }

    & .control {
        margin: 0 4px;

        &.heading,
        &.code,
        &.ol {
            margin-right: 5px;
            position: relative;
        }

        &.heading.wide,
        &.code.wide,
        &.ol.wide {
            &:after {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                margin: auto 0;
                right: -5px;
                width: 1px;
                height: 24px;
                background: rgba(61, 60, 64, 0.16);
            }
        }
    }
`;

const HiddenControlsContainer = styled.div`
    & > div {
        padding: 5px;
        box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        border: 1px solid rgba(61, 60, 64, 0.16);
        background: #fff;

        transition: transform 0.25s ease, opacity 0.25s ease;
        transform: scale(0);
        display: flex;

        &.scale-enter {
            transform: scale(0);
            opacity: 0;
        }

        &.scale-enter-active {
            transform: scale(1);
            opacity: 1;
        }

        &.scale-enter-done {
            transform: scale(1);
            opacity: 1;
        }

        &.scale-exit {
            transform: scale(1);
            opacity: 1;
        }

        &.scale-exit-active {
            transform: scale(0);
            opacity: 0;
        }

        &.scale-exit-done {
            transform: scale(0);
            opacity: 0;
        }
    }
`;

interface FormattingBarProps {
    isOpen: boolean;
    applyMarkdown: (options: ApplyMarkdownOptions) => void;
    textBox: HTMLInputElement;
    value: string;
}

export const FormattingBar = (props: FormattingBarProps): JSX.Element => {
    const {
        isOpen,
        applyMarkdown,
        textBox,
        value,
    } = props;
    const [isHiddenControlsVisible, setIsHiddenControlsVisible] =
        useState(false);
    const popperRef = React.useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const formattingBarRef = useRef<HTMLDivElement>(null);
    const {controls, hiddenControls, wideMode} =
        useFormattingBarControls(formattingBarRef);

    const hasHiddenControls = wideMode !== 'wide';

    useEffect(() => {
        if (!isOpen) {
            setIsHiddenControlsVisible(false);
        }
    }, [isOpen]);

    const {
        styles: {popper},
        attributes,
        update,
    } = usePopper(triggerRef.current, popperRef.current, {
        placement: 'top',
        modifiers: [
            {
                name: 'offset',
                options: {offset: [0, 4]},
            },
        ],
    });
    useUpdateOnVisibilityChange(update, isHiddenControlsVisible);

    return (
        <FormattingBarContainer
            className={classNames({
                isOpen,
            })}
            ref={formattingBarRef}
        >
            {controls.map(({markdownMode, icon}) => {
                return (
                    <div
                        key={markdownMode}
                        className={classNames('control', {
                            [markdownMode]: markdownMode,
                            [wideMode]: wideMode,
                        })}
                        onClick={() => {
                            const selectionStart = textBox.selectionStart;
                            const selectionEnd = textBox.selectionEnd;
                            if (
                                selectionStart === null ||
                                selectionEnd === null
                            ) {
                                return;
                            }

                            applyMarkdown({
                                markdownMode,
                                selectionStart,
                                selectionEnd,
                                value,
                            });
                        }}
                    >
                        {icon}
                    </div>
                );
            })}

            {hasHiddenControls && (
                <Icon
                    ref={triggerRef}
                    onClick={(event) => {
                        event.preventDefault();
                        setIsHiddenControlsVisible((isVisible) => !isVisible);
                    }}
                >
                    <i className='fa fa-ellipsis-h'/>
                </Icon>
            )}

            <HiddenControlsContainer
                ref={popperRef}
                style={popper}
                {...attributes.popper}
            >
                <CSSTransition
                    timeout={250}
                    classNames='scale'
                    unmountOnExit={true}
                    in={isHiddenControlsVisible}
                >
                    <div>
                        {hiddenControls.map(({markdownMode, icon}) => {
                            return (
                                <div
                                    key={markdownMode}
                                    className='control'
                                    onClick={() => {
                                        const selectionStart =
                                            textBox.selectionStart;
                                        const selectionEnd =
                                            textBox.selectionEnd;
                                        if (
                                            selectionStart === null ||
                                            selectionEnd === null
                                        ) {
                                            return;
                                        }
                                        applyMarkdown({
                                            markdownMode,
                                            selectionStart,
                                            selectionEnd,
                                            value,
                                        });
                                    }}
                                >
                                    {icon}
                                </div>
                            );
                        })}
                        {hasHiddenControls && <Question/>}
                    </div>
                </CSSTransition>
            </HiddenControlsContainer>

            {!hasHiddenControls && <Question/>}
        </FormattingBarContainer>
    );
};

const Question = () => {
    return (
        <div
            className='control'
            onClick={(event) => {
                event.preventDefault();
            }}
        >
            <Icon>
                <i className='icon icon-help-circle-outline'/>
            </Icon>
        </div>
    );
};
