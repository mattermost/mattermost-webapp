// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Extension} from '@tiptap/core';
import {nodePasteRule} from '@tiptap/react';
import {Blockquote, BlockquoteOptions} from '@tiptap/extension-blockquote';
import {Bold, BoldOptions} from '@tiptap/extension-bold';
import {BulletList, BulletListOptions} from '@tiptap/extension-bullet-list';
import {Code, CodeOptions} from '@tiptap/extension-code';
import {Document} from '@tiptap/extension-document';
import {Dropcursor, DropcursorOptions} from '@tiptap/extension-dropcursor';
import {Gapcursor} from '@tiptap/extension-gapcursor';
import {HardBreak, HardBreakOptions} from '@tiptap/extension-hard-break';
import {Heading, HeadingOptions} from '@tiptap/extension-heading';
import {History, HistoryOptions} from '@tiptap/extension-history';
import {HorizontalRule, HorizontalRuleOptions} from '@tiptap/extension-horizontal-rule';
import {Image, ImageOptions, inputRegex as imageInputRegex} from '@tiptap/extension-image';
import {Italic, ItalicOptions} from '@tiptap/extension-italic';
import {Link, LinkOptions} from '@tiptap/extension-link';
import {ListItem, ListItemOptions} from '@tiptap/extension-list-item';
import {OrderedList, OrderedListOptions} from '@tiptap/extension-ordered-list';
import {Paragraph, ParagraphOptions} from '@tiptap/extension-paragraph';
import {Strike, StrikeOptions} from '@tiptap/extension-strike';
import {Text} from '@tiptap/extension-text';
import {Typography, TypographyOptions} from '@tiptap/extension-typography';
import {Placeholder, PlaceholderOptions} from '@tiptap/extension-placeholder';

import {PluginKey} from 'prosemirror-state';

// load all highlight.js languages
import {lowlight} from 'lowlight';

import {Formatters, WysiwygConfig} from '../wysiwyg';

import {Codeblock, CodeBlockLowlightOptions} from './codeblock/codeblock';
import {Table, TableOptions} from './table/table';

import {
    AtMentionSuggestions,
    AtMentionSuggestionKey,
    AtMentionSuggestionOptions,
    makeAtMentionSuggestion,
    ChannelSuggestions,
    ChannelSuggestionKey,
    ChannelSuggestionOptions,
    makeChannelSuggestion,
    EmojiSuggestions,
    EmojiSuggestionKey,
    EmojiSuggestionOptions,
    makeEmojiSuggestion,
    CommandSuggestions,
    CommandSuggestionKey,
    CommandSuggestionOptions,
    makeCommandSuggestion,
} from './suggestions';

import {KeyHandler, KeyhandlerOptions} from './keyhandler/keyhandler';

const suggestionKeys: PluginKey[] = [];

export type SuggestionConfig = {
    mention?: AtMentionSuggestionOptions | false;
    channel?: ChannelSuggestionOptions | false;
    emoji?: EmojiSuggestionOptions | false;
    command?: CommandSuggestionOptions | false;
};

export interface ExtensionOptions {
    blockquote: Partial<BlockquoteOptions> | false;
    bold: Partial<BoldOptions> | false;
    bulletList: Partial<BulletListOptions> | false;
    code: Partial<CodeOptions> | false;
    document: false;
    dropcursor: Partial<DropcursorOptions> | false;
    gapcursor: false;
    hardBreak: Partial<HardBreakOptions> | false;
    heading: Partial<HeadingOptions> | false;
    history: Partial<HistoryOptions> | false;
    horizontalRule: Partial<HorizontalRuleOptions> | false;
    italic: Partial<ItalicOptions> | false;
    listItem: Partial<ListItemOptions> | false;
    orderedList: Partial<OrderedListOptions> | false;
    paragraph: Partial<ParagraphOptions> | false;
    strike: Partial<StrikeOptions> | false;
    text: false;
    typography: Partial<TypographyOptions> | false;
    placeholder: Partial<PlaceholderOptions> | false;
    link: Partial<LinkOptions> | false;
    codeBlock: Partial<CodeBlockLowlightOptions> | false;
    table: Partial<TableOptions> | false;
    suggestions?: SuggestionConfig;
    keyHandling?: KeyhandlerOptions | false;
    image?: Partial<ImageOptions> | false;
    config?: WysiwygConfig;
}

