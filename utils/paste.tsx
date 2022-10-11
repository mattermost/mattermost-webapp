// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import TurndownService from 'turndown';
import {tables} from 'turndown-plugin-gfm';

import {splitMessageBasedOnCaretPosition, splitMessageBasedOnTextSelection} from 'utils/post_utils';

type FormatCodeOptions = {
    message: string;
    clipboardData: DataTransfer;
    selectionStart: number | null;
    selectionEnd: number | null;
};

export function parseTable(html: string): HTMLTableElement | null {
    return new DOMParser().parseFromString(html, 'text/html').querySelector('table');
}

export function getTable(clipboardData: DataTransfer): HTMLTableElement | null {
    if (Array.from(clipboardData.types).indexOf('text/html') === -1) {
        return null;
    }

    const html = clipboardData.getData('text/html');

    if (!(/<table/i).test(html)) {
        return null;
    }

    const table = parseTable(html);
    if (!table) {
        return null;
    }

    return table;
}

export function hasHtmlLink(clipboardData: DataTransfer): boolean {
    return Array.from(clipboardData.types).includes('text/html') && (/<a/i).test(clipboardData.getData('text/html'));
}

export function getPlainText(clipboardData: DataTransfer): string | boolean {
    if (Array.from(clipboardData.types).indexOf('text/plain') === -1) {
        return false;
    }

    const plainText = clipboardData.getData('text/plain');

    return plainText;
}

export function isGitHubCodeBlock(tableClassName: string): boolean {
    const result = (/\b(js|blob|diff)-./).test(tableClassName);
    return result;
}

function columnText(column: Element): string {
    const noBreakSpace = '\u00A0';
    const text = column.textContent == null ?
        noBreakSpace : column.textContent.trim().replace(/\|/g, '\\|').replace(/\n/g, ' ');
    return text;
}

function tableHeaders(row: HTMLTableRowElement): string[] {
    return Array.from(row.querySelectorAll('td, th')).map(columnText);
}

function isHeaderlessTable(table: HTMLTableElement): boolean {
    return table.querySelectorAll('th').length === 0;
}

function formatMarkdownTable(table: HTMLTableElement): string {
    const rows = Array.from(table.querySelectorAll('tr'));

    const headerRow = rows.shift();
    const headers = headerRow ? tableHeaders(headerRow) : [];
    const spacers = headers.map(() => '---');
    const header = `|${headers.join(' | ')}|\n|${spacers.join(' | ')}|\n`;

    const body = rows.map((row) => {
        return `|${Array.from(row.querySelectorAll('td')).map(columnText).join(' | ')}|`;
    }).join('\n');

    return `${header}${body}\n`;
}

export function formatMarkdownMessage(clipboardData: DataTransfer, message?: string, caretPosition?: number): string {
    const html = clipboardData.getData('text/html');

    //TODO@michel: Instantiate turndown service in a central file instead
    const service = new TurndownService({emDelimiter: '*'});
    service.use(tables);
    let markdownFormattedMessage = service.turndown(html);

    const table = getTable(clipboardData);

    // need to do this as turndown plugin doesn't support headerless tables
    if (table && isHeaderlessTable(table)) {
        markdownFormattedMessage = formatMarkdownTable(table);
    }

    if (!message) {
        return markdownFormattedMessage;
    }
    if (typeof caretPosition === 'undefined') {
        return `${message}\n\n${markdownFormattedMessage}`;
    }
    const newMessage = [message.slice(0, caretPosition), markdownFormattedMessage, message.slice(caretPosition)];
    return newMessage.join('\n');
}

export function formatGithubCodePaste({message, clipboardData, selectionStart, selectionEnd}: FormatCodeOptions): {formattedMessage: string; formattedCodeBlock: string} {
    const textSelected = selectionStart !== selectionEnd;
    const {firstPiece, lastPiece} = textSelected ?
        splitMessageBasedOnTextSelection(selectionStart ?? message.length, selectionEnd ?? message.length, message) :
        splitMessageBasedOnCaretPosition(selectionStart ?? message.length, message);

    // Add new lines if content exists before or after the cursor.
    const requireStartLF = firstPiece === '' ? '' : '\n';
    const requireEndLF = lastPiece === '' ? '' : '\n';
    const formattedCodeBlock = requireStartLF + '```\n' + getPlainText(clipboardData) + '\n```' + requireEndLF;
    const formattedMessage = `${firstPiece}${formattedCodeBlock}${lastPiece}`;

    return {formattedMessage, formattedCodeBlock};
}
