// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Table as TableExtension, TableOptions} from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';

const Table =
    TableExtension.extend({
        renderHTML({node}) {
            // this might be the right place to force a header row if it is not present
            // atlassian has a library with ProseMirror utils that might be of help here: https://github.com/atlassian/prosemirror-utils
            console.log('#### node of the inserted table', node); // eslint-disable-line no-console

            return ['table', {class: 'markdown__table'}, ['tbody', 0]];
        },
        addExtensions() {
            return [
                TableCell,
                TableHeader,
                TableRow,
            ];
        },
    });

export {Table};
export type {TableOptions};
