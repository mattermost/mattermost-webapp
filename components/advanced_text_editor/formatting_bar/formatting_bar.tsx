// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';
import {usePopper} from 'react-popper';
import {CSSTransition} from 'react-transition-group';
import {DotsHorizontalIcon} from '@mattermost/compass-icons/components';

import {ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';
import ToggleFormattingBar from '../toggle_formatting_bar/toggle_formatting_bar';

import FormattingIcon, {IconContainer} from './formatting_icon';

import {useFormattingBarControls, useGetLatest, useUpdateOnVisibilityChange} from './hooks';

/** eslint-disable no-confusing-arrow */

type SeparatorProps = {
    show: boolean;
}

const Separator = styled.div<SeparatorProps>`
    display: ${({show}) => (show ? 'block' : 'none')};
    position: relative;
    width: 1px;
    height: 24px;
    background: rgba(var(--center-channel-color-rgb), 0.32);
`;

type FormattingBarContainerProps = {
    open: boolean;
}

const FormattingBarContainer = styled.div<FormattingBarContainerProps>`
    display: flex;
    height: 48px;
    max-height: ${(props) => (props.open ? '100px' : 0)};
    padding-left: 7px;
    overflow: hidden;
    background: rgba(var(--center-channel-color-rgb), 0.04);
    align-items: center;
    gap: 4px;
    transform-origin: top;
    transition: max-height 0.25s ease;

    &.wide ${Separator} {
        display: block;
    }
`;

const HiddenControlsContainer = styled.div`
    & > div {
        padding: 5px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
        background: var(--center-channel-bg);
        z-index: 2;

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

    /**
     * prop that determines if the FormattingBar is visible
     */
    isOpen: boolean;

    /**
     * prop that determines if the Formatting Controls are visible
     */
    showFormattingControls: boolean;

    /**
     * the current inputValue
     * This is needed to apply the markdown to the correct place
     */
    getCurrentMessage: () => string;

    /**
     * The textbox element tied to the advanced texteditor
     * NOTE: Since the only thing we need from that is the current selection
     *       range we should probably refactor this and only pass down the
     *       selectionStart and selectionEnd values
     */
    getCurrentSelection: () => {start: number; end: number};

    /**
     * the handler function that applies the markdown to the value
     */
    applyMarkdown: (options: ApplyMarkdownOptions) => void;

    /**
     * disable formatting controls when the texteditor is in preview state
     */
    disableControls: boolean;
    extraControls: JSX.Element;
    toggleAdvanceTextEditor: () => void;
}

const FormattingBar = (props: FormattingBarProps): JSX.Element => {
    const {
        isOpen,
        showFormattingControls,
        applyMarkdown,
        getCurrentSelection,
        getCurrentMessage,
        disableControls,
        extraControls,
        toggleAdvanceTextEditor,
    } = props;
    const [showHiddenControls, setShowHiddenControls] = useState(false);
    const popperRef = React.useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const formattingBarRef = useRef<HTMLDivElement>(null);
    const {controls, hiddenControls, wideMode} = useFormattingBarControls(formattingBarRef);

    const {formatMessage} = useIntl();
    const HiddenControlsButtonAriaLabel = formatMessage({id: 'accessibility.button.hidden_controls_button', defaultMessage: 'show hidden formatting options'});

    // this little helper hook always returns the latest refs and does not mess with the popper placement calculation
    const getLatest = useGetLatest({
        showHiddenControls,
        triggerRef,
        popperRef,
    });

    useEffect(() => {
        const handleClickOutside: EventListener = (event) => {
            const {popperRef, triggerRef} = getLatest();
            const target = event.composedPath?.()?.[0] || event.target;
            if (target instanceof Node) {
                if (
                    popperRef != null &&
                    triggerRef != null &&
                    !popperRef.current?.contains(target) &&
                    !triggerRef.current?.contains(target)
                ) {
                    setShowHiddenControls(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [getLatest, setShowHiddenControls]);

    useEffect(() => {
        if (!isOpen) {
            setShowHiddenControls(false);
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

    useUpdateOnVisibilityChange(update, showHiddenControls);

    const hasHiddenControls = wideMode !== 'wide';

    const closeHiddenControls = useCallback((event?) => {
        if (event) {
            event.preventDefault();
        }
        setShowHiddenControls(!showHiddenControls);
    }, [showHiddenControls]);

    /**
     * wrapping this factory in useCallback prevents it from constantly getting a new
     * function signature as if we would define it directly in the props of
     * the FormattingIcon component. This should improve render-performance
     */
    const makeFormattingHandler = useCallback((mode) => () => {
        // if the formatting is disabled just return without doing anything
        if (disableControls) {
            return;
        }

        // get the current selection values and return early (doing nothing) when we don't get valid values
        const {start, end} = getCurrentSelection();

        if (start === null || end === null) {
            return;
        }

        const value = getCurrentMessage();

        applyMarkdown({
            markdownMode: mode,
            selectionStart: start,
            selectionEnd: end,
            message: value,
        });

        // if hidden controls are currently open close them
        if (showHiddenControls) {
            closeHiddenControls();
        }
    }, [getCurrentSelection, getCurrentMessage, applyMarkdown, showHiddenControls, closeHiddenControls, disableControls]);

    return (
        <FormattingBarContainer
            open={isOpen}
            ref={formattingBarRef}
        >
            <ToggleFormattingBar
                onClick={toggleAdvanceTextEditor}
                active={showFormattingControls}
                disabled={false}
            />
            <Separator show={true}/>
            {showFormattingControls && controls.map((mode) => {
                const insertSeparator = mode === 'heading' || mode === 'ol';
                return (
                    <React.Fragment key={mode}>
                        <FormattingIcon
                            mode={mode}
                            className='control'
                            onClick={makeFormattingHandler(mode)}
                            disabled={disableControls}
                        />
                        {insertSeparator && <Separator show={wideMode === 'wide'}/>}
                    </React.Fragment>
                );
            })}

            {hasHiddenControls && showFormattingControls && (
                <>
                    <IconContainer
                        id={'HiddenControlsButton'}
                        ref={triggerRef}
                        className={classNames({active: showHiddenControls})}
                        onClick={closeHiddenControls}
                        aria-label={HiddenControlsButtonAriaLabel}
                    >
                        <DotsHorizontalIcon
                            color={'currentColor'}
                            size={18}
                        />
                    </IconContainer>
                    <Separator show={true}/>
                </>
            )}
            <HiddenControlsContainer
                ref={popperRef}
                style={{...popper, zIndex: 2}}
                {...attributes.popper}
            >
                <CSSTransition
                    timeout={250}
                    classNames='scale'
                    unmountOnExit={true}
                    in={showHiddenControls}
                >
                    <div>
                        {hiddenControls.map((mode) => {
                            return (
                                <FormattingIcon
                                    key={mode}
                                    mode={mode}
                                    className='control'
                                    onClick={makeFormattingHandler(mode)}
                                    disabled={disableControls}
                                />
                            );
                        })}
                    </div>
                </CSSTransition>
            </HiddenControlsContainer>
            {extraControls}
        </FormattingBarContainer>
    );
};

export default memo(FormattingBar);
