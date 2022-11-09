// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {Editor} from '@tiptap/react';
import classNames from 'classnames';
import {
    CodeBlockIcon,
    FormatListBulletedIcon,
    FormatListNumberedIcon,
    FormatQuoteOpenIcon,
} from '@mattermost/compass-icons/components';

import {t} from 'utils/i18n';
import {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';

import ToolbarControl from '../toolbar_controls';
import type {ToolDefinition} from '../toolbar_controls';

export type MarkdownBlockMode =
    | 'codeBlock'
    | 'blockquote'
    | 'ul'
    | 'ol'

export type MarkdownBlockType =
    | 'toggleCodeBlock'
    | 'toggleQuote'
    | 'toggleBulletList'
    | 'toggleOrderedList'

const makeBlockModeToolDefinitions = (editor: Editor): Array<ToolDefinition<MarkdownBlockMode, MarkdownBlockType>> => [
    {
        mode: 'codeBlock',
        type: 'toggleCodeBlock',
        icon: CodeBlockIcon,
        ariaLabelDescriptor: {id: t('accessibility.button.code_block'), defaultMessage: 'code block'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownCode,
        action: () => editor.chain().focus().toggleCodeBlock().run(),
        isActive: () => editor.isActive('codeBlock'),
    },
    {
        mode: 'blockquote',
        type: 'toggleQuote',
        icon: FormatQuoteOpenIcon,
        ariaLabelDescriptor: {id: t('accessibility.button.quote'), defaultMessage: 'quote'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownQuote,
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: () => editor.isActive('blockquote'),
    },
    {
        mode: 'ul',
        type: 'toggleBulletList',
        icon: FormatListBulletedIcon,
        ariaLabelDescriptor: {id: t('accessibility.button.bulleted_list'), defaultMessage: 'bulleted list'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownUl,
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: () => editor.isActive('bulletList'),
    },
    {
        mode: 'ol',
        type: 'toggleOrderedList',
        icon: FormatListNumberedIcon,
        ariaLabelDescriptor: {id: t('accessibility.button.numbered_list'), defaultMessage: 'numbered list'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownOl,
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: () => editor.isActive('orderedList'),
    },
];

const BlockModeControls = ({editor}: {editor: Editor}) => {
    const leafModeControls = makeBlockModeToolDefinitions(editor);

    const codeBlockModeIsActive = editor.isActive('codeBlock');

    return (
        <>
            {leafModeControls.map((control) => (
                <ToolbarControl
                    key={`${control.type}_${control.mode}`}
                    mode={control.type}
                    Icon={control.icon}
                    onClick={control.action}
                    className={classNames({active: control.isActive?.()})}
                    disabled={control.mode !== 'codeBlock' && codeBlockModeIsActive}
                />
            ))}
        </>
    );
};

export default BlockModeControls;
