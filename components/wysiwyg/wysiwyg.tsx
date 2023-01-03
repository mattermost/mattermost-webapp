// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {KeyboardShortcutCommand} from '@tiptap/core';
import React, {useCallback, useEffect, useRef} from 'react';
import type {FormEvent} from 'react';
import styled from 'styled-components';
import {useDispatch, useSelector} from 'react-redux';
import {debounce} from 'lodash';
import type {DebouncedFunc} from 'lodash';

import {
    EditorContent,
    useEditor,
} from '@tiptap/react';
import type {JSONContent} from '@tiptap/react';
import type {Editor} from '@tiptap/core';

// load all highlight.js languages
import {lowlight} from 'lowlight';

import {ActionTypes} from 'utils/constants';

import type {GlobalState} from 'types/store';
import type {NewPostDraft} from 'types/store/draft';

import EmojiPicker from './components/emoji-picker';
import {Extensions} from './extensions';
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

        &.ProseMirror-selectednode,
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

function useDraft(channelId: string, rootId = ''): [NewPostDraft, (newContent: JSONContent) => void] {
    const dispatch = useDispatch();

    const draft = useSelector((state: GlobalState) => {
        // TODO should these just be stored in the same place?
        return rootId ? state.drafts.byThread[rootId] : state.drafts.byChannel[channelId];
    });

    const setDraftContent = useCallback((newContent: JSONContent) => {
        dispatch({
            type: ActionTypes.DRAFT_CONTENT_UPDATED,
            channelId,
            rootId,

            /**
             * JSONContent or some of its children aren't plain JS objects, so they can't be serialized automatically.
             *
             * TODO@michel
             * figure out how to persist them properly since serializing and deserializing them feels hacky or
             * perhaps serialize their generated Markdown.
             */
            content: JSON.parse(JSON.stringify(newContent)),
        });
    }, [dispatch, channelId, rootId]);

    return [draft, setDraftContent];
}

type FormattingConfig = {
    links?: boolean;
    images?: boolean;
    codeBlock?: boolean;
}

export type WysiwygConfig = {
    disableFormatting: FormattingConfig;
    additionalKeyHandlers: Record<string, KeyboardShortcutCommand>;
};

type Props = PropsFromRedux & {
    channelId: string;
    placeholder?: string;
    rootId?: string;
    onSubmit: (e?: FormEvent) => void;
    onChange?: (markdownText: string) => void;
    readOnly?: boolean;
    additionalControls?: React.ReactNode[];
    headerContent?: React.ReactNode | React.ReactNode[];
    config?: WysiwygConfig;
}

export default (props: Props) => {
    const {
        config,
        reduxConfig,
        teamId,
        channelId,
        rootId,
        onSubmit,
        onChange,
        placeholder,
        readOnly,
        useCustomEmojis,
        useSpecialMentions,
        useLDAPGroupMentions,
        useChannelMentions,
        useCustomGroupMentions,
        ctrlSend,
        codeBlockOnCtrlEnter,
        additionalControls,
        headerContent,
    } = props;

    const [draft, setDraftContent] = useDraft(channelId, rootId);
    const debouncedDraft = useRef<DebouncedFunc<(editor: Editor) => void>>(debounce((editor) => setDraftContent(editor.getJSON()), 500));

    // const PasteHandler = Extension.create({
    //     name: 'pasteHandler',
    //
    //     addProseMirrorPlugins() {
    //         return [
    //             new Plugin({
    //                 key: new PluginKey('pasteHandler'),
    //                 props: {
    //
    //                     // Here is the full list: https://prosemirror.net/docs/ref/#view.EditorProps
    //                 },
    //             }),
    //         ];
    //     },
    // });

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
                link: config?.disableFormatting.links ? false : {
                    linkOnPaste: false,
                    openOnClick: false,
                    HTMLAttributes: {
                        class: 'wysiwyglink',
                    },
                },
                suggestions: {
                    mention: useChannelMentions ? {
                        teamId,
                        channelId,
                        useSpecialMentions,
                        useGroupMentions: useLDAPGroupMentions || useCustomGroupMentions,
                    } : false,
                    channel: {teamId},
                    emoji: {useCustomEmojis},
                    command: {
                        teamId,
                        channelId,
                        rootId,
                    },
                },
                keyHandling: {
                    submitAction: onSubmit,
                    ctrlSend,
                    codeBlockOnCtrlEnter,
                    additionalHandlers: config?.additionalKeyHandlers,
                },
            }),
        ],
        content: draft?.content,
        autofocus: 'end',
        onUpdate: ({editor}) => {
            debouncedDraft.current?.(editor);

            // call the onChange function from the parent component (if any available)
            onChange?.(htmlToMarkdown(editor.getHTML()));

            /* eslint-disable */
            console.group('##### Output to be stored in drafts or for submission');
            console.log('##### HTML', htmlToMarkdown(editor.getHTML()));
            console.log('##### parsed Markdown', htmlToMarkdown(editor.getHTML()));
            console.groupEnd();
            /* eslint-enable */
        },
    }, [channelId, rootId, ctrlSend, codeBlockOnCtrlEnter]);

    // focus the editor on mount
    useEffect(() => {
        editor?.commands.focus();
    }, [editor]);

    // store the current value as draft when the editor gets destroyed
    useEffect(() => {
        if (!editor) {
            return () => {};
        }

        const storeDraft = () => debouncedDraft.current?.flush();

        editor.on('destroy', storeDraft);
        return () => editor.off('destroy', storeDraft);
    }, [editor, setDraftContent]);

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
        additionalControls,
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
