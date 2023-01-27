// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {JSONContent} from '@tiptap/react';
import {isNumber} from 'lodash';

/**
 * parse a JSONContent array and return a string containing markdown syntax
 */
const parseContentArray = (contentArr: JSONContent[], prefix: string|number = '', isTable = false): string => {
    let output = '';

    function applySingleMark(text: string, type: string, attrs?: Record<string, any>): string {
        switch (type) {
        case 'italic':
            return `*${text}*`;
        case 'bold':
            return `**${text}**`;
        case 'strike':
            return `~~${text}~~`;
        case 'code':
            return `\`${text}\``;
        case 'mmLink':
            return attrs?.href ? `[${text}](${attrs.href})` : text;
        default:
            return text;
        }
    }

    contentArr.forEach((content, index) => {
        /**
         * if the content is pure text wth marks applied to it (bold, italic, etc.) parse it here and return early,
         * since text-content cannot have children (content.content) anymore
         */
        if (content.type === 'text') {
            let {text = ''} = content;
            const {marks} = content;

            /**
             * test if we have any text at all or the text consists only of whitespace characters and simply
             * return it without formatting. Otherwise it could lead to strange combinations of MD-formatting chars
             */
            if (!text || (/^\s*$/g).test(text)) {
                return;
            }

            // apply the marks in order of appearance
            marks?.forEach(({type, attrs}) => {
                text = applySingleMark(text, type, attrs);
            });

            output += text;
        }

        if (!content.content) {
            return;
        }

        let value;
        const isLastItem = index === contentArr.length - 1;
        const lineBreak = isTable ? '' : '\n';

        switch (content.type) {
        case 'heading':
            output += `${prefix}${'#'.repeat(content.attrs?.level ?? 1)} ${parseContentArray(content.content, '', isTable)}${lineBreak.repeat(2)}`;
            return;
        case 'codeBlock':
            value = parseContentArray(content.content, '', isTable);
            if (isTable) {
                output += value;
                return;
            }
            output += `\`\`\`${content.attrs?.language ?? ''}\n${value}\n\`\`\`\n\n`;
            return;
        case 'blockquote':
            output += parseContentArray(content.content, '> ', isTable);
            return;
        case 'bulletList':
            output += parseContentArray(content.content, '- ', isTable);
            return;
        case 'orderedList':
            output += parseContentArray(content.content, content.attrs?.start ?? 1, isTable);
            return;
        case 'listItem':
            output += parseContentArray(content.content, isNumber(prefix) ? `${prefix + index}. ` : prefix, isTable);
            if (isLastItem) {
                output += lineBreak.repeat(2);
            }
            return;
        case 'table':
            output += parseContentArray(content.content, '', true);
            return;
        case 'tableRow':
            output += `| ${parseContentArray(content.content, '', isTable)}\n`;
            return;
        case 'tableHeader':
        case 'tableCell':
            output += `${parseContentArray(content.content, '', isTable)} |`;
            if (content.type === 'tableHeader' && isLastItem) {
                output += `\n${'|---'.repeat(contentArr.length)}|`;
            }
            return;
        case 'paragraph':
        default:
            value = parseContentArray(content.content, '', isTable);
            output += `${prefix}${value}${lineBreak}`;
        }
    });

    return output;
};

/**
 * Helper function to convert the JSONcontent AST syntax to Markdown.
 */
export function contentToMarkdown(content: JSONContent): string {
    if (!content.content) {
        return '';
    }

    return parseContentArray(content.content).trim();
}
