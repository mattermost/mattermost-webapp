// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Heading} from '@tiptap/extension-heading';
import {nodePasteRule} from '@tiptap/react';

const headingRegex = /^(#{1,6})\s(.*)$/;

const CustomExtensionHeading = Heading.extend({
    addPasteRules() {
        return [
            nodePasteRule({
                find: new RegExp(headingRegex, 'gm'),
                type: this.type,
                getAttributes: (match) => {
                    console.log('##### match', match);
                    return {
                        level: match[1].length,
                    };
                },
            }),
        ];
    },
});

export default CustomExtensionHeading;
