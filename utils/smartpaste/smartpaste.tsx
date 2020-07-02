// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import TurndownService from 'turndown';
import {gfm} from 'turndown-plugin-gfm';
import detectLang from 'lang-detector';

import {
    splitMessageBasedOnCaretPosition,
} from 'utils/post_utils.jsx';

import {getTable, formatMarkdownTableMessage, formatGithubCodePaste, isGitHubCodeBlock} from './tables';

const turndownService = new TurndownService();
turndownService.use(gfm);

type SmartPasteOptions = {
    html: boolean;
    code: boolean;
    tables: boolean;
}

export default function smartPaste(clipboard: DataTransfer, message: string, currentCaretPosition: number, options: SmartPasteOptions): {message: string; caretPosition: number} {
    const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(currentCaretPosition, message);

    const html = clipboard.getData('text/html');
    let formattedMessage = '';

    const text = clipboard.getData('text/plain');
    if (options.code && !html) {
        formattedMessage = codeDetectionFormatter(text);
    }

    if (!formattedMessage && options.tables && !options.html) {
        formattedMessage = githubTableFormatter(clipboard, message, currentCaretPosition);
    }

    if (!formattedMessage && options.tables) {
        formattedMessage = tableFormatter(clipboard, message, currentCaretPosition);
    }

    if (!formattedMessage && options.html) {
        formattedMessage = htmlToMarkdown(html);
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

function githubTableFormatter(clipboard: DataTransfer, message: string, currentCaretPosition: number): string {
    const table = getTable(clipboard);
    if (table === null) {
        return '';
    }
    if (isGitHubCodeBlock(table.className)) {
        const {formattedCodeBlock} = formatGithubCodePaste(currentCaretPosition, message, clipboard);
        return formattedCodeBlock;
    }
    return '';
}

function tableFormatter(clipboard: DataTransfer, message: string, currentCaretPosition: number): string {
    const table = getTable(clipboard);
    if (table === null) {
        return '';
    }
    return formatMarkdownTableMessage(table, message.trim(), currentCaretPosition);
}

function htmlToMarkdown(html: string): string {
    if (!html) {
        return '';
    }
    return turndownService.turndown(html);
}
