// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useClickAway} from '@mattermost/compass-components/shared/hooks';
import React, {ReactNode, ReactNodeArray, useLayoutEffect, useState} from 'react';
import {autoUpdate, flip, offset, useFloating} from '@floating-ui/react-dom';
import {isNodeSelection, posToDOMRect} from '@tiptap/core';
import {
    CodeTagsIcon,
    FormatBoldIcon,
    FormatItalicIcon,
    FormatStrikethroughVariantIcon,
    LinkVariantIcon,
} from '@mattermost/compass-icons/components';
import classNames from 'classnames';
import type {Editor} from '@tiptap/react';
import {createPortal} from 'react-dom';
import styled from 'styled-components';

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

const FloatingContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 12px;
    background: rgb(var(--center-channel-bg-rgb));
    border-radius: 4px;

    min-width: 250px;

    box-shadow: 0 0 8px 2px rgba(0,0,0,0.12);
`;

type Props = {
    editor: Editor;
    open: boolean;
    onClose?: () => void;
    children: ReactNode | ReactNodeArray;
};

export const Overlay = ({editor, open, children, onClose}: Props) => {
    const {x, y, strategy, reference, floating, refs} = useFloating({
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
        placement: 'top-start',
        middleware: [
            offset({mainAxis: 8}),
            flip({
                padding: 8,
            }),
        ],
    });
    useClickAway([refs.floating], onClose);

    useLayoutEffect(() => {
        const {ranges} = editor.state.selection;
        const from = Math.min(...ranges.map((range) => range.$from.pos));
        const to = Math.max(...ranges.map((range) => range.$to.pos));

        reference({
            getBoundingClientRect() {
                if (isNodeSelection(editor.state.selection)) {
                    const node = editor.view.nodeDOM(from) as HTMLElement;

                    if (node) {
                        return node.getBoundingClientRect();
                    }
                }

                return posToDOMRect(editor.view, from, to);
            },
        });
    }, [reference, editor, open]);

    if (!open) {
        return null;
    }

    return createPortal(
        <div
            ref={floating}
            style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
            }}
        >
            <FloatingContainer>
                {children}
            </FloatingContainer>
        </div>,
        document.body,
    );
};

const LeafModeControls = ({editor}: {editor: Editor}) => {
    const [showLinkOverlay, setShowLinkOverlay] = useState(false);
    const leafModeControls = makeLeafModeToolDefinitions(editor);

    const codeBlockModeIsActive = editor.isActive('codeBlock');

    const toggleLinkOverlay = () => setShowLinkOverlay(!showLinkOverlay);

    return (
        <>
            <Overlay
                open={showLinkOverlay}
                editor={editor}
            >
                {'TEST WITH A BIT MORE OF SPACE NEEDED'}
            </Overlay>
            {leafModeControls.map((control) => (
                <ToolbarControl
                    key={`${control.type}_${control.mode}`}
                    mode={control.type}
                    Icon={control.icon}
                    onClick={control.type === 'setLink' ? toggleLinkOverlay : control.action}
                    className={classNames({active: control.isActive?.()})}
                    disabled={codeBlockModeIsActive}
                />
            ))}
        </>
    );
};

export default LeafModeControls;
