// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Editor} from '@tiptap/react';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useIntl} from 'react-intl';
import styled, {css} from 'styled-components';
import {useFloating, offset} from '@floating-ui/react-dom';
import {CSSTransition} from 'react-transition-group';
import {CheckIcon, ChevronDownIcon} from '@mattermost/compass-icons/components';

import ToolbarControl, {
    DropdownContainer,
    makeControlActiveAssertionMap,
    makeControlHandlerMap, MAP_HEADING_MODE_TO_ARIA_LABEL, MAP_HEADING_MODE_TO_LABEL, MarkdownHeadingMode,
    MarkdownHeadingModes,
} from './toolbar_controls';

import {useToolbarControls, useGetLatest} from './toolbar_hooks';

/** eslint-disable no-confusing-arrow */

const Separator = styled.div`
    display: block;
    position: relative;
    width: 1px;
    height: 24px;
    background: rgba(var(--center-channel-color-rgb), 0.32);
`;

const ToolbarContainer = styled.div`
    display: flex;
    position: relative;
    height: 48px;
    padding: 0 8px;
    justify-content: space-between;
    background: transparent;
    transform-origin: top;
    transition: max-height 0.25s ease;
`;

const ToolSection = styled.div`
    display: flex;
    align-items: center;
    flex: 0;
    gap: 4px;
`;

