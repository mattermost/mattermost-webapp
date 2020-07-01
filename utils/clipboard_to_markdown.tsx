import TurndownService from 'turndown';
import {gfm} from 'turndown-plugin-gfm';
import detectLang from 'lang-detector';

import {getTable, formatMarkdownTableMessage, formatGithubCodePaste, isGitHubCodeBlock} from 'utils/paste';
import {
    splitMessageBasedOnCaretPosition,
} from 'utils/post_utils.jsx';

const turndownService: any = new TurndownService();
turndownService.use(gfm)

type SmartPasteOptions = {
    html: boolean;
    code: boolean;
    tables: boolean;
}

export function clipboardToMarkdown(clipboard: DataTransfer, message: string, currentCaretPosition: number, options: SmartPasteOptions): {message: string; caretPosition: number} {
    const {firstPiece, lastPiece} = splitMessageBasedOnCaretPosition(currentCaretPosition, message);

    const table = getTable(clipboard);
    const html = clipboard.getData('text/html');
    let formattedMessage = '';

    const text = clipboard.getData('text/plain');
    const lang = detectLang(text, {statistics: true});
    if (options.code && !html && lang.detected != 'Unknown' && (lang.statistics.Unknown/text.length) < (lang.statistics[lang.detected] / (4*text.length))) {
        formattedMessage = "```"+lang.detected.toLowerCase()+"\n" + text + "\n```";
    } else if (options.tables && table) {
        if (isGitHubCodeBlock(table.className)) {
            console.log(formatGithubCodePaste(currentCaretPosition, message, clipboard));
            const {formattedCodeBlock} = formatGithubCodePaste(currentCaretPosition, message, clipboard);
            formattedMessage = formattedCodeBlock;
        } else {
            formattedMessage = formatMarkdownTableMessage(table, message.trim(), currentCaretPosition);
        }
    } else if (options.html && html) {
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

function htmlToMarkdown(html: string): string {
    return turndownService.turndown(html);
}
