// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import type {FormEvent} from 'react';
import {KeyboardShortcutCommand} from '@tiptap/core';
import {
    EditorContent,
    useEditor,
} from '@tiptap/react';
import type {JSONContent} from '@tiptap/react';

import type {NewPostDraft} from 'types/store/draft';

// import all custom components, extensions, etc.
import {EditorContainer, WysiwygContainer} from './components/editor';
import EmojiPicker from './components/emoji-picker';
import Toolbar from './components/toolbar';
import SendButton from './components/send-button';
import {Extensions, SuggestionConfig} from './extensions';

import {htmlToMarkdown} from './utils/toMarkdown';

import {PropsFromRedux} from './index';

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
                codeBlock: {defaultLanguage: 'css'},
                table: {allowTableNodeSelection: true},
                link: {
                    linkOnPaste: false,
                    openOnClick: false,
                    HTMLAttributes: {class: 'wysiwyglink'},
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
