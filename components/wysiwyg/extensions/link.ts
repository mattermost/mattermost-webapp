// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Link as TiptapLink} from '@tiptap/extension-link';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        mmLink: {

            /**
             * Set a link mark
             */
            setLink: (attributes: {
                href: string;
                target?: string | null;
            }) => ReturnType;

            /**
             * Toggle a link mark
             */
            toggleLink: (attributes: {
                href: string;
                target?: string | null;
            }) => ReturnType;

            /**
             * Unset a link mark
             */
            unsetLink: () => ReturnType;

            /**
             * Toggle the link overlay
             */
            toggleLinkOverlay: () => ReturnType;
        };

    }
}

export const Link = TiptapLink.extend({

    name: 'mmLink',

    addStorage() {
        return {
            showOverlay: false,
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-Alt-k': ({editor}) => {
                return editor.chain().extendMarkRange('mmLink').toggleLinkOverlay().run();
            },
        };
    },

    addCommands() {
        return {
            ...this.parent?.(),
            toggleLinkOverlay: () => ({editor}) => {
                editor.storage.mmLink.showOverlay = !editor.storage.mmLink.showOverlay;
                return true;
            },
        };
    },
});
