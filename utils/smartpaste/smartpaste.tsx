// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import TurndownService from 'turndown';
import {strikethrough, taskListItems} from 'turndown-plugin-gfm';
import detectLang from 'lang-detector';

import {
    splitMessageBasedOnCaretPosition,
} from 'utils/post_utils.jsx';

import {tableTurndownRuleBuilder} from './tables';
import mattermostPlugin from './mattermost';
import {fixNestedLists} from './htmlfix';
import {NEW_LINE_REPLACEMENT} from './constants';

const turndownService = new TurndownService({codeBlockStyle: 'fenced'}).remove('style');
turndownService.use(strikethrough);
turndownService.use(taskListItems);
turndownService.use(mattermostPlugin);

export default function smartPaste(clipboard: DataTransfer, message: string, currentCaretPosition: number): {message: string; caretPosition: number} {
    const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(currentCaretPosition, message);

    const html = clipboard.getData('text/html');
    const text = clipboard.getData('text/plain');

    let formattedMessage = '';
    if (!html) {
        formattedMessage = codeDetectionFormatter(text);
    }

    if (!formattedMessage && html) {
        let doc = stringToHTML(html);
        if (doc.getElementById('turndown-root')?.firstChild?.nodeName === 'TABLE' && (/\b(js|blob|diff)-./).test((doc.getElementById('turndown-root')?.firstChild as HTMLTableElement)?.className)) {
            // Github code case
            let result = '';
            if (firstPiece.length > 0) {
                result += '\n';
            }
            result += '```\n' + text + '\n```';
            if (lastPiece.length > 0) {
                result += '\n';
            }
            formattedMessage = result;
        } else {
            doc = fixNestedLists(doc);
            turndownService.addRule('table', tableTurndownRuleBuilder(firstPiece.length > 0, lastPiece.length > 0));
            try {
                formattedMessage = turndownService.turndown(doc);
            } finally {
                // Remove the table rule added on runtime
                turndownService.rules.array.shift();
            }

            // Because turndown swallows some new lines around rule execution
            // results we need to provide a way to enforce the new lines, and this
            // is how we do it.
            formattedMessage = formattedMessage.replace(new RegExp(NEW_LINE_REPLACEMENT, 'g'), '\n');
        }
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
    const lines = text.split(/\r\n|\r|\n/).length;
    if (lang.detected !== 'Unknown' && (lang.statistics[lang.detected] / lines) > 0.3) {
        return '```' + lang.detected.toLowerCase() + '\n' + text + '\n```';
    }
    return '';
}

export function stringToHTML(html: string): Document {
    const doc = document.implementation.createHTMLDocument('');
    doc.open();
    doc.write('<x-turndown id="turndown-root">' + html + '</x-turndown>');
    doc.close();
    return doc;
}

