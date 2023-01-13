// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {textblockTypeInputRule} from '@tiptap/core';
import {CodeBlockLowlight, CodeBlockLowlightOptions} from '@tiptap/extension-code-block-lowlight';
import {ReactNodeViewRenderer as renderReactNodeView} from '@tiptap/react';
import {lowlight} from 'lowlight';

import CodeBlockComponent from './codeblock.component';

export const backtickInputRegex = /^```([a-z]+)?[\s\n]$/;
export const tildeInputRegex = /^~~~([a-z]+)?[\s\n]$/;

const Codeblock =
    CodeBlockLowlight.
        extend({
            addNodeView() {
                return renderReactNodeView(CodeBlockComponent);
            },
            addKeyboardShortcuts() {
                return {
                    ...this.parent?.(),

                    // exit node on arrow up
                    ArrowUp: () => {
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
                        return false;
                    },
                };
            },

            addInputRules() {
                return [
                    textblockTypeInputRule({
                        find: backtickInputRegex,
                        type: this.type,
                        getAttributes: (match) => ({
                            language: lowlight.registered(match[1]) ? match[1] : 'plaintext',
                        }),
                    }),
                    textblockTypeInputRule({
                        find: tildeInputRegex,
                        type: this.type,
                        getAttributes: (match) => ({
                            language: lowlight.registered(match[1]) ? match[1] : 'plaintext',
                        }),
                    }),
                ];
            },
        });

export type {CodeBlockLowlightOptions};
export {Codeblock};
