// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Editor} from '@tiptap/react';
import React, {memo} from 'react';
import {MessageDescriptor, useIntl} from 'react-intl';
import styled from 'styled-components';
import {
    FormatBoldIcon,
    FormatItalicIcon,
    LinkVariantIcon,
    FormatStrikethroughVariantIcon,
    CodeTagsIcon,
    FormatQuoteOpenIcon,
    FormatListBulletedIcon,
    FormatListNumberedIcon, CheckIcon, CodeBlockIcon,
} from '@mattermost/compass-icons/components';
import IconProps from '@mattermost/compass-icons/components/props';

import KeyboardShortcutSequence, {
    KeyboardShortcutDescriptor,
    KEYBOARD_SHORTCUTS,
} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants from 'utils/constants';
import {t} from 'utils/i18n';

export const IconContainer = styled.button`
    display: flex;
    width: 32px;
    height: 32px;
    place-items: center;
    place-content: center;
    white-space: nowrap;
    border: none;
    background: transparent;
    padding: 0;
    gap: 4px;
    border-radius: 4px;
    color: rgba(var(--center-channel-color-rgb), 0.56);

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.72);
        fill: currentColor;
    }

    &:active,
    &.active,
    &.active:hover {
        background: rgba(var(--button-bg-rgb), 0.08);
        color: var(--button-bg);
        fill: currentColor;
    }

    &[disabled] {
        pointer-events: none;
        cursor: not-allowed;
        color: rgba(var(--center-channel-color-rgb), 0.32);

        &:active,
        &.active,
        &.active:hover {
            background: inherit;
            color: inherit;
            fill: inherit;
        }
    }
`;

export const DropdownContainer = styled(IconContainer)`
    width: auto;
    padding: 8px;
`;

export type MarkdownHeadingMode =
    | 'p'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6';

export type MarkdownMarkMode =
    | 'bold'
    | 'italic'
    | 'link'
    | 'strike'
    | 'code'

export type MarkdownBlockMode =
    | 'codeBlock'
    | 'quote'
    | 'ul'
    | 'ol'

export type MarkdownMode = MarkdownMarkMode | MarkdownBlockMode;

/**
 * all modes that can apply to a whole block of text
 */
export const MarkdownBlockModes: MarkdownMode[] = ['codeBlock', 'quote', 'ul', 'ol'];

/**
 * all modes that can apply to a string
 */
export const MarkdownLeafModes: MarkdownMode[] = ['bold', 'italic', 'strike', 'link', 'code'];

/**
 * all modes that apply a heading style
 */
export const MarkdownHeadingModes: MarkdownHeadingMode[] = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

/**
 * combined set of markdown modes
 */
export const MarkdownModes: MarkdownMode[] = MarkdownLeafModes.concat(MarkdownBlockModes);

type ToolbarControlProps = {
    mode: MarkdownMode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    isActive?: boolean;
}

export const MAP_HEADING_MODE_TO_LABEL: Record<MarkdownHeadingMode, MessageDescriptor> = {
    p: {id: t('wysiwyg.tool.paragraph.label'), defaultMessage: 'Normal text'},
    h1: {id: t('wysiwyg.tool.heading1.label'), defaultMessage: 'Heading 1'},
    h2: {id: t('wysiwyg.tool.heading2.label'), defaultMessage: 'Heading 2'},
    h3: {id: t('wysiwyg.tool.heading3.label'), defaultMessage: 'Heading 3'},
    h4: {id: t('wysiwyg.tool.heading4.label'), defaultMessage: 'Heading 4'},
    h5: {id: t('wysiwyg.tool.heading5.label'), defaultMessage: 'Heading 5'},
    h6: {id: t('wysiwyg.tool.heading6.label'), defaultMessage: 'Heading 6'},
};

export const MAP_HEADING_MODE_TO_ARIA_LABEL: Record<MarkdownHeadingMode, MessageDescriptor> = {
    p: {id: t('accessibility.button.paragraph'), defaultMessage: 'normal text'},
    h1: {id: t('accessibility.button.heading1'), defaultMessage: 'heading 1'},
    h2: {id: t('accessibility.button.heading2'), defaultMessage: 'heading 2'},
    h3: {id: t('accessibility.button.heading3'), defaultMessage: 'heading 3'},
    h4: {id: t('accessibility.button.heading4'), defaultMessage: 'heading 4'},
    h5: {id: t('accessibility.button.heading5'), defaultMessage: 'heading 5'},
    h6: {id: t('accessibility.button.heading6'), defaultMessage: 'heading 6'},
};

export const MAP_HEADING_MODE_TO_SHORTCUT: Record<MarkdownHeadingMode, KeyboardShortcutDescriptor> = {
    p: KEYBOARD_SHORTCUTS.msgMarkdownH1,
    h1: KEYBOARD_SHORTCUTS.msgMarkdownH1,
    h2: KEYBOARD_SHORTCUTS.msgMarkdownH2,
    h3: KEYBOARD_SHORTCUTS.msgMarkdownH3,
    h4: KEYBOARD_SHORTCUTS.msgMarkdownH4,
    h5: KEYBOARD_SHORTCUTS.msgMarkdownH5,
    h6: KEYBOARD_SHORTCUTS.msgMarkdownH6,
};

