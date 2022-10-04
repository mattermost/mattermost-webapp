// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FormEvent, useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';
import {debounce} from 'lodash';
import type {DebouncedFunc} from 'lodash';

import {Editor} from '@tiptap/core';
import {
    EditorContent,
    JSONContent,
    useEditor,
    ReactNodeViewRenderer as renderReactNodeView,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Code from '@tiptap/extension-code';

import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';

// load all highlight.js languages
import {lowlight} from 'lowlight';

import {ActionTypes, Locations} from 'utils/constants';

import {GlobalState} from 'types/store';
import {NewPostDraft} from 'types/store/draft';

import SendButton from '../advanced_text_editor/send_button/send_button';

import Toolbar from './toolbar';
import {htmlToMarkdown} from './utils/turndown';

import CodeBlockComponent from './components/codeblockview';

const WysiwygContainer = styled.div`
    margin: 0 24px 24px;
    border: 2px solid rgba(var(--center-channel-color-rgb), 0.32);
    border-radius: 4px;
`;

const EditorContainer = styled.div`
    display: block;
    align-items: center;
    padding: 8px;
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
            Highlight,
            Typography,
            Code,
            Table,
            TableCell,
            TableHeader,
            TableRow,
            Link.configure({
                linkOnPaste: true,
                openOnClick: false,
            }),
            CodeBlockLowlight.
                extend({
                    addNodeView() {
                        return renderReactNodeView(CodeBlockComponent);
                    },
                    addKeyboardShortcuts() {
                        return {

                            // exit node on arrow down
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
        editor?.chain().focus();
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
                location={Locations.CENTER}
                rightControls={sendButton}
            />
        </WysiwygContainer>
    );
};
