// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function parseTable(html: string): HTMLTableElement | null {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el.querySelector('table');
}

export function getTable(clipboardData: DataTransfer): HTMLTableElement | boolean {
    if (Array.from(clipboardData.types).indexOf('text/html') === -1) {
        return false;
    }

    const html = clipboardData.getData('text/html');

    if (!(/<table/i).test(html)) {
        return false;
    }

    const table = parseTable(html);
    if (!table) {
        return false;
    }

    return table;
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

export function formatMarkdownTableMessage(table: HTMLTableElement, message?: string): string {
    const rows = Array.from(table.querySelectorAll('tr'));

    const headerRow = rows.shift();
    const headers = headerRow ? tableHeaders(headerRow) : [];
    const spacers = headers.map(() => '---');
    const header = `|${headers.join(' | ')}|\n|${spacers.join(' | ')}|\n`;

    const body = rows.map((row) => {
        return `|${Array.from(row.querySelectorAll('td')).map(columnText).join(' | ')}|`;
    }).join('\n');

    const formattedTable = `${header}${body}\n`;

    return message ? `${message}\n\n${formattedTable}` : formattedTable;
}
