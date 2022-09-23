// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Editor} from '@tiptap/react';
import classNames from 'classnames';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';
import {useFloating, offset} from '@floating-ui/react-dom';
import {CSSTransition} from 'react-transition-group';
import {DotsHorizontalIcon} from '@mattermost/compass-icons/components';

import ToolbarControl, {IconContainer, makeControlActiveAssertionMap, makeControlHandlerMap} from './toolbar_controls';

import {useFormattingBarControls, useGetLatest} from './toolbar_hooks';

/** eslint-disable no-confusing-arrow */

const Separator = styled.div`
    display: block;
    position: relative;
    width: 1px;
    height: 24px;
    background: rgba(var(--center-channel-color-rgb), 0.32);
`;

const FormattingBarContainer = styled.div`
    display: flex;
    height: 48px;
    padding-left: 7px;
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
    padding: 5px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    background: var(--center-channel-bg);
    z-index: -1;

    transition: transform 250ms ease, opacity 250ms ease;
    transform: scale(0);
    opacity: 0;
    display: flex;

    &.scale-enter {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-enter-active {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-enter-done {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit-active {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-exit-done {
        transform: scale(0);
        opacity: 0;
        z-index: -1;
    }
`;

interface FormattingBarProps {

    /**
     * controls that extend the functionality
     */
    extraControls: JSX.Element;

    /**
     * location of the advanced text editor in the UI (center channel / RHS)
     */
    location: string;

    /**
     * controls that enhance the message,
     * e.g: message priority picker
     */
    additionalControls?: React.ReactNodeArray;
    editor: Editor;
}

const FormattingBar = (props: FormattingBarProps): JSX.Element => {
    const {
        extraControls,
        location,
        additionalControls,
        editor,
    } = props;
    const [showHiddenControls, setShowHiddenControls] = useState(false);
    const formattingBarRef = useRef<HTMLDivElement>(null);
    const {controls, hiddenControls, wideMode} = useFormattingBarControls(formattingBarRef);

    const {formatMessage} = useIntl();
    const HiddenControlsButtonAriaLabel = formatMessage({id: 'accessibility.button.hidden_controls_button', defaultMessage: 'show hidden formatting options'});

    const {x, y, reference, floating, strategy, update, refs: {reference: buttonRef, floating: floatingRef}} = useFloating<HTMLButtonElement>({
        placement: 'top',
        middleware: [offset({mainAxis: 4})],
    });

    // this little helper hook always returns the latest refs and does not mess with the popper placement calculation
    const getLatest = useGetLatest({
        showHiddenControls,
        buttonRef,
        floatingRef,
    });

    useEffect(() => {
        const handleClickOutside: EventListener = (event) => {
            const {floatingRef, buttonRef} = getLatest();
            const target = event.composedPath?.()?.[0] || event.target;
            if (target instanceof Node) {
                if (
                    floatingRef !== null &&
                    buttonRef !== null &&
                    !floatingRef.current?.contains(target) &&
                    !buttonRef.current?.contains(target)
                ) {
                    setShowHiddenControls(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [getLatest, setShowHiddenControls]);

    useEffect(() => {
        update?.();
    }, [wideMode, update, showHiddenControls]);

    const hasHiddenControls = wideMode !== 'wide';

    const toggleHiddenControls = useCallback((event?) => {
        if (event) {
            event.preventDefault();
        }
        setShowHiddenControls(!showHiddenControls);
    }, [showHiddenControls]);

    const hiddenControlsContainerStyles: React.CSSProperties = {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
    };

    const controlHandlerMap = makeControlHandlerMap(editor);
    const controlActiveAssertionMap = makeControlActiveAssertionMap(editor);

    return (
        <FormattingBarContainer ref={formattingBarRef}>
            {additionalControls}
            <Separator/>
            {controls.map((mode) => {
                const insertSeparator = mode === 'h6' || mode === 'ol';
                return (
                    <React.Fragment key={mode}>
                        <ToolbarControl
                            mode={mode}
                            onClick={controlHandlerMap[mode]}
                            className={classNames({active: controlActiveAssertionMap[mode]()})}
                        />
                        {insertSeparator && <Separator/>}
                    </React.Fragment>
                );
            })}

            {hasHiddenControls && (
                <>
                    <IconContainer
                        id={'HiddenControlsButton' + location}
                        ref={reference}
                        className={classNames({active: showHiddenControls})}
                        onClick={toggleHiddenControls}
                        aria-label={HiddenControlsButtonAriaLabel}
                    >
                        <DotsHorizontalIcon
                            color={'currentColor'}
                            size={18}
                        />
                    </IconContainer>
                    <Separator/>
                </>
            )}
            <CSSTransition
                timeout={250}
                classNames='scale'
                in={showHiddenControls}
            >
                <HiddenControlsContainer
                    ref={floating}
                    style={hiddenControlsContainerStyles}
                >
                    {hiddenControls.map((mode) => {
                        return (
                            <ToolbarControl
                                key={mode}
                                mode={mode}
                                onClick={controlHandlerMap[mode]}
                                className={classNames({active: controlActiveAssertionMap[mode]()})}
                            />
                        );
                    })}
                </HiddenControlsContainer>
            </CSSTransition>
            {extraControls}
        </FormattingBarContainer>
    );
};

export default memo(FormattingBar);
