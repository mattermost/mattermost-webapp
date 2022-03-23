// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {CSSTransition} from 'react-transition-group';

interface LineLimiterProps {
    children: React.ReactNode;
    maxLines: number;
    lineHeight: number;
    moreText: string;
    lessText: string;
    className?: string;
}

const LineLimiterBase = ({children, maxLines, lineHeight, moreText, lessText, className}: LineLimiterProps) => {
    const maxLineHeight = maxLines * lineHeight;

    const [needLimiter, setNeedLimiter] = useState(false);
    const [open, setOpen] = useState(false);
    const [maxHeight, setMaxHeight] = useState('inherit');
    const [moreBottomPosition, setMoreBottomPosition] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref === null || ref.current === null) {
            return;
        }

        const contentHeight = ref.current.scrollHeight;
        if (contentHeight > maxLineHeight) {
            setNeedLimiter(true);

            if (open) {
                setMaxHeight(`${contentHeight + lineHeight}px`);
            } else {
                setMaxHeight(`${maxLineHeight}px`);
            }

            // This section calculate in the position of the "more"
            // button considering the size of the elements.
            let totalHeight = 0;
            for (let i = 0; i < ref.current.children.length; i++) {
                const child = ref.current.children[i] as HTMLElement;
                if (child.scrollHeight + ((i + 1) * lineHeight) >= maxLineHeight) {
                    setMoreBottomPosition(Math.max(0, maxLineHeight - (totalHeight + child.scrollHeight)));
                    break;
                }
                totalHeight += child.scrollHeight;
            }
        } else {
            setNeedLimiter(false);
            setMaxHeight('inherit');
            setMoreBottomPosition(0);
        }
    }, [children, open]);

    let displayClass = className;
    if (needLimiter && !open) {
        displayClass += ' LineLimiter--close';
    }

    return (
        <CSSTransition
            in={open}
            timeout={500}
            classNames='LineLimiter--Transition-'
        >
            <div
                className={displayClass}
                css={{maxHeight}}
            >
                <div>
                    <div ref={ref}>{children}</div>
                    {needLimiter && open && (
                        <button
                            className='LineLimiter__toggler'
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            {lessText}
                        </button>
                    )}
                </div>
                {needLimiter && (
                    <div
                        className='LineLimiter__toggler LineLimiter__toggler--more'
                        css={{bottom: moreBottomPosition + 'px'}}
                    >
                        {/*
                            This div is necessary to add the fading effect
                            before the more text, prevent us from cutting the
                            text in the middle of a letter
                        */}
                        <div/>
                        {!open && (
                            <button
                                onClick={() => {
                                    setOpen(true);
                                }}
                            >
                                {moreText}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </CSSTransition>
    );
};

const LineLimiter = styled(LineLimiterBase)<LineLimiterProps>`
    transition: max-height 0.5s ease-in;
    line-height: ${(props) => props.lineHeight}px;
    overflow: hidden;

    p {
        margin-bottom: ${(props) => props.lineHeight}px;
    }

    & > * {
       overflow: hidden;
    }

    &.LineLimiter--Transition--enter-active, &.LineLimiter--Transition--exit-active {
        .LineLimiter__toggler {
            opacity: 0;
        }
    }
    &.LineLimiter--Transition--enter-done, &.LineLimiter--Transition--exit-done {
        .LineLimiter__toggler {
            opacity: 1;
            transition: opacity 150ms;
        }
    }

    button {
        border: 0px;
        background-color: var(--center-channel-bg);
        color: var(--button-bg);
        padding: 0;
        margin: 0;
    }

    .LineLimiter__toggler--more > div {
        display: none;
    }

    &.LineLimiter--close {
        position: relative;
        transition: max-height 0.5s ease-out;

        .LineLimiter__toggler--more {
            display: flex;
            position: absolute;
            right: 0;
            & div {
                display: block;
                width: 30px;
                background: linear-gradient(to right, transparent, var(--center-channel-bg));
            }
        }
    }
`;

export default LineLimiter;