export const Extensions = Extension.create<ExtensionOptions>({
    name: 'core',

    addStorage() {
        return {
            disableFormatting: this.options?.config?.disableFormatting || [],
        };
    },

    addExtensions() {
        const extensions = [];
        const disableFormatting = this.options?.config?.disableFormatting || [];

        if (this.options.document !== false) {
            extensions.push(Document.configure(this.options?.document));
        }

        if (this.options.blockquote !== false) {
            extensions.push(Blockquote.configure(this.options?.blockquote));
        }

        if (this.options.bold !== false) {
            extensions.push(Bold.configure(this.options?.bold));
        }

        if (this.options.bulletList !== false) {
            extensions.push(BulletList.configure(this.options?.bulletList));
        }

        if (this.options.code !== false) {
            extensions.push(Code.configure(this.options?.code));
        }

        if (this.options.dropcursor !== false) {
            extensions.push(Dropcursor.configure(this.options?.dropcursor));
        }

        if (this.options.gapcursor !== false) {
            extensions.push(Gapcursor.configure(this.options?.gapcursor));
        }

        if (this.options.hardBreak !== false) {
            extensions.push(HardBreak.configure(this.options?.hardBreak));
        }

        if (this.options.heading !== false) {
            extensions.push(Heading.configure(this.options?.heading));
        }

        if (this.options.history !== false) {
            extensions.push(History.configure(this.options?.history));
        }

        if (this.options.horizontalRule !== false) {
            extensions.push(HorizontalRule.configure(this.options?.horizontalRule));
        }

        if (this.options.italic !== false) {
            extensions.push(Italic.configure(this.options?.italic));
        }

        if (this.options.listItem !== false) {
            extensions.push(ListItem.configure(this.options?.listItem));
        }

        if (this.options.orderedList !== false) {
            extensions.push(OrderedList.configure(this.options?.orderedList));
        }

        if (this.options.paragraph !== false) {
            extensions.push(Paragraph.configure(this.options?.paragraph));
        }

        if (this.options.strike !== false) {
            extensions.push(Strike.configure(this.options?.strike));
        }

        if (this.options.text !== false) {
            extensions.push(Text.configure(this.options?.text));
        }

        if (this.options.typography !== false) {
            extensions.push(Typography.configure(this.options?.typography));
        }

        if (this.options.placeholder !== false) {
            extensions.push(Placeholder.configure(this.options?.placeholder));
        }

        if (!disableFormatting.includes(Formatters.codeBlock) && this.options.codeBlock !== false) {
            // adds lowlight as the default highlighter
            extensions.push(Codeblock.configure({
                lowlight,
                ...this.options?.codeBlock,
            }));
        }

        if (!disableFormatting.includes(Formatters.link) && this.options.link !== false) {
            extensions.push(Link.configure(this.options.link).extend({

                // when at the end of the input value this will allow the mark to be exited by pressing ArrowRight key
                exitable: true,
            }));
        }

        if (!disableFormatting.includes(Formatters.table) && this.options.table !== false) {
            extensions.push(Table.configure(this.options?.table));
        }

        if (this.options.suggestions?.mention) {
            extensions.push(AtMentionSuggestions.configure({suggestion: makeAtMentionSuggestion(this.options.suggestions.mention)}));
            suggestionKeys.push(AtMentionSuggestionKey);
        }

        if (this.options.suggestions?.channel) {
            extensions.push(ChannelSuggestions.configure({suggestion: makeChannelSuggestion(this.options.suggestions.channel)}));
            suggestionKeys.push(ChannelSuggestionKey);
        }

        if (this.options.suggestions?.emoji) {
            extensions.push(EmojiSuggestions.configure({suggestion: makeEmojiSuggestion(this.options.suggestions.emoji)}));
            suggestionKeys.push(EmojiSuggestionKey);
        }

        if (this.options.suggestions?.command) {
            extensions.push(CommandSuggestions.configure({suggestion: makeCommandSuggestion(this.options.suggestions.command)}));
            suggestionKeys.push(CommandSuggestionKey);
        }

        if (this.options.keyHandling) {
            extensions.push(KeyHandler.configure({
                ...this.options.keyHandling,
                suggestionKeys,
            }));
        }

        if (!disableFormatting.includes(Formatters.image) && this.options.image !== false) {
            extensions.push(Image.extend({
                addPasteRules() {
                    return [
                        nodePasteRule({
                            find: new RegExp(imageInputRegex, 'g'),
                            type: this.type,
                            getAttributes: (match) => {
                                const [, , alt, src, title] = match;

                                console.log('#### match form paste', match); // eslint-disable-line no-console

                                return {src, alt, title};
                            },
                        }),
                    ];
                },
            }).configure(this.options.image));
        }

        return extensions;
    },
});
