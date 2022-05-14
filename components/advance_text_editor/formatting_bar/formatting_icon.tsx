// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import styled from 'styled-components';
import {
    FormatBoldIcon,
    FormatItalicIcon,
    LinkVariantIcon,
    FormatStrikethroughVariantIcon,
    CodeTagsIcon,
    FormatHeaderIcon,
    FormatQuoteOpenIcon,
    FormatListBulletedIcon,
    FormatListNumberedIcon,
} from '@mattermost/compass-icons/components';
import IconProps from '@mattermost/compass-icons/components/props';

import KeyboardShortcutSequence, {
    KeyboardShortcutDescriptor,
    KEYBOARD_SHORTCUTS,
} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import {MarkdownMode} from 'utils/markdown/apply_markdown';
import Constants from 'utils/constants';

export const IconContainer = styled.button`
    display: flex;
    width: 32px;
    height: 32px;
    place-items: center;
    place-content: center;
    border: none;
    background: transparent;
    border-radius: 4px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
    fill: currentColor;

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.72);
        fill: currentColor;
    }

    &:active,
    &--active,
    &--active:hover {
        background: rgba(var(--button-bg-rgb), 0.08);
        color: var(--button-bg);
        fill: currentColor;
    }
`;

interface FormattingIconProps {
    mode: MarkdownMode;
    onClick?: () => void;
    className?: string;
}

const MAP_MARKDOWN_MODE_TO_ICON: Record<FormattingIconProps['mode'], React.FC<IconProps>> = {
    bold: FormatBoldIcon,
    italic: FormatItalicIcon,
    link: LinkVariantIcon,
    strike: FormatStrikethroughVariantIcon,
    code: CodeTagsIcon,
    heading: FormatHeaderIcon,
    quote: FormatQuoteOpenIcon,
    ul: FormatListBulletedIcon,
    ol: FormatListNumberedIcon,
};

const MAP_MARKDOWN_MODE_TO_KEYBOARD_SHORTCUTS: Record<FormattingIconProps['mode'], KeyboardShortcutDescriptor> = {
    bold: KEYBOARD_SHORTCUTS.msgMarkdownBold,
    italic: KEYBOARD_SHORTCUTS.msgMarkdownItalic,
    link: KEYBOARD_SHORTCUTS.msgMarkdownLink,
    strike: KEYBOARD_SHORTCUTS.msgMarkdownStrike,
    code: KEYBOARD_SHORTCUTS.msgMarkdownCode,
    heading: KEYBOARD_SHORTCUTS.msgMarkdownH3,
    quote: KEYBOARD_SHORTCUTS.msgMarkdownQuote,
    ul: KEYBOARD_SHORTCUTS.msgMarkdownUl,
    ol: KEYBOARD_SHORTCUTS.msgMarkdownOl,
};

const FormattingIcon = (props: FormattingIconProps): JSX.Element => {
    /**
     * by passing in the otherProps spread we guarantee that accessibility
     * properties like aria-label, etc. get added to the DOM
     */
    const {mode, onClick, ...otherProps} = props;

    /* get the correct Icon from the IconMap */
    const Icon = MAP_MARKDOWN_MODE_TO_ICON[mode];

    const bodyAction = (
        <IconContainer
            type='button'
            id={`FormattingControl_${mode}`}
            onClick={onClick}
            {...otherProps}
        >
            <Icon
                color={'currentColor'}
                size={18}
            />
        </IconContainer>
    );

    /* get the correct tooltip from the ShortcutsMap */
    const shortcut = MAP_MARKDOWN_MODE_TO_KEYBOARD_SHORTCUTS[mode];
    const tooltip = (
        <Tooltip id='upload-tooltip'>
            <KeyboardShortcutSequence
                shortcut={shortcut}
                hoistDescription={true}
                isInsideTooltip={true}
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
            {bodyAction}
        </OverlayTrigger>
    );
};

export default memo(FormattingIcon);