export const HeadingControlsContainer = styled.div`
    padding: 8px 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    background: var(--center-channel-bg);
    z-index: -1;

    transition: transform 250ms ease, opacity 250ms ease;
    transform: scale(0);
    opacity: 0;
    display: flex;
    flex-direction: column;

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

interface ToolbarProps {

    /**
     * the editor create from the tiptap package
     */
    editor: Editor;

    /**
     * location of the advanced text editor in the UI (center channel / RHS)
     */
    location: string;

    /**
     * controls that enhance the message,
     * e.g: message priority picker
     */
    additionalControls?: React.ReactNodeArray;

    /**
     * controls shown aligned to the very right of the toolbar
     * (perfect for adding in send buttons, etc.)
     */
    rightControls?: React.ReactNode | React.ReactNodeArray;
}

const Toolbar = (props: ToolbarProps): JSX.Element => {
    const {
        location,
        additionalControls,
        rightControls,
        editor,
    } = props;
    const formattingBarRef = useRef<HTMLDivElement>(null);
    const {controls, wideMode} = useToolbarControls(formattingBarRef);
    const [showHeadingControls, setShowHeadingControls] = useState(false);

    const {formatMessage} = useIntl();
    const HiddenControlsButtonAriaLabel = formatMessage({id: 'accessibility.button.hidden_controls_button', defaultMessage: 'show hidden formatting options'});

    const {x, y, reference, floating, strategy, update, refs: {reference: buttonRef, floating: floatingRef}} = useFloating<HTMLButtonElement>({
        placement: 'top-start',
        middleware: [offset({mainAxis: 4})],
    });

    // this little helper hook always returns the latest refs and does not mess with the floatingUI placement calculation
    const getLatest = useGetLatest({
        showHeadingControls,
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
                    setShowHeadingControls(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [getLatest]);

    useEffect(() => {
        update?.();
    }, [wideMode, update]);

    const toggleHeadingControls = useCallback((event?) => {
        event?.preventDefault();
        setShowHeadingControls(!showHeadingControls);
    }, [showHeadingControls]);

    const hiddenControlsContainerStyles: React.CSSProperties = {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
    };

    const controlHandlerMap = useMemo(() => makeControlHandlerMap(editor), [editor]);
    const controlActiveAssertionMap = useMemo(() => makeControlActiveAssertionMap(editor), [editor]);

    const getHeadingLabel = () => {
        switch (true) {
        case editor.isActive('heading', {level: 1}):
            return formatMessage(MAP_HEADING_MODE_TO_LABEL.h1);
        case editor.isActive('heading', {level: 2}):
            return formatMessage(MAP_HEADING_MODE_TO_LABEL.h2);
        case editor.isActive('heading', {level: 3}):
            return formatMessage(MAP_HEADING_MODE_TO_LABEL.h3);
        case editor.isActive('heading', {level: 4}):
            return formatMessage(MAP_HEADING_MODE_TO_LABEL.h4);
        case editor.isActive('heading', {level: 5}):
            return formatMessage(MAP_HEADING_MODE_TO_LABEL.h5);
        case editor.isActive('heading', {level: 6}):
            return formatMessage(MAP_HEADING_MODE_TO_LABEL.h6);
        case editor.isActive('paragraph'):
        default:
            return formatMessage(MAP_HEADING_MODE_TO_LABEL.p);
        }
    };

    const codeBlockModeIsActive = editor.isActive('codeBlock');

    return (
        <ToolbarContainer ref={formattingBarRef}>
            <ToolSection>
                <DropdownContainer
                    id={'HiddenControlsButton' + location}
                    ref={reference}
                    className={classNames({active: showHeadingControls})}
                    onClick={toggleHeadingControls}
                    aria-label={HiddenControlsButtonAriaLabel}
                    disabled={codeBlockModeIsActive}
                >
                    {getHeadingLabel()}
                    <ChevronDownIcon
                        color={'currentColor'}
                        size={18}
                    />
                </DropdownContainer>
                <CSSTransition
                    timeout={250}
                    classNames='scale'
                    in={showHeadingControls}
                >
                    <HeadingControlsContainer
                        ref={floating}
                        style={hiddenControlsContainerStyles}
                    >
                        {MarkdownHeadingModes.map((mode) => {
                            return (
                                <HeadingSelectOption
                                    key={mode}
                                    mode={mode}
                                    active={controlActiveAssertionMap[mode]()}
                                    onClick={controlHandlerMap[mode]}
                                    label={formatMessage(MAP_HEADING_MODE_TO_LABEL[mode])}
                                    aria-label={formatMessage(MAP_HEADING_MODE_TO_ARIA_LABEL[mode])}
                                />
                            );
                        })}
                    </HeadingControlsContainer>
                </CSSTransition>
                <Separator/>
                {controls.map((mode) => {
                    const insertSeparator = mode === 'strike' || mode === 'ol';
                    return (
                        <React.Fragment key={mode}>
                            <ToolbarControl
                                mode={mode}
                                onClick={controlHandlerMap[mode]}
                                className={classNames({active: controlActiveAssertionMap[mode]()})}
                                disabled={mode !== 'codeBlock' && codeBlockModeIsActive}
                            />
                            {insertSeparator && <Separator/>}
                        </React.Fragment>
                    );
                })}
                {additionalControls}
            </ToolSection>
            <ToolSection>
                {rightControls}
            </ToolSection>
        </ToolbarContainer>
    );
};

type HeadingSelectOptionProps = {
    mode: MarkdownHeadingMode;
    active: boolean;
    label: string;
    onClick: () => void;
}

const HeadingSelectOption = ({active, label, ...rest}: HeadingSelectOptionProps) => {
    return (
        <StyledHeadingSelectOption {...rest}>
            {label}
            {active && (
                <CheckIcon
                    size={24}
                    color={'rgba(var(--button-bg-rgb), 1)'}
                />
            )}
        </StyledHeadingSelectOption>
    );
};

const StyledHeadingSelectOption = styled.button(({mode}: {mode: HeadingSelectOptionProps['mode']}) => {
    const genericStyles = css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 20px;
        min-width: 230px;
        background: transparent;
        border: none;
        appearance: none;

        &:hover {
            background: rgba(var(--center-channel-color-rgb), 0.08);
        }
    `;

    switch (mode) {
    case 'h1':
        return css`
            ${genericStyles};
            font-family: 'Metropolis', sans-serif;
            font-style: normal;
            font-weight: 600;
            font-size: 28px;
            line-height: 36px;
        `;
    case 'h2':
        return css`
            ${genericStyles};
            font-family: 'Metropolis', sans-serif;
            font-style: normal;
            font-weight: 600;
            font-size: 25px;
            line-height: 30px;
        `;
    case 'h3':
        return css`
            ${genericStyles};
            font-family: 'Metropolis', sans-serif;
            font-style: normal;
            font-weight: 600;
            font-size: 22px;
            line-height: 28px;
        `;
    case 'h4':
        return css`
            ${genericStyles};
            font-family: 'Metropolis', sans-serif;
            font-style: normal;
            font-weight: 600;
            font-size: 20px;
            line-height: 28px;
        `;
    case 'h5':
        return css`
            ${genericStyles};
            font-family: 'Metropolis', sans-serif;
            font-style: normal;
            font-weight: 600;
            font-size: 18px;
            line-height: 24px;
        `;
    case 'h6':
        return css`
            ${genericStyles};
            font-family: 'Metropolis', sans-serif;
            font-style: normal;
            font-weight: 600;
            font-size: 16px;
            line-height: 24px;
        `;
    case 'p':
    default:
        return css`
            ${genericStyles};
            font-family: 'Open Sans', sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        `;
    }
});

export default Toolbar;
