// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function parseTable(html) {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el.querySelector('table');
}

export function getTable(clipboardData) {
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

function columnText(column) {
    const noBreakSpace = '\u00A0';
    const text = column.textContent.trim().replace(/\|/g, '\\|').replace(/\n/g, ' ');
    return text || noBreakSpace;
}

function tableHeaders(row) {
    return Array.from(row.querySelectorAll('td, th')).map(columnText);
}

export function formatMarkdownTableMessage(table, message) {
    const rows = Array.from(table.querySelectorAll('tr'));

    const headers = tableHeaders(rows.shift());
    const spacers = headers.map(() => '---');
    const header = `|${headers.join(' | ')}|\n|${spacers.join(' | ')}|\n`;

    const body = rows.map((row) => {
        return `|${Array.from(row.querySelectorAll('td')).map(columnText).join(' | ')}|`;
    }).join('\n');

    const formattedTable = `${header}${body}\n`;

    return message ? `${message}\n\n${formattedTable}` : formattedTable;
}
