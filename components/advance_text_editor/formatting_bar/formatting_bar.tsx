// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {DotsHorizontalIcon, HelpCircleOutlineIcon} from '@mattermost/compass-icons/components';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {usePopper} from 'react-popper';

import {CSSTransition} from 'react-transition-group';

import {ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';
import Constants from 'utils/constants';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {getCurrentLocale} from '../../../selectors/i18n';

import FormattingIcon, {IconContainer} from './formatting_icon';

import {useFormattingBarControls, useUpdateOnVisibilityChange} from './hooks';

/** eslint-disable no-confusing-arrow */

type SeparatorProps = {
    show: boolean;
}

const Separator = styled.div<SeparatorProps>`
    display: ${({show}) => (show ? 'block' : 'none')};
    position: relative;
    width: 1px;
    height: 24px;
    background: rgba(61, 60, 64, 0.16);
`;

type FormattingBarContainerProps = {
    open: boolean;
}
const FormattingBarContainer = styled.div<FormattingBarContainerProps>`
    display: flex;
    max-height: ${(props) => (props.open ? '100px' : 0)};
    transform-origin: top;
    overflow: hidden;
    transition: max-height 0.25s ease;
    background: rgba(61, 60, 64, 0.04);
    height: 48px;
    align-items: center;
    padding-left: 4px;
    gap: 4px;

    &.wide ${Separator} {
        display: block;
    }
`;

const HiddenControlsContainer = styled.div`
    & > div {
        padding: 5px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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

/**
 * The component that renders the questionmark button that directs the user to the message formatting help page
 */
const Question = () => {
    const currentLocale = useSelector(getCurrentLocale);

    // open the message formatting explanation page
    const onClick = () => {
        window.open(`/help/messaging?locale=${currentLocale}`, '_blank', 'noopener,noreferrer');
    };

    const tooltip = (
        <Tooltip id='upload-tooltip'>
            <FormattedMessage
                id='textbox.help'
                defaultMessage='Help'
            />
        </Tooltip>
    );

    return (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='top'
            trigger={['hover', 'focus']}
            overlay={tooltip}
        >
            <IconContainer
                onClick={onClick}
                className={'style--none'}
            >
                <HelpCircleOutlineIcon
                    color={'currentColor'}
                    size={18}
                />
            </IconContainer>
        </OverlayTrigger>
    );
};

interface FormattingBarProps {

    /**
     * prop that determines if the FormattingBar is visible
     */
    isOpen: boolean;

    /**
     * the current inputValue
     * This is needed to apply the markdown to the correct place
     */
    value: string;

    /**
     * The textbox element tied to the advanced texteditor
     * NOTE: Since the only thing we need from that is the current selection
     *       range we should probably refactor this and only pass down the
     *       selectionStart and selectionEnd values
     */
    textBox: HTMLInputElement;

    /**
     * the handler function that applies the markdown to the value
     */
    applyMarkdown: (options: ApplyMarkdownOptions) => void;
}

export const FormattingBar = (props: FormattingBarProps): JSX.Element => {
    const {
        isOpen,
        applyMarkdown,
        textBox,
        value,
    } = props;
    const [showHiddenControls, setShowHiddenControls] = useState(false);
    const popperRef = React.useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const formattingBarRef = useRef<HTMLDivElement>(null);
    const {controls, hiddenControls, wideMode} =
        useFormattingBarControls(formattingBarRef);

    const hasHiddenControls = wideMode !== 'wide';

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

    /**
     * wrapping this factory in useCallback prevents it from constantly getting a new
     * function signature as if we would define it directly in the props of
     * the FormattingIcon component. This should improve render-performance
     */
    const makeFormattingHandler = useCallback((mode) => () => {
        const selectionStart = textBox.selectionStart;
        const selectionEnd = textBox.selectionEnd;
        if (
            selectionStart === null ||
            selectionEnd === null
        ) {
            return;
        }

        applyMarkdown({
            markdownMode: mode,
            selectionStart,
            selectionEnd,
            value,
        });
    }, [textBox, value, applyMarkdown]);

    return (
        <FormattingBarContainer
            open={isOpen}
            ref={formattingBarRef}
        >
            {controls.map((mode) => {
                const insertSeparator = mode === 'heading' || mode === 'code' || mode === 'ol';
                return (
                    <React.Fragment
                        key={mode}
                    >
                        <FormattingIcon
                            mode={mode}
                            className={classNames('control', {
                                [mode]: mode,
                            })}
                            onClick={makeFormattingHandler(mode)}
                        />
                        {insertSeparator && <Separator show={wideMode === 'wide'}/>}
                    </React.Fragment>
                );
            })}

            {hasHiddenControls && (
                <IconContainer
                    ref={triggerRef}
                    onClick={(event) => {
                        event.preventDefault();
                        setShowHiddenControls((isVisible) => !isVisible);
                    }}
                >
                    <DotsHorizontalIcon
                        color={'currentColor'}
                        size={18}
                    />
                </IconContainer>
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
                                />
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
