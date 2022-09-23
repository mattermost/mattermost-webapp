// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import StarterKit from '@tiptap/starter-kit';
import {EditorContent, useEditor} from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import styled from 'styled-components';

import {Locations} from 'utils/constants';

import Toolbar from './toolbar';

const WysiwygContainer = styled.div`
    margin: 0 24px 12px;
    border: 2px solid rgba(var(--center-channel-color-rgb), 0.32);
    border-radius: 4px;
`;

const EditorContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 8px;
`;

export default () => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Highlight,
            Link.configure({
                linkOnPaste: true,
                openOnClick: false,
            }),
        ],
        content: '',
    });

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
