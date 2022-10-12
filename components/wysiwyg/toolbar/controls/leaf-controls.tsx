// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {
    CodeTagsIcon,
    FormatBoldIcon,
    FormatItalicIcon,
    FormatStrikethroughVariantIcon,
    LinkVariantIcon,
} from '@mattermost/compass-icons/components';
import classNames from 'classnames';
import type {Editor} from '@tiptap/react';

import {t} from 'utils/i18n';

import {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';

import ToolbarControl from '../toolbar_controls';
import type {ToolDefinition} from '../toolbar_controls';

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

export type MarkdownLeafMode =
    | 'bold'
    | 'italic'
    | 'link'
    | 'strike'
    | 'code'

export type MarkdownLeafType =
    | 'toggleBold'
    | 'toggleItalic'
    | 'setLink'
    | 'toggleStrike'
    | 'toggleCode'

const makeLeafModeToolDefinitions = (editor: Editor): Array<ToolDefinition<MarkdownLeafMode, MarkdownLeafType>> => [
    {
        mode: 'bold',
        type: 'toggleBold',
        icon: FormatBoldIcon,
        ariaLabelDescriptor: {id: t('accessibility.button.bold'), defaultMessage: 'bold'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownBold,
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: () => editor.isActive('bold'),
    },
    {
        mode: 'italic',
        type: 'toggleItalic',
        icon: FormatItalicIcon,
        ariaLabelDescriptor: {id: t('accessibility.button.italic'), defaultMessage: 'italic'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownItalic,
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: () => editor.isActive('italic'),
    },
    {
        mode: 'link',
        type: 'setLink',
        icon: LinkVariantIcon,
        ariaLabelDescriptor: {id: t('accessibility.button.link'), defaultMessage: 'link'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownLink,
        action: () => setLink(editor),
        isActive: () => editor.isActive('link'),
    },
    {
        mode: 'strike',
        type: 'toggleStrike',
        icon: FormatStrikethroughVariantIcon,
        ariaLabelDescriptor: {id: t('accessibility.button.strike'), defaultMessage: 'strike through'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownStrike,
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: () => editor.isActive('strike'),
    },
    {
        mode: 'code',
        type: 'toggleCode',
        icon: CodeTagsIcon,
        ariaLabelDescriptor: {id: t('accessibility.button.code'), defaultMessage: 'code'},
        shortcutDescriptor: KEYBOARD_SHORTCUTS.msgMarkdownCode,
        action: () => editor.chain().focus().toggleCode().run(),
        isActive: () => editor.isActive('code'),
    },
];

const LeafModeControls = ({editor}: {editor: Editor}) => {
    const leafModeControls = makeLeafModeToolDefinitions(editor);

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
                    disabled={codeBlockModeIsActive}
                />
            ))}
        </>
    );
};

export default LeafModeControls;
