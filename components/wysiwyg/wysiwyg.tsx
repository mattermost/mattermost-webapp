// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {KeyboardShortcutCommand} from '@tiptap/core';
import React, {useEffect} from 'react';
import type {FormEvent} from 'react';
import styled from 'styled-components';

import {
    EditorContent,
    useEditor,
} from '@tiptap/react';
import type {JSONContent} from '@tiptap/react';

// load all highlight.js languages
import {lowlight} from 'lowlight';

import type {NewPostDraft} from 'types/store/draft';

import EmojiPicker from './components/emoji-picker';
import {Extensions, SuggestionConfig} from './extensions';
import {htmlToMarkdown} from './utils/toMarkdown';

// import all custom components, extensions, etc.
import Toolbar from './components/toolbar';
import SendButton from './components/send-button';

import {PropsFromRedux} from './index';

const WysiwygContainer = styled.div`
    margin: 0 24px 24px;
    border: 2px solid rgba(var(--center-channel-color-rgb), 0.32);
    border-radius: 4px;
`;

const EditorContainer = styled.div`
    display: block;
    align-items: center;
    padding: 14px 16px 0 16px;
    max-height: 45vh;
    overflow: auto;

    &::-webkit-scrollbar {
        width: 8px; /* Mostly for vertical scrollbars */
        height: 8px; /* Mostly for horizontal scrollbars */
    }

    &::-webkit-scrollbar-thumb { /* Foreground */
        background: rgba(var(--center-channel-color-rgb), 0.2);
    }

    &::-webkit-scrollbar-track { /* Background */
        width: 12px;
        background: transparent;
    }

    .markdown__table {
        position: relative;

        p:last-child {
            margin-bottom: 0;
        }

        &.ProseMirror-selectednode th,
        &.ProseMirror-selectednode td,
        th.selectedCell,
        td.selectedCell {
            position: relative;
            background: rgba(var(--button-bg-rgb), 0.08);
            border: 1px solid rgba(var(--button-bg-rgb), 0.32);
        }

        th,
        td {
            // this is to fix a bug with the cursor being hidden in empty cells
            min-width: 28px;
        }
    }

    .ProseMirror-gapcursor:after {
        border-color: rgb(var(--center-channel-color));
    }

    h1, h2, h3 {
        font-family: Metropolis, sans-serif;
    }

    h1, h2, h3, h4, h5, h6 {
        margin: 10px 0;
        font-weight: 600;
        line-height: 1.5;
    }

    h1 {
        font-size: 28px;
    }

    h2 {
        font-size: 25px;
    }

    h3 {
        font-size: 22px;
    }

    h4 {
        font-size: 19px;
    }

    h5 {
        font-size: 15px;
    }

    h6 {
        font-size: 14px;
    }

    p {
        margin: 0.5em 0 0;
        font-weight: 400;
        font-size: 13.5px;
    }

    h1, h2, h3, h4, h5, h6, p {
        &:first-child {
            margin-top: 0;
        }
    }

    p.is-editor-empty:first-child::before {
        color: rgba(var(--center-channel-color-rgb), 0.56);
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
    }

    .AdvancedTextEditor__priority {
        padding: 0 0 12px;
    }
`;

export enum Formatters {
    link,
    table,
    image,
    codeBlock,
}

export type WysiwygConfig = {
    disableFormatting?: Formatters[];
    keyHandlers?: Record<string, KeyboardShortcutCommand>;
    suggestions?: Omit<SuggestionConfig, 'emoji'>;
    additionalControls?: React.ReactNode[];
};

type Props = PropsFromRedux & {

    /**
     * Function to handle submitting the content.
     * Receives a FormEvent, current Markdown and current JSONContent values from the editor as optional parameters.
     */
    onSubmit: (e?: FormEvent, markdownText?: string, json?: JSONContent) => void;

    /**
     * Function to handle changes in the editors content.
     * Receives the current Markdown and JSONContent values from the editor as optional parameters.
     */
    onChange?: (markdownText: string, json?: JSONContent) => void;

    /**
     * Configuration object to fine-tune the WYSIWYG editor behavior.
     * Holds settings to disable certain formatting functions, configurations needed for the different types of
     * suggestions, additional keyHandlers and additional Controls for the toolbar.
     */
    config?: WysiwygConfig;

    /**
     * If present the editor will be populated with the content specified in this draft.
     */
    draft?: NewPostDraft;

    /**
     * A string to show when the editor is empty.
     */
    placeholder?: string;

    /**
     * Disables editing and formatting funcitonalities.
     */
    readOnly?: boolean;

    /**
     * Content to display above the editors editable area.
     */
    headerContent?: React.ReactNode | React.ReactNode[];
}

export default (props: Props) => {
    const {
        config,
        reduxConfig,
        onSubmit,
        onChange,
        placeholder,
        readOnly,
        useCustomEmojis,
        ctrlSend,
        codeBlockOnCtrlEnter,
        headerContent,
        draft,
    } = props;

    const editor = useEditor({
        extensions: [
            Extensions.configure({
                config,
                hardBreak: false,
                placeholder: placeholder ? {placeholder} : false,
                codeBlock: {
                    lowlight,
                    defaultLanguage: 'css',
                },
                table: {
                    allowTableNodeSelection: true,
                },
                link: {
                    linkOnPaste: false,
                    openOnClick: false,
                    HTMLAttributes: {
                        class: 'wysiwyglink',
                    },
                },
                suggestions: {
                    emoji: {useCustomEmojis},
                    mention: config?.suggestions?.mention,
                    channel: config?.suggestions?.channel,
                    command: config?.suggestions?.command,
                },
                keyHandling: {
                    submitAction: onSubmit,
                    ctrlSend,
                    codeBlockOnCtrlEnter,
                    additionalHandlers: config?.keyHandlers,
                },
            }),
        ],
        content: draft?.content,
        autofocus: 'end',
        onUpdate: ({editor}) => {
            // call the onChange function from the parent component (if available)
            onChange?.(htmlToMarkdown(editor.getHTML()), editor.getJSON());

            /* eslint-disable */
            console.group('##### Output to be stored in drafts or for submission');
            console.log('##### HTML', editor.getHTML());
            console.log('##### parsed Markdown', htmlToMarkdown(editor.getHTML()));
            console.groupEnd();
            /* eslint-enable */
        },
    }, [ctrlSend, codeBlockOnCtrlEnter]);

    // focus the editor on mount
    useEffect(() => {
        editor?.commands.focus();
    }, [editor]);

    if (!editor) {
        return null;
    }

    function handleSubmit(event?: React.FormEvent) {
        event?.preventDefault();

        // We should probably only allow submitting with the value from the editor to not create a case
        // where incorrect messages are being sent to the server
        onSubmit();
        editor?.commands.clearContent(true);
    }

    const disableSendButton = editor.isEmpty;
    const sendButton = readOnly ? null : (
        <SendButton
            disabled={disableSendButton}
            handleSubmit={handleSubmit}
        />
    );

    const emojiPicker = reduxConfig.EnableEmojiPicker === 'true' ? <EmojiPicker editor={editor}/> : null;

    const rightControls = (
        <>
            {emojiPicker}
            {sendButton}
        </>
    );

    const toolbarProps = {
        editor,
        rightControls,
        additionalControls: config?.additionalControls,
    };

    return (
        <WysiwygContainer>
            <EditorContainer>
                {headerContent}
                <EditorContent editor={editor}/>
            </EditorContainer>
            <Toolbar {...toolbarProps}/>
        </WysiwygContainer>
    );
};
