// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useClickAway} from '@mattermost/compass-components/shared/hooks';
import React, {FormEvent, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {autoUpdate, flip, offset, useFloating} from '@floating-ui/react-dom';
import {isNodeSelection, posToDOMRect} from '@tiptap/core';
import {
    CodeTagsIcon,
    FormatBoldIcon,
    FormatItalicIcon,
    FormatStrikethroughVariantIcon,
    LinkVariantIcon, MenuVariantIcon,
} from '@mattermost/compass-icons/components';
import classNames from 'classnames';
import type {Editor} from '@tiptap/react';
import {createPortal} from 'react-dom';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import CCIconButton from '@mattermost/compass-components/components/icon-button';
import type PIconButton from '@mattermost/compass-components/components/icon-button/IconButton.props';

import {t} from 'utils/i18n';

import {KEYBOARD_SHORTCUTS} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';

import ToolbarControl, {FloatingContainer} from '../toolbar_controls';
import type {ToolDefinition} from '../toolbar_controls';

// TODO@michel: replace this with the new components from Los Tigres once ready
const IconButton = (props: PIconButton) => (
    <CCIconButton
        {...props}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        type={'button'}
    />
);

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
        action: () => {},
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

const FloatingLinkContainer = styled(FloatingContainer)`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 20px;
    background: rgb(var(--center-channel-bg-rgb));
    border-radius: 4px;

    min-width: 400px;

    box-shadow: 0 0 8px 2px rgba(0,0,0,0.12);

    transform: scale(1);
    opacity: 1;
`;

const LinkInputBox = styled.div`
    background: transparent;
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 12px;
`;

const LinkInput = styled.input`
    background: transparent;
    appearance: none;
    border: none;
    flex: 1;
    padding: 9px 10px 9px 0;
    font-size: 14px;
    line-height: 20px;
    color: rgb(var(--center-channel-color-rgb));
`;

const LinkInputHelp = styled.span`
    font-size: 10px;
    line-height: 16px;
    color: rgba(var(--center-channel-color-rgb), 0.56)
`;

type LinkOverlayProps = {
    editor: Editor;
    open: boolean;
    buttonRef: React.RefObject<HTMLButtonElement>;
    onClose?: () => void;
};

/**
 * cross-referencing the comment from suggestion-list file regarding overlays
 * @see {@link components/wysiwyg/components/suggestions/suggestion-list.tsx}
 */
export const LinkOverlay = ({editor, open, onClose, buttonRef}: LinkOverlayProps) => {
    const {formatMessage} = useIntl();
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

    const {state} = editor;
    const {selection: {from, to}} = state;
    const selectedText = state.doc.textBetween(from, to, ' ') || '';

    const previousUrl = editor.getAttributes('link').href || '';
    const linkMarkIsActive = editor.isActive('link');

    const [url, setUrl] = useState<string | null>(null);
    const [text, setText] = useState<string | null>(null);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Esc' || event.key === 'Escape') {
                onClose?.();
            }
        };
        document.addEventListener('keydown', handleEscapeKey);

        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [onClose]);

    useClickAway([refs.floating, buttonRef], onClose);

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

    useEffect(() => {
        // reset the state values when we hide the overlay
        setUrl(null);
        setText(null);
    }, [open]);

    const closeOverlay = () => {
        // clear the component state
        setUrl(null);
        setText(null);

        // once done close the overlay
        onClose?.();
    };

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
            <FloatingLinkContainer
                as={'form'}
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    event.stopPropagation();

                    // either we have a new url, or we take the previous one
                    const newUrl = url || previousUrl;

                    // same goes for this: either we have something typed for it or we take the previous/selected value
                    const newText = text || selectedText || newUrl || '';

                    if (!newUrl) {
                        // if there is no URL set for the link it will remove the link mark
                        editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    } else if (selectedText === newText) {
                        // extend the range to the whole link (if no link mark is present it does not do anything)
                        // and change/add the url on it
                        editor.chain().focus().extendMarkRange('link').setLink({href: newUrl}).run();
                    } else {
                        editor.
                            chain().
                            focus().
                            extendMarkRange('link').
                            deleteRange(editor.state.selection).

                            // insert the text (either the url or the text from the input field)
                            insertContentAt(from, newText).

                            // select the inserted text
                            setTextSelection({from, to: from + newText.length}).

                            // apply the link mark to it
                            setLink({href: newUrl}).
                            run();
                    }

                    closeOverlay();
                }}
            >
                <LinkInputBox>
                    <LinkVariantIcon
                        size={16}
                        color={'rgba(var(--center-channel-color-rgb), 0.64)'}
                    />
                    <LinkInput
                        type={'text'}
                        value={url ?? previousUrl}
                        placeholder={formatMessage({id: 'wysiwyg.input-label.link.url', defaultMessage: 'Type or paste a link'})}
                        onChange={(event) => setUrl(event.target.value)}
                    />
                    {url !== null && url !== previousUrl && (
                        <LinkInputHelp>{formatMessage({id: 'wysiwyg.input-label.link.hint', defaultMessage: '⏎ Enter to save'})}</LinkInputHelp>
                    )}
                    {linkMarkIsActive && (
                        <IconButton
                            size={'sm'}
                            compact={true}
                            destructive={true}
                            icon={'trash-can-outline'}
                            onClick={() => {
                                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                                closeOverlay();
                            }}
                            aria-label={formatMessage({id: 'accessibility.button.link.delete', defaultMessage: 'remove link'})}
                        />
                    )}
                </LinkInputBox>
                <LinkInputBox>
                    <MenuVariantIcon
                        size={16}
                        color={'rgba(var(--center-channel-color-rgb), 0.64)'}
                    />
                    <LinkInput
                        type={'text'}
                        value={text ?? selectedText}
                        placeholder={formatMessage({id: 'wysiwyg.input-label.link.text', defaultMessage: 'Display text'})}
                        onChange={(event) => setText(event.target.value)}
                    />
                </LinkInputBox>
                <input
                    type='submit'
                    hidden={true}
                />
            </FloatingLinkContainer>
        </div>,
        document.body,
    );
};

const LeafModeControls = ({editor}: {editor: Editor}) => {
    const linkButtonRef = useRef<HTMLButtonElement>(null);
    const [showLinkOverlay, setShowLinkOverlay] = useState(false);

    const codeBlockModeIsActive = editor.isActive('codeBlock');
    const leafModeControls = makeLeafModeToolDefinitions(editor);

    const toggleLinkOverlay = () => {
        if (!showLinkOverlay) {
            editor.commands.extendMarkRange('link');
        }
        setShowLinkOverlay(!showLinkOverlay);
    };

    return (
        <>
            <LinkOverlay
                editor={editor}
                open={showLinkOverlay}
                buttonRef={linkButtonRef}
                onClose={() => setShowLinkOverlay(false)}
            />
            {leafModeControls.map((control) => (
                <ToolbarControl
                    ref={control.type === 'setLink' ? linkButtonRef : null}
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
