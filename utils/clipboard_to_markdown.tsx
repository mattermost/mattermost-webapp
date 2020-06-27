import TurndownService from 'turndown';
import detectLang from 'lang-detector';

import {getTable, formatMarkdownTableMessage, formatGithubCodePaste, isGitHubCodeBlock} from 'utils/paste';
import {
    splitMessageBasedOnCaretPosition,
} from 'utils/post_utils.jsx';

export function clipboardToMarkdown(clipboard: DataTransfer, message: string, currentCaretPosition: number): {message: string; caretPosition: number} {
    const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(currentCaretPosition, message);

    const table = getTable(clipboard);
    const html = clipboard.getData('text/html');
    let formattedMessage = '';

    const text = clipboard.getData('text/plain');
    const lang = detectLang(text);
    if (lang !== "Unknown") {
        formattedMessage = "```"+lang.toLowerCase()+"\n" + text + "\n```";
    } else if (table) {
        if (isGitHubCodeBlock(table.className)) {
            const {newCodeBlock} = formatGithubCodePaste(currentCaretPosition, message, clipboard);
            formattedMessage = newCodeBlock;
        } else {
            formattedMessage = formatMarkdownTableMessage(table, message.trim(), currentCaretPosition);
        }
    } else if (html) {
        formattedMessage = htmlToMarkdown(html);
    } else {
        formattedMessage = text;
    }

    const newMessage = `${firstPiece}${formattedMessage}${lastPiece}`;
    const newCaretPosition = currentCaretPosition + formattedMessage.length;
    return {
        message: newMessage,
        caretPosition: newCaretPosition,
    };
}

function htmlToMarkdown(html: string): string {
    const turndownService = new TurndownService();
    return turndownService.turndown(html);
}
