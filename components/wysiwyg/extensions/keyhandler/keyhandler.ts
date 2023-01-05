// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Extension} from '@tiptap/core';
import type {KeyboardShortcutCommand} from '@tiptap/core';
import type {PluginKey} from 'prosemirror-state';

export type KeyhandlerOptions = {
    submitAction: () => void;
    ctrlSend?: boolean;
    codeBlockOnCtrlEnter?: boolean;
    additionalHandlers?: Record<string, KeyboardShortcutCommand>;
}

/**
 * The `KeyHandler` Extension is currently handling all (modified) Enter hits.
 * When the event should be handled and be finished with it the function should return `true`.
 * This is because tiptap can chain commands and the way they handle this is: "Run through all chained commands/handlers
 * once the first one returns `true` or we reach the end of the chain"
 */
const KeyHandler =

    /**
     * these should always come at the end so that we are able to override behavior from
     * other extensions with this if needed
     */
    Extension.create({
        name: 'keyboardHandler',

        addKeyboardShortcuts() {
            return {
                Enter: () => {
                    /**
                     * check if we have an active mark that expects a different behavior from hitting Enter
                     */
                    const isCodeBlockActive = this.editor.isActive('codeBlock');
                    const isQuoteActive = this.editor.isActive('blockquote');
                    const isListActive = this.editor.isActive('bulletList') || this.editor.isActive('orderedList');
                    const isTableActive = this.editor.isActive('table');

                    /**
                     * run over all suggestion plugins and check if there is one that is currently in use
                     * (actively showing the overlay or processing a request)
                     */
                    const activeSuggestions = this.options.suggestionKeys.some((suggestion: PluginKey) => suggestion.getState(this.editor.view.state).active);

                    // prevent submitting the message when one of these is active
                    if (isCodeBlockActive || isTableActive || isQuoteActive || isListActive || activeSuggestions || this.options.ctrlSend) {
                        return false;
                    }

                    this.options.submitAction();
                    return this.editor.commands.clearContent(true);
                },

                'Mod-Enter': () => {
                    const isCodeBlockActive = this.editor.isActive('codeBlock');

                    /**
                     * when inside a codeblock and the setting for sending the message with CMD/CTRL-Enter
                     * force calling the `onSubmit` function and clear the editor content
                     */
                    if (isCodeBlockActive && this.options.codeBlockOnCtrlEnter) {
                        this.options.submitAction();
                        return this.editor.commands.clearContent(true);
                    }

                    if (!isCodeBlockActive && this.options.ctrlSend) {
                        this.options.submitAction();
                        return this.editor.commands.clearContent(true);
                    }

                    /**
                     * for some reason the default behavior of tiptap in this case is adding in a soft break (the
                     * same as with pressing `SHIFT-ENTER`). Since we do not support that in posts we cannot allow
                     * that here as well, so we overwrite the dedault behavior like this
                     */
                    return this.editor.commands.first(({commands}) => [
                        () => commands.createParagraphNear(),
                        () => commands.liftEmptyBlock(),
                        () => commands.splitBlock(),
                    ]);
                },

                /**
                 * currently we do not have an option to show a soft line break in the posts, so we overwrite
                 * the behavior from tiptap with the default behavior on pressing enter
                 */
                'Shift-Enter': () => {
                    return this.editor.commands.first(({commands}) => [
                        () => commands.createParagraphNear(),
                        () => commands.liftEmptyBlock(),
                        () => commands.splitBlock(),
                    ]);
                },

                /**
                 * Spread any additional keyhandlers passed into the extension
                 */
                ...this.options.additionalHandlers,
            };
        },
    });

export {KeyHandler};
