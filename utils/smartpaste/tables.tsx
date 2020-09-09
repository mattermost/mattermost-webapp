// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Rule} from 'turndown';

import {NEW_LINE_REPLACEMENT} from './constants';

function columnText(column: Element): string {
    const noBreakSpace = '\u00A0';
    const text = column.textContent == null ? noBreakSpace : column.textContent.trim().replace(/\|/g, '\\|').replace(/\n/g, ' ');
    return text;
}

function tableHeaders(row: HTMLTableRowElement): string[] {
    return Array.from(row.querySelectorAll('td, th')).map(columnText);
}

export function formatMarkdownTableMessage(table: HTMLTableElement): string {
    const rows = Array.from(table.querySelectorAll('tr'));

    const headerRow = rows.shift();
    const headers = headerRow ? tableHeaders(headerRow) : [];
    const spacers = headers.map(() => '---');
    const header = `|${headers.join(' | ')}|\n|${spacers.join(' | ')}|\n`;

    const body = rows.map((row) => {
        return `|${Array.from(row.querySelectorAll('td')).map(columnText).join(' | ')}|`;
    }).join('\n');

    return `${header}${body}`;
}

export function tableTurndownRuleBuilder(hasFirstPart: boolean, hasLastPart: boolean): Rule {
    return {
        filter: (node: Node): boolean => {
            return node.nodeName === 'TABLE' && !(/\b(js|blob|diff)-./).test((node as HTMLTableElement).className);
        },
        replacement: (content: string, node: Node): string => {
            let result = '';
            if (hasFirstPart) {
                result += NEW_LINE_REPLACEMENT;
            }
            result += formatMarkdownTableMessage(node as HTMLTableElement);
            if (hasLastPart) {
                result += NEW_LINE_REPLACEMENT;
            }
            return result;
        }
    };
}
