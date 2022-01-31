// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState, useEffect, useCallback} from 'react';
import {usePopper} from 'react-popper';
import {CSSTransition} from 'react-transition-group';

import styled, {css} from 'styled-components';
import {Placement} from 'popper.js';
import Icon from '@mattermost/compass-components/foundations/icon/Icon';
import checklistImg from 'images/onboarding-checklist.svg';

export interface TaskProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

export interface TaskListProps {
    trigger: React.RefObject<HTMLElement>;
    isVisible: boolean;
    placement?: Placement;
    offset?: [number | null | undefined, number | null | undefined];
    children?: React.ReactNode;
}

const TaskListPopover = ({
    trigger,
    placement = 'top-start',
    offset = [0, 5],
    children,
}: TaskListProps): JSX.Element | null => {
    const [popperElement, setPopperElement] =
        React.useState<HTMLDivElement | null>(null);

    const {
        styles: {popper},
        attributes,
    } = usePopper(trigger.current, popperElement, {
        placement,
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset,
                },
            },
        ],
    });
    const style = {
        ...popper,
        zIndex: 100,
    };
    return (
        <div ref={setPopperElement} style={style} {...attributes.popper}>
            {children}
        </div>
    );
};

const Overlay = styled.div(() => {
    return css`
        background-color: rgba(0, 0, 0, 0);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        height: 100%;
        min-height: 100%;
        left: 0;
        right: 0;
        top: 0;
        position: fixed;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        pointer-events: auto;
        -ms-scroll-chaining: none;
        transition: 300ms;
        transition-property: background-color;
        transition-timing-function: ease-in-out;
        z-index: 20;
        &.fade-enter {
            background-color: rgba(0, 0, 0, 0);
        }
        &.fade-enter-active {
            background-color: rgba(0, 0, 0, 0.5);
        }
        &.fade-enter-done {
            background-color: rgba(0, 0, 0, 0.5);
        }
        &.fade-exit {
            background-color: rgba(0, 0, 0, 0.5);
        }
        &.fade-exit-active {
            background-color: rgba(0, 0, 0, 0);
        }
        &.fade-exit-done {
            background-color: rgba(0, 0, 0, 0);
        }
    `;
});

const TaskItems = styled.div`
    border-radius: 4px;
    background-color: rgba(var(--sidebar-text-rgb));
    max-width: 352px;
    padding: 1rem 0;
    transform: scale(0);
    opacity: 0;
    box-shadow: 0px 20px 32px rgba(0, 0, 0, 0.12);
    transition: opacity 300ms ease-in-out 0ms, transform 300ms ease-in-out 0ms;
    transform-origin: left bottom;
    max-height: ${document.documentElement.clientHeight}px;
    overflow-y: auto;

    &.open {
        transform: scale(1);
        opacity: 1;
    }
`;

const TaskRoot = styled.div`
    display: flex;
    background-color: rgb(255, 255, 255);
    cursor: pointer;
    width: 100%;
    padding: 12px 20px;
    font-size: 14px;
    align-items: center;
    color: var(--center-channel-color);
    &.completed {
        color: var(--denim-status-online: #3db887);
        text-decoration: line-through;
    }
    i {
        margin-right: 10px;
    }
    :hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }
    :active {
        background-color: rgba(var(--button-bg-rgb), 0.08);
    }
    :focus {
        box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.32),
            inset 0 0 0 2px blue;
    }
    transition: background 250ms ease-in-out, color 250ms ease-in-out,
        box-shadow 250ms ease-in-out;
`;

const Button = styled.button((open: boolean) => {
    return css`
        width: 36px;
        height: 36px;
        border-radius: 50%;
        top: 90%;
        left: 3%;
        position: fixed;
        z-index: 21;
        border-color: transparent;
        display: flex;
        align-items: center;

        i {
            color: var(--sidear);
        }
        &:before {
            content: ${open ? 'X' : ''};
        }

        &:after {
            content: ${open ? 'X' : ''};
        }
    `;
});

const Task = (props: TaskProps): JSX.Element => {
    const {label, onClick} = props;
    const [completed, setCompleted] = useState(false);

    return (
        <TaskRoot className={completed ? 'completed' : ''} onClick={onClick}>
            <Icon
                glyph={completed ? 'check' : 'play'}
                size={16}
                color={completed ? 'success' : 'primary'}
            />
            {label}
        </TaskRoot>
    );
};

const TaskList = (props: TaskListProps): JSX.Element => {
    const [open, setOpen] = useState(false);
    const {placement} = props;
    const trigger = useRef();
    const closeMenu = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Button onClick={() => setOpen(!open)} ref={trigger}>
                <Icon glyph={open ? 'close' : 'playlist-check'} />
            </Button>
            <CSSTransition
                timeout={300}
                classNames='fade'
                in={open}
                unmountOnExit={true}
            >
                <Overlay onClick={closeMenu} />
            </CSSTransition>
            <TaskListPopover
                isVisible={open}
                trigger={trigger}
                placement={placement}
            >
                <TaskItems className={open ? 'open' : ''}>
                    <h1 style={{fontSize: '20px', padding: '0 24px'}}>
                        {' '}
                        Welcome to Mattermost
                    </h1>
                    <p
                        style={{
                            fontSize: '12px',
                            color: 'rgba(var(--center-channel-color-rgb), 0.72)',
                            padding: '0 24px',
                        }}
                    >
                        Let's get up and running.
                    </p>
                    <img
                        src={checklistImg}
                        style={{display: 'block', margin: 'auto'}}
                    />
                    <Task label='Take a tour of channels' />
                    <Task label='Manage tasks with your first board' />
                    <Task label='Invite team members to the workspace' />
                    <Task label='Complete your profile' />
                    <Task label='Download the Desktop and Mobile Apps' />
                    <Task label='Visit the System Console to configure your worksace' />
                    <p
                        style={{
                            fontSize: '12px',
                            color: 'var(--button-bg)',
                            padding: '0 24px',
                        }}
                    >
                        No thanks, I’ll figure it out myself
                    </p>
                </TaskItems>
            </TaskListPopover>
        </>
    );
};

export default TaskList;
