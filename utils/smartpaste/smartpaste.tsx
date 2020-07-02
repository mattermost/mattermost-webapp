// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import TurndownService from 'turndown';
import {gfm} from 'turndown-plugin-gfm';
import detectLang from 'lang-detector';

import {
    splitMessageBasedOnCaretPosition,
} from 'utils/post_utils.jsx';

import {getTable, formatMarkdownTableMessage, isGitHubCodeBlock} from './tables';

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
    const text = clipboard.getData('text/plain');

    let formattedMessage = '';
    if (options.code && !html) {
        formattedMessage = codeDetectionFormatter(text);
    }

    if (!formattedMessage && options.tables && !options.html) {
        formattedMessage = githubCodeBlockFormatter(html, text);
        if (formattedMessage) {
            const requireStartLF = firstPiece === '' ? '' : '\n';
            const requireEndLF = lastPiece === '' ? '' : '\n';
            const formattedCodeBlock = requireStartLF + '```\n' + formattedMessage + '\n```' + requireEndLF;
            const newMessage = `${firstPiece}${formattedCodeBlock}${lastPiece}`;
            return {message: newMessage, caretPosition: currentCaretPosition + formattedCodeBlock.length};
        }
    }

    if (!formattedMessage && options.tables && !options.html) {
        formattedMessage = tableFormatter(html);
        if (formattedMessage) {
            if (!message) {
                return {message: formattedMessage, caretPosition: formattedMessage.length};
            }
            if (typeof currentCaretPosition === 'undefined') {
                const newMessage = `${message}\n\n${formattedMessage}`;
                return {message: newMessage, caretPosition: newMessage.length};
            }
            const newMessage = [firstPiece, formattedMessage, lastPiece];
            return {message: newMessage.join('\n'), caretPosition: currentCaretPosition + formattedMessage.length};
        }
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

export function githubCodeBlockFormatter(html: string, text: string): string {
    if (!html) {
        return '';
    }
    const table = getTable(html);
    if (table === null) {
        return '';
    }
    if (isGitHubCodeBlock(table.className)) {
        return text;
    }
    return '';
}

function tableFormatter(html: string): string {
    if (!html) {
        return '';
    }
    const table = getTable(html);
    if (table === null) {
        return '';
    }
    return formatMarkdownTableMessage(table);
}

function htmlToMarkdown(html: string): string {
    if (!html) {
        return '';
    }
    return turndownService.turndown(html);
}
