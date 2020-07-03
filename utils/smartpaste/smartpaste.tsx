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

const turndownService = new TurndownService().remove('style');
turndownService.use(strikethrough);
turndownService.use(taskListItems);

type SmartPasteOptions = {
    html: boolean;
    code: boolean;
}

export default function smartPaste(clipboard: DataTransfer, message: string, currentCaretPosition: number, options: SmartPasteOptions): {message: string; caretPosition: number} {
    const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(currentCaretPosition, message);

    const html = clipboard.getData('text/html');
    const text = clipboard.getData('text/plain');

    let formattedMessage = '';
    if (options.code && !html) {
        formattedMessage = codeDetectionFormatter(text);
    }

    if (!formattedMessage && options.html) {
        turndownService.addRule('github-code', githubCodeTurndownRuleBuilder(firstPiece.length > 0, lastPiece.length > 0, text));
        turndownService.addRule('table', tableTurndownRuleBuilder(firstPiece.length > 0, lastPiece.length > 0));
        formattedMessage = htmlToMarkdown(html);
        formattedMessage = formattedMessage.replace(/#\*#\*NEW_LINE_REPLACEMENT\*#\*#/g, '\n');
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

function htmlToMarkdown(html: string): string {
    if (!html) {
        return '';
    }
    return turndownService.turndown(html);
}
