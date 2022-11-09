// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback, useEffect, useState} from 'react';
import styled, {css} from 'styled-components';
import classNames from 'classnames';
import {useIntl} from 'react-intl';
import {CSSTransition} from 'react-transition-group';
import {offset, useFloating} from '@floating-ui/react-dom';
import {CheckIcon, ChevronDownIcon} from '@mattermost/compass-icons/components';
import type {Editor} from '@tiptap/react';

import {t} from 'utils/i18n';

import {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';

import type {WithOptional, WithRequired} from '@mattermost/types/utilities';

import {
    FloatingContainer,
    DropdownContainer,
} from '../toolbar_controls';
import type {ToolDefinition} from '../toolbar_controls';
import {useGetLatest} from '../toolbar_hooks';

type HeadingToolDefinition = WithRequired<WithOptional<ToolDefinition<MarkdownHeadingMode, MarkdownHeadingType>, 'icon'>, 'labelDescriptor'>;

export type MarkdownHeadingMode =
    | 'p'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6';

export type MarkdownHeadingType =
    | 'setParagraph'
    | 'toggleHeading';

const makeHeadingToolDefinitions = (editor: Editor): HeadingToolDefinition[] => [
    {
        mode: 'p',
        type: 'setParagraph',
        labelDescriptor: {id: t('wysiwyg.tool-label.paragraph.label'), defaultMessage: 'Normal text'},
        ariaLabelDescriptor: {id: t('accessibility.button.paragraph'), defaultMessage: 'normal text'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownP,
        action: () => editor.chain().focus().setParagraph().run(),
        isActive: () => editor.isActive('paragraph'),
    },
    {
        mode: 'h1',
        type: 'toggleHeading',
        labelDescriptor: {id: t('wysiwyg.tool-label.heading1.label'), defaultMessage: 'Heading 1'},
        ariaLabelDescriptor: {id: t('accessibility.button.heading1'), defaultMessage: 'heading 1'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownH1,
        action: () => editor.chain().focus().toggleHeading({level: 1}).run(),
        isActive: () => editor.isActive('heading', {level: 1}),
    },
    {
        mode: 'h2',
        type: 'toggleHeading',
        labelDescriptor: {id: t('wysiwyg.tool-label.heading2.label'), defaultMessage: 'Heading 2'},
        ariaLabelDescriptor: {id: t('accessibility.button.heading2'), defaultMessage: 'heading 2'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownH2,
        action: () => editor.chain().focus().toggleHeading({level: 2}).run(),
        isActive: () => editor.isActive('heading', {level: 2}),
    },
    {
        mode: 'h3',
        type: 'toggleHeading',
        labelDescriptor: {id: t('wysiwyg.tool-label.heading3.label'), defaultMessage: 'Heading 3'},
        ariaLabelDescriptor: {id: t('accessibility.button.heading3'), defaultMessage: 'heading 3'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownH3,
        action: () => editor.chain().focus().toggleHeading({level: 3}).run(),
        isActive: () => editor.isActive('heading', {level: 3}),
    },
    {
        mode: 'h4',
        type: 'toggleHeading',
        labelDescriptor: {id: t('wysiwyg.tool-label.heading4.label'), defaultMessage: 'Heading 4'},
        ariaLabelDescriptor: {id: t('accessibility.button.heading4'), defaultMessage: 'heading 4'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownH4,
        action: () => editor.chain().focus().toggleHeading({level: 4}).run(),
        isActive: () => editor.isActive('heading', {level: 4}),
    },
    {
        mode: 'h5',
        type: 'toggleHeading',
        labelDescriptor: {id: t('wysiwyg.tool-label.heading5.label'), defaultMessage: 'Heading 5'},
        ariaLabelDescriptor: {id: t('accessibility.button.heading5'), defaultMessage: 'heading 5'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownH5,
        action: () => editor.chain().focus().toggleHeading({level: 5}).run(),
        isActive: () => editor.isActive('heading', {level: 5}),
    },
    {
        mode: 'h6',
        type: 'toggleHeading',
        labelDescriptor: {id: t('wysiwyg.tool-label.heading6.label'), defaultMessage: 'Heading 6'},
        ariaLabelDescriptor: {id: t('accessibility.button.heading6'), defaultMessage: 'heading 6'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownH6,
        action: () => editor.chain().focus().toggleHeading({level: 6}).run(),
        isActive: () => editor.isActive('heading', {level: 6}),
    },
];

const HeadingControls = ({editor}: {editor: Editor}) => {
    const {formatMessage} = useIntl();
    const [showHeadingControls, setShowHeadingControls] = useState(false);

    const headingToolDefinitions = makeHeadingToolDefinitions(editor);

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
            event.stopPropagation();
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
    }, [update]);

    const toggleHeadingControls = useCallback((event?) => {
        event?.preventDefault();
        setShowHeadingControls(!showHeadingControls);
    }, [showHeadingControls]);

    const hiddenControlsContainerStyles: React.CSSProperties = {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
    };

    const getHeadingLabel = () => {
        switch (true) {
        case editor.isActive('heading', {level: 1}):
            return formatMessage(headingToolDefinitions[1].labelDescriptor);
        case editor.isActive('heading', {level: 2}):
            return formatMessage(headingToolDefinitions[2].labelDescriptor);
        case editor.isActive('heading', {level: 3}):
            return formatMessage(headingToolDefinitions[3].labelDescriptor);
        case editor.isActive('heading', {level: 4}):
            return formatMessage(headingToolDefinitions[4].labelDescriptor);
        case editor.isActive('heading', {level: 5}):
            return formatMessage(headingToolDefinitions[5].labelDescriptor);
        case editor.isActive('heading', {level: 6}):
            return formatMessage(headingToolDefinitions[6].labelDescriptor);
        case editor.isActive('paragraph'):
        default:
            return formatMessage(headingToolDefinitions[0].labelDescriptor);
        }
    };

    const codeBlockModeIsActive = editor.isActive('codeBlock');

    return (
        <>
            <DropdownContainer
                id={'HiddenControlsButton' + location}
                ref={reference}
                className={classNames({active: showHeadingControls})}
                onClick={toggleHeadingControls}
                aria-label={formatMessage({id: 'accessibility.button.formatting', defaultMessage: 'formatting'})}
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
                <FloatingContainer
                    ref={floating}
                    style={hiddenControlsContainerStyles}
                >
                    {headingToolDefinitions.map((control) => {
                        return (
                            <HeadingSelectOption
                                key={`${control.type}_${control.mode}`}
                                mode={control.mode}
                                active={control.isActive?.()}
                                onClick={() => {
                                    control.action();
                                    setShowHeadingControls(false);
                                }}
                                label={formatMessage(control.labelDescriptor)}
                                aria-label={control.ariaLabelDescriptor ? formatMessage(control.ariaLabelDescriptor) : ''}
                            />
                        );
                    })}
                </FloatingContainer>
            </CSSTransition></>
    );
};

type HeadingSelectOptionProps = {
    mode: MarkdownHeadingMode;
    active?: boolean;
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

export default HeadingControls;
