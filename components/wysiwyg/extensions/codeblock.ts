// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {CodeBlockLowlight, CodeBlockLowlightOptions} from '@tiptap/extension-code-block-lowlight';
import {ReactNodeViewRenderer as renderReactNodeView} from '@tiptap/react';

import CodeBlockComponent from './codeblock.component';

const Codeblock =
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
        });

export type {CodeBlockLowlightOptions};
export {Codeblock};
