// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useRef} from 'react';
import type {FormEvent} from 'react';
import styled from 'styled-components';
import {useDispatch, useSelector} from 'react-redux';
import {debounce} from 'lodash';
import type {DebouncedFunc} from 'lodash';
import {ResolvedPos} from 'prosemirror-model';
import {EditorView} from 'prosemirror-view';

import {
    EditorContent,
    useEditor,
    ReactNodeViewRenderer as renderReactNodeView,
} from '@tiptap/react';
import type {JSONContent} from '@tiptap/react';
import {Extension} from '@tiptap/core';
import type {Editor} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import {Plugin, PluginKey} from 'prosemirror-state';

import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Code from '@tiptap/extension-code';

// tiptap table extensions
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';

// load all highlight.js languages
import {lowlight} from 'lowlight';

import {ActionTypes} from 'utils/constants';

import type {GlobalState} from 'types/store';
import type {NewPostDraft} from 'types/store/draft';

import {htmlToMarkdown, markdownToHtml} from './utils/toMarkdown';

import Toolbar from './toolbar';
import SendButton from './components/send-button';
import CodeBlockComponent from './components/codeblockview';
import {UserSuggestions, ChannelSuggestions, EmojiSuggestions} from './components/suggestions';

const WysiwygContainer = styled.div`
    margin: 0 24px 24px;
    border: 2px solid rgba(var(--center-channel-color-rgb), 0.32);
    border-radius: 4px;
`;

const EditorContainer = styled.div`
    display: block;
    align-items: center;
    padding: 8px;

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

export const PasteHandler = Extension.create({
    name: 'pasteHandler',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('pasteHandler'),
                props: {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    clipboardTextParser(text: string, $context: ResolvedPos, plain: boolean, view: EditorView) {
                        console.log('#### pasted text', text); // eslint-disable-line no-console
                        console.log('#### $context', $context); // eslint-disable-line no-console
                        console.log('#### plain', plain); // eslint-disable-line no-console
                        console.log('#### view', view); // eslint-disable-line no-console
                    },
                    transformPastedText(text: string) {
                        return String(markdownToHtml(text));
                    },

                    // … and many, many more.
                    // Here is the full list: https://prosemirror.net/docs/ref/#view.EditorProps
                },
            }),
        ];
    },
});

type Props = {
    channelId: string;
    rootId?: string;
    onSubmit: (e?: FormEvent) => void;
    onChange?: (markdownText: string) => void;
    readOnly?: boolean;
}

export default ({channelId, rootId, onSubmit, onChange, readOnly}: Props) => {
    const [draft, setDraftContent] = useDraft(channelId, rootId);
    const debouncedDraft = useRef<DebouncedFunc<(editor: Editor) => void>>(debounce((editor) => setDraftContent(editor.getJSON()), 500));

    const editor = useEditor({
        extensions: [
            StarterKit,
            Typography,
            Code,
            Table.configure({
                allowTableNodeSelection: true,
            }).extend({
                renderHTML({node}) {
                    // this might be the right place to force a header row if it is not present
                    // atlassian has a library with ProseMirror utils that might be of help here: https://github.com/atlassian/prosemirror-utils
                    console.log('#### node of the inserted table', node); // eslint-disable-line no-console

                    return ['table', {class: 'markdown__table'}, ['tbody', 0]];
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({
                linkOnPaste: true,
                openOnClick: false,
            }).extend({

                // when at the end of the input value this will allow the mark to be exited by pressing ArrowRight key
                exitable: true,
            }),
            CodeBlockLowlight.
                extend({
                    addNodeView() {
                        return renderReactNodeView(CodeBlockComponent);
                    },
                    addKeyboardShortcuts() {
                        return {

                            // exit node on arrow up
                            ArrowUp: (...params) => {
                                /**
                                 * This is where we should add the logic to add a new paragraph node before the
                                 * codeBlock, when we are in the first position of the selection as described in the
                                 * design document for the editor
                                 * @see https://www.figma.com/file/lMtUxkdoBSWZH1s9Z2wiwE/MM-46955-WYSIWYG-Editor%3A-Mattercon-Contribute?node-id=1387%3A132682
                                 *
                                 * Maybe we can copy some code that is in the other keaboardshortcut to exit the
                                 * codeBlock when in last position and onArrowDown
                                 * @see https://github.com/ueberdosis/tiptap/blob/6b0401c783f5d380a7e5106f166af56da74dbe59/packages/extension-code-block/src/code-block.ts#L178
                                 */
                                // eslint-disable-next-line no-console
                                console.log('#### params', params);
                                return false;
                            },
                        };
                    },
                }).
                configure({
                    lowlight,
                    defaultLanguage: 'css',
                }),
            PasteHandler,
            UserSuggestions,
            ChannelSuggestions,
            EmojiSuggestions,
        ],
        content: draft?.content,
        autofocus: 'end',
        onUpdate: ({editor}) => {
            debouncedDraft.current?.(editor);

            // call the onChange function from the parent component (if any available)
            onChange?.(htmlToMarkdown(editor.getHTML()));
        },
    }, [channelId, rootId]);

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

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSubmit();
        editor.commands.clearContent(true);
    };

    const disableSendButton = editor.isEmpty;
    const sendButton = readOnly ? null : (
        <SendButton
            disabled={disableSendButton}
            handleSubmit={handleSubmit}
        />
    );

    return (
        <WysiwygContainer>
            <EditorContainer>
                <EditorContent editor={editor}/>
            </EditorContainer>
            <Toolbar
                editor={editor}
                rightControls={sendButton}
            />
        </WysiwygContainer>
    );
};
