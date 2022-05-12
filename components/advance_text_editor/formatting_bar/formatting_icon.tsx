// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import styled from 'styled-components';

import Constants from 'utils/constants';

import KeyboardShortcutSequence, {
    KeyboardShortcutDescriptor,
    KEYBOARD_SHORTCUTS,
} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import {ApplyMarkdownOptions} from 'utils/markdown/apply_markdown';

export const Icon = styled.button`
    display: flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 4px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
    fill: rgba(var(--center-channel-color-rgb), 0.56);

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.72);
        fill: rgba(var(--center-channel-color-rgb), 0.72);
    }

    &:active,
    &--active,
    &--active:hover {
        background: rgba(var(--button-bg-rgb), 0.08);
        color: v(button-bg);
        fill: v(button-bg);
    }
`;

interface FormattingIconProps {
    type: ApplyMarkdownOptions['markdownMode'];
    onClick?: () => void;
}

const MAP_MARKDOWN_TYPE_TO_ICON: {
    [key in FormattingIconProps['type']]: string;
} = {
    bold: 'icon icon-format-bold',
    italic: 'icon icon-format-italic',
    link: 'icon icon-link-variant',
    strike: 'icon icon-format-strikethrough-variant',
    code: 'icon icon-code-tags',
    heading: 'icon icon-format-header',
    quote: 'icon icon-format-quote-open',
    ul: 'icon icon-format-list-bulleted',
    ol: 'icon icon-format-list-numbered',
};

const MAP_MARKDOWN_TYPE_TO_KEYBOARD_SHORTCUTS: {
    [key in FormattingIconProps['type']]?: KeyboardShortcutDescriptor;
} = {
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

export const FormattingIcon = (props: FormattingIconProps): JSX.Element => {
    const {type, onClick} = props;

    const bodyAction = (
        <div>
            <Icon
                type='button'
                id='fileUploadButton'
                aria-label={MAP_MARKDOWN_TYPE_TO_ICON[type]}
            >
                <i className={MAP_MARKDOWN_TYPE_TO_ICON[type]}/>
            </Icon>
        </div>
    );
    const tooltip = MAP_MARKDOWN_TYPE_TO_KEYBOARD_SHORTCUTS[type];
    return (
        <>
            {tooltip ? (
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    trigger={['hover', 'focus']}
                    overlay={<Tooltip id='upload-tooltip'>
                        <KeyboardShortcutSequence
                            shortcut={tooltip}
                            hoistDescription={true}
                            isInsideTooltip={true}
                        />
                    </Tooltip>}
                >
                    <div
                        onClick={onClick}
                        className={'style--none'}
                    >
                        {bodyAction}
                    </div>
                </OverlayTrigger>) : (<div className={'style--none'}>{bodyAction}</div>)
            }
        </>
    );
};
