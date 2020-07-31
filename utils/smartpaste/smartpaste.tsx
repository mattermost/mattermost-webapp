// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import TurndownService from 'turndown';
import {strikethrough, taskListItems} from 'turndown-plugin-gfm';
import detectLang from 'lang-detector';

import {
    splitMessageBasedOnCaretPosition,
} from 'utils/post_utils.jsx';

import {tableTurndownRuleBuilder} from './tables';
import {githubCodeTurndownRuleBuilder} from './githubcode';
import {channelMentionsRule, hashtagsRule, filePreviewButtonRule, codeBlockRule} from './mattermost';
import {fixNestedLists} from './htmlfix';
import {NEW_LINE_REPLACEMENT} from './constants';

const turndownService = new TurndownService({codeBlockStyle: 'fenced'}).remove('style');
turndownService.use(strikethrough);
turndownService.use(taskListItems);
turndownService.addRule('channel-mentions', channelMentionsRule);
turndownService.addRule('hashtags', hashtagsRule);
turndownService.addRule('file-preview-button', filePreviewButtonRule);
turndownService.addRule('mattermost-code-block', codeBlockRule);

export default function smartPaste(clipboard: DataTransfer, message: string, currentCaretPosition: number): {message: string; caretPosition: number} {
    const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(currentCaretPosition, message);

    const html = clipboard.getData('text/html');
    const text = clipboard.getData('text/plain');

    let formattedMessage = '';
    if (!html) {
        formattedMessage = codeDetectionFormatter(text);
    }

    if (!formattedMessage && html) {
        turndownService.addRule('github-code', githubCodeTurndownRuleBuilder(firstPiece.length > 0, lastPiece.length > 0, text));
        turndownService.addRule('table', tableTurndownRuleBuilder(firstPiece.length > 0, lastPiece.length > 0));

        let doc = stringToHTML(html);
        doc = fixNestedLists(doc);

        formattedMessage = htmlToMarkdown(doc);

        // Because turndown swallows some new lines around rule execution
        // results we need to provide a way to enforce the new lines, and this
        // is how we do it.
        formattedMessage = formattedMessage.replace(new RegExp(NEW_LINE_REPLACEMENT, 'g'), '\n');
    }

    if (!formattedMessage) {
        formattedMessage = text;
    }

    const newMessage = `${firstPiece}${formattedMessage}${lastPiece}`;
    const newCaretPosition = currentCaretPosition + formattedMessage.length;
    return {
        message: newMessage,
        caretPosition: newCaretPosition,
    };
}

function codeDetectionFormatter(text: string): string {
    const lang = detectLang(text, {statistics: true});
    if (lang.detected !== 'Unknown' && (lang.statistics.Unknown / text.length) < (lang.statistics[lang.detected] / (4 * text.length))) {
        return '```' + lang.detected.toLowerCase() + '\n' + text + '\n```';
    }
    return '';
}

function htmlToMarkdown(doc: Document): string {
    return turndownService.turndown(doc);
}

export function stringToHTML(html: string): Document {
    const doc = document.implementation.createHTMLDocument('');
    doc.open();
    doc.write('<x-turndown id="turndown-root">' + html + '</x-turndown>');
    doc.close();
    return doc;
}

