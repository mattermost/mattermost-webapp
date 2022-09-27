// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import StarterKit from '@tiptap/starter-kit';
import {EditorContent, JSONContent, useEditor} from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import styled from 'styled-components';

import {ActionTypes, Locations} from 'utils/constants';

import {GlobalState} from 'types/store';
import {NewPostDraft} from 'types/store/draft';

import Toolbar from './toolbar';

const WysiwygContainer = styled.div`
    margin: 0 24px 12px;
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

            // JSONContent or some of its children aren't plain JS objects, so they can't be serialized automatically.
            // TODO figure out how to persist them properly since serializing and deserializing them feels hacky or
            // perhaps serialize their generated Markdown.
            content: JSON.parse(JSON.stringify(newContent)),
        });
    }, [dispatch, channelId, rootId]);

    return {draft, setDraftContent};
}

type Props = {
    channelId: string;
    rootId?: string;
}

export default (props: Props) => {
    const {draft, setDraftContent} = useDraft(props.channelId, props.rootId);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Highlight,
            Link.configure({
                linkOnPaste: true,
                openOnClick: false,
            }),
        ],
        content: draft?.content,
        onUpdate: ({editor}) => {
            // Save draft while typing
            // TODO throttle this
            setDraftContent(editor.getJSON());
        },
    }, [props.channelId, props.rootId]);

    useEffect(() => {
        editor?.chain().focus();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <WysiwygContainer>
            <EditorContainer>
                <EditorContent editor={editor}/>
            </EditorContainer>
            <Toolbar
                editor={editor}
                location={Locations.CENTER}
            />
        </WysiwygContainer>
    );
};
