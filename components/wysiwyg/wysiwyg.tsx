// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import StarterKit from '@tiptap/starter-kit';
import {EditorContent, useEditor} from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';

import Toolbar from './toolbar';

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
        <>
            <EditorContent editor={editor}/>
            <Toolbar editor={editor}/>
        </>
    );
};