const MAP_MARKDOWN_MODE_TO_ICON: Record<ToolbarControlProps['mode'], React.FC<IconProps>> = {
    bold: FormatBoldIcon,
    italic: FormatItalicIcon,
    link: LinkVariantIcon,
    strike: FormatStrikethroughVariantIcon,
    code: CodeTagsIcon,
    codeBlock: CodeBlockIcon,
    quote: FormatQuoteOpenIcon,
    ul: FormatListBulletedIcon,
    ol: FormatListNumberedIcon,
};

const MAP_MARKDOWN_MODE_TO_ARIA_LABEL: Record<ToolbarControlProps['mode'], MessageDescriptor> = {
    bold: {id: t('accessibility.button.bold'), defaultMessage: 'bold'},
    italic: {id: t('accessibility.button.italic'), defaultMessage: 'italic'},
    link: {id: t('accessibility.button.link'), defaultMessage: 'link'},
    strike: {id: t('accessibility.button.strike'), defaultMessage: 'strike through'},
    code: {id: t('accessibility.button.code'), defaultMessage: 'code'},
    codeBlock: {id: t('accessibility.button.code_block'), defaultMessage: 'code block'},
    quote: {id: t('accessibility.button.quote'), defaultMessage: 'quote'},
    ul: {id: t('accessibility.button.bulleted_list'), defaultMessage: 'bulleted list'},
    ol: {id: t('accessibility.button.numbered_list'), defaultMessage: 'numbered list'},
};

const MAP_MARKDOWN_MODE_TO_KEYBOARD_SHORTCUTS: Record<ToolbarControlProps['mode'], KeyboardShortcutDescriptor> = {
    bold: KEYBOARD_SHORTCUTS.msgMarkdownBold,
    italic: KEYBOARD_SHORTCUTS.msgMarkdownItalic,
    link: KEYBOARD_SHORTCUTS.msgMarkdownLink,
    strike: KEYBOARD_SHORTCUTS.msgMarkdownStrike,
    code: KEYBOARD_SHORTCUTS.msgMarkdownCode,
    codeBlock: KEYBOARD_SHORTCUTS.msgMarkdownCode,
    quote: KEYBOARD_SHORTCUTS.msgMarkdownQuote,
    ul: KEYBOARD_SHORTCUTS.msgMarkdownUl,
    ol: KEYBOARD_SHORTCUTS.msgMarkdownOl,
};

function setLink(editor: Editor) {
    const previousUrl = editor.getAttributes('link').href;
    // eslint-disable-next-line no-alert
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
        return;
    }

    // empty
    if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();

        return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({href: url}).run();
}

export const makeControlHandlerMap = (editor: Editor): Record<ToolbarControlProps['mode'] | MarkdownHeadingMode, () => void> => ({
    bold: () => editor.chain().focus().toggleBold().run(),
    italic: () => editor.chain().focus().toggleItalic().run(),
    link: () => setLink(editor),
    strike: () => editor.chain().focus().toggleStrike().run(),
    code: () => editor.chain().focus().toggleCode().run(),
    codeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
    p: () => editor.chain().focus().setParagraph().run(),
    h1: () => editor.chain().focus().toggleHeading({level: 1}).run(),
    h2: () => editor.chain().focus().toggleHeading({level: 2}).run(),
    h3: () => editor.chain().focus().toggleHeading({level: 3}).run(),
    h4: () => editor.chain().focus().toggleHeading({level: 4}).run(),
    h5: () => editor.chain().focus().toggleHeading({level: 5}).run(),
    h6: () => editor.chain().focus().toggleHeading({level: 6}).run(),
    quote: () => editor.chain().focus().toggleBlockquote().run(),
    ul: () => editor.chain().focus().toggleBulletList().run(),
    ol: () => editor.chain().focus().toggleOrderedList().run(),
});

export const makeControlActiveAssertionMap = (editor: Editor): Record<ToolbarControlProps['mode'] | MarkdownHeadingMode, () => boolean> => ({
    bold: () => editor.isActive('bold'),
    italic: () => editor.isActive('italic'),
    link: () => editor.isActive('link'),
    strike: () => editor.isActive('strike'),
    code: () => editor.isActive('code'),
    codeBlock: () => editor.isActive('codeBlock'),
    p: () => editor.isActive('paragraph'),
    h1: () => editor.isActive('heading', {level: 1}),
    h2: () => editor.isActive('heading', {level: 2}),
    h3: () => editor.isActive('heading', {level: 3}),
    h4: () => editor.isActive('heading', {level: 4}),
    h5: () => editor.isActive('heading', {level: 5}),
    h6: () => editor.isActive('heading', {level: 6}),
    quote: () => editor.isActive('blockquote'),
    ul: () => editor.isActive('bulletList'),
    ol: () => editor.isActive('orderedList'),
});

/**
 * by passing in the rest spread we guarantee that accessibility
 * properties like aria-label, etc. get added to the DOM
 */
const ToolbarControl = ({mode, ...rest}: ToolbarControlProps): JSX.Element => {
    const {formatMessage} = useIntl();

    /* get the correct Icon from the IconMap */
    const Icon = MAP_MARKDOWN_MODE_TO_ICON[mode];
    const buttonAriaLabel = formatMessage(MAP_MARKDOWN_MODE_TO_ARIA_LABEL[mode]);

    const bodyAction = (
        <IconContainer
            type='button'
            id={`FormattingControl_${mode}`}
            aria-label={buttonAriaLabel}
            {...rest}
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

export default memo(ToolbarControl);
