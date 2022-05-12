// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export interface ApplyMarkdownOptions {
    markdownMode: 'bold' | 'italic' | 'link' | 'strike' | 'code' | 'heading' | 'quote' | 'ul' | 'ol';
    selectionStart: number;
    selectionEnd: number;
    value: string;
}

export function applyMarkdown(params: ApplyMarkdownOptions): {
    message: string;
    selectionStart: number;
    selectionEnd: number;
} {
    const {selectionEnd, selectionStart, value, markdownMode} = params;

    if (markdownMode === 'bold' || markdownMode === 'italic') {
        return applyBoldItalicMarkdown({
            selectionEnd,
            selectionStart,
            value,
            markdownMode,
        });
    }

    if (markdownMode === 'link') {
        return applyLinkMarkdown({selectionEnd, selectionStart, value});
    }

    if (markdownMode === 'strike') {
        return applyMarkdownToSelection({
            selectionEnd,
            selectionStart,
            value,
            delimiter: '~~',
        });
    }

    if (markdownMode === 'code') {
        return applyMarkdownToSelection({
            selectionEnd,
            selectionStart,
            value,
            delimiter: '```',
        });
    }

    if (markdownMode === 'heading') {
        return applyMarkdownToSelectedLines({
            selectionEnd,
            selectionStart,
            value,
            delimiter: '### ',
        });
    }

    if (markdownMode === 'quote') {
        return applyMarkdownToSelectedLines({
            selectionEnd,
            selectionStart,
            value,
            delimiter: '> ',
        });
    }

    if (markdownMode === 'ul') {
        return applyMarkdownToSelectedLines({
            selectionEnd,
            selectionStart,
            value,
            delimiter: '- ',
        });
    }

    if (markdownMode === 'ol') {
        return applyOlMarkdown({selectionEnd, selectionStart, value});
    }

    throw Error('Unsupported markdown mode: ' + markdownMode);
}

const getMultilineSuffix = (suffix: string): string => {
    if (suffix.startsWith('\n')) {
        return '';
    }
    return suffix.indexOf('\n') === -1 ? suffix : suffix.substring(0, suffix.indexOf('\n'));
};

const getNewSuffix = (suffix: string): string => {
    if (suffix.startsWith('\n')) {
        return suffix;
    }
    return suffix.indexOf('\n') === -1 ? '' : suffix.substring(suffix.indexOf('\n'));
};

const applyOlMarkdown = ({selectionEnd, selectionStart, value}: Omit<ApplyMarkdownOptions, 'markdownMode'>) => {
    const prefix = value.substring(0, selectionStart);
    const selection = value.substring(selectionStart, selectionEnd);
    const suffix = value.substring(selectionEnd);

    const newPrefix = prefix.includes('\n') ? prefix.substring(0, prefix.lastIndexOf('\n')) : '';

    const multilineSuffix = getMultilineSuffix(suffix);
    const newSuffix = getNewSuffix(suffix);

    const delimiterLength = 3;
    const getDelimiter = (num?: number) => {
        getDelimiter.counter = num || getDelimiter.counter;
        return `${getDelimiter.counter++}. `;
    };
    getDelimiter.counter = 1;

    const multilinePrefix = prefix.includes('\n') ? prefix.substring(prefix.lastIndexOf('\n')) : prefix;
    let multilineSelection = multilinePrefix + selection + multilineSuffix;
    const isFirstLineSelected = !multilineSelection.startsWith('\n');

    if (selection.startsWith('\n')) {
        multilineSelection = prefix.substring(prefix.lastIndexOf('\n')) + selection + multilineSuffix;
    }

    const getHasCurrentMarkdown = (): boolean => {
        const linesQuantity = (multilineSelection.match(/\n/g) || []).length;
        const newLinesWithDelimitersQuantity = (multilineSelection.match(/\n\d\. /g) || []).length;

        if (newLinesWithDelimitersQuantity === linesQuantity && !isFirstLineSelected) {
            return true;
        }

        if (linesQuantity === newLinesWithDelimitersQuantity && (/^\d\. /).test(multilineSelection)) {
            return true;
        }

        return false;
    };
    let newValue = '';
    let newStart = 0;
    let newEnd = 0;

    if (getHasCurrentMarkdown()) {
        // clear first line from delimiter
        if (isFirstLineSelected) {
            multilineSelection = multilineSelection.substring(delimiterLength);
        }

        newValue = newPrefix + multilineSelection.replace(/\n\d\. /g, '\n') + newSuffix;
        let count = 0;

        if (isFirstLineSelected) {
            count++;
        }
        count += (multilineSelection.match(/\n/g) || []).length;

        newStart = Math.max(selectionStart - delimiterLength, 0);
        newEnd = Math.max(selectionEnd - (delimiterLength * count), 0);
    } else {
        let count = 0;
        if (isFirstLineSelected) {
            multilineSelection = getDelimiter() + multilineSelection;
            count++;
        }
        const selectionArr = Array.from(multilineSelection);
        for (let i = 0; i < selectionArr.length; i++) {
            if (selectionArr[i] === '\n') {
                selectionArr[i] = `\n${getDelimiter()}`;
            }
        }
        multilineSelection = selectionArr.join('');
        newValue = newPrefix + multilineSelection + newSuffix;

        count += (multilineSelection.match(new RegExp('\\n', 'g')) || []).length;

        newStart = selectionStart + delimiterLength;
        newEnd = selectionEnd + (delimiterLength * count);
    }

    return {
        message: newValue,
        selectionStart: newStart,
        selectionEnd: newEnd,
    };
};

export const applyMarkdownToSelectedLines = ({
    selectionEnd,
    selectionStart,
    value,
    delimiter,
}: Omit<ApplyMarkdownOptions, 'markdownMode'> & {
    delimiter: string;
}) => {
    const prefix = value.substring(0, selectionStart);
    const selection = value.substring(selectionStart, selectionEnd);
    const suffix = value.substring(selectionEnd);

    const newPrefix = prefix.includes('\n') ? prefix.substring(0, prefix.lastIndexOf('\n')) : '';
    const multilinePrefix = prefix.includes('\n') ? prefix.substring(prefix.lastIndexOf('\n')) : prefix;

    const multilineSuffix = getMultilineSuffix(suffix);
    const newSuffix = getNewSuffix(suffix);
    let multilineSelection: string = multilinePrefix + selection + multilineSuffix;

    const isFirstLineSelected = !multilineSelection.startsWith('\n');

    if (selection.startsWith('\n')) {
        multilineSelection = prefix.substring(prefix.lastIndexOf('\n')) + selection + multilineSuffix;
    }

    const getHasCurrentMarkdown = (): boolean => {
        const linesQuantity = (multilineSelection.match(/\n/g) || []).length;
        const newLinesWithDelimitersQuantity = (multilineSelection.match(new RegExp(`\n${delimiter}`, 'g')) || []).
            length;

        if (newLinesWithDelimitersQuantity === linesQuantity && !isFirstLineSelected) {
            return true;
        }

        if (linesQuantity === newLinesWithDelimitersQuantity && multilineSelection.startsWith(delimiter)) {
            return true;
        }

        return false;
    };

    let newValue = '';
    let newStart = 0;
    let newEnd = 0;

    if (getHasCurrentMarkdown()) {
        // clear first line from delimiter
        if (isFirstLineSelected) {
            multilineSelection = multilineSelection.substring(delimiter.length);
        }

        newValue = newPrefix + multilineSelection.replace(new RegExp(`\n${delimiter}`, 'g'), '\n') + newSuffix;
        let count = 0;
        if (isFirstLineSelected) {
            count++;
        }
        count += (multilineSelection.match(/\n/g) || []).length;

        newStart = Math.max(selectionStart - delimiter.length, 0);
        newEnd = Math.max(selectionEnd - (delimiter.length * count), 0);
    } else {
        newValue = newPrefix + multilineSelection.replace(/\n/g, `\n${delimiter}`) + newSuffix;
        let count = 0;
        if (isFirstLineSelected) {
            newValue = delimiter + newValue;
            count++;
        }

        count += (multilineSelection.match(new RegExp('\\n', 'g')) || []).length;

        newStart = selectionStart + delimiter.length;
        newEnd = selectionEnd + (delimiter.length * count);
    }

    return {
        message: newValue,
        selectionStart: newStart,
        selectionEnd: newEnd,
    };
};

const applyMarkdownToSelection = ({
    selectionEnd,
    selectionStart,
    value,
    delimiter,
}: Omit<ApplyMarkdownOptions, 'markdownMode'> & {
    delimiter: string;
}) => {
    const prefix = value.substring(0, selectionStart);
    const selection = value.substring(selectionStart, selectionEnd);
    const suffix = value.substring(selectionEnd);

    // Does the selection have current hotkey's markdown?
    const hasCurrentMarkdown = prefix.endsWith(delimiter) && suffix.startsWith(delimiter);

    let newValue = '';
    let newStart = 0;
    let newEnd = 0;
    if (hasCurrentMarkdown) {
        // selection already has the markdown; remove it
        newValue =
            prefix.substring(0, prefix.length - delimiter.length) + selection + suffix.substring(delimiter.length);
        newStart = selectionStart - delimiter.length;
        newEnd = selectionEnd - delimiter.length;
    } else {
        // Add strike markdown
        newValue = prefix + delimiter + selection + delimiter + suffix;
        newStart = selectionStart + delimiter.length;
        newEnd = selectionEnd + delimiter.length;
    }

    return {
        message: newValue,
        selectionStart: newStart,
        selectionEnd: newEnd,
    };
};

function applyBoldItalicMarkdown({selectionEnd, selectionStart, value, markdownMode}: ApplyMarkdownOptions) {
    const BOLD_MD = '**';
    const ITALIC_MD = '*';

    const isForceItalic = markdownMode === 'italic';
    const isForceBold = markdownMode === 'bold';

    // <prefix> <selection> <suffix>
    const prefix = value.substring(0, selectionStart);
    const selection = value.substring(selectionStart, selectionEnd);
    const suffix = value.substring(selectionEnd);

    // Is it italic hot key on existing bold markdown? i.e. italic on **haha**
    let isItalicFollowedByBold = false;
    let delimiter = '';

    if (isForceBold) {
        delimiter = BOLD_MD;
    } else if (isForceItalic) {
        delimiter = ITALIC_MD;
        isItalicFollowedByBold = prefix.endsWith(BOLD_MD) && suffix.startsWith(BOLD_MD);
    }

    // Does the selection have current hotkey's markdown?
    const hasCurrentMarkdown = prefix.endsWith(delimiter) && suffix.startsWith(delimiter);

    // Does current selection have both of the markdown around it? i.e. ***haha***
    const hasItalicAndBold = prefix.endsWith(BOLD_MD + ITALIC_MD) && suffix.startsWith(BOLD_MD + ITALIC_MD);

    let newValue = '';
    let newStart = 0;
    let newEnd = 0;

    if (hasItalicAndBold || (hasCurrentMarkdown && !isItalicFollowedByBold)) {
        // message already has the markdown; remove it
        newValue =
            prefix.substring(0, prefix.length - delimiter.length) + selection + suffix.substring(delimiter.length);
        newStart = selectionStart - delimiter.length;
        newEnd = selectionEnd - delimiter.length;
    } else {
        // Add italic or bold markdown
        newValue = prefix + delimiter + selection + delimiter + suffix;
        newStart = selectionStart + delimiter.length;
        newEnd = selectionEnd + delimiter.length;
    }

    return {
        message: newValue,
        selectionStart: newStart,
        selectionEnd: newEnd,
    };
}

function applyLinkMarkdown({selectionEnd, selectionStart, value}: Omit<ApplyMarkdownOptions, 'markdownMode'>) {
    // <prefix> <selection> <suffix>
    const prefix = value.substring(0, selectionStart);
    const selection = value.substring(selectionStart, selectionEnd);
    const suffix = value.substring(selectionEnd);

    const delimiterStart = '[';
    const delimiterEnd = '](url)';

    // Does the selection have link markdown?
    const hasMarkdown = prefix.endsWith(delimiterStart) && suffix.startsWith(delimiterEnd);

    let newValue = '';
    let newStart = 0;
    let newEnd = 0;

    // When url is to be selected in [...](url), selection cursors need to shift by this much.
    const urlShift = delimiterStart.length + 2; // ']'.length + ']('.length
    if (hasMarkdown) {
        // message already has the markdown; remove it
        newValue =
            prefix.substring(0, prefix.length - delimiterStart.length) +
            selection +
            suffix.substring(delimiterEnd.length);
        newStart = selectionStart - delimiterStart.length;
        newEnd = selectionEnd - delimiterStart.length;
    } else if (value.length === 0) {
        // no input; Add [|](url)
        newValue = delimiterStart + delimiterEnd;
        newStart = delimiterStart.length;
        newEnd = delimiterStart.length;
    } else if (selectionStart < selectionEnd) {
        // there is something selected; put markdown around it and preserve selection
        newValue = prefix + delimiterStart + selection + delimiterEnd + suffix;
        newStart = selectionEnd + urlShift;
        newEnd = newStart + urlShift;
    } else {
        // nothing is selected
        const spaceBefore = prefix.charAt(prefix.length - 1) === ' ';
        const spaceAfter = suffix.charAt(0) === ' ';
        const cursorBeforeWord =
            (selectionStart !== 0 && spaceBefore && !spaceAfter) || (selectionStart === 0 && !spaceAfter);
        const cursorAfterWord =
            (selectionEnd !== value.length && spaceAfter && !spaceBefore) ||
            (selectionEnd === value.length && !spaceBefore);

        if (cursorBeforeWord) {
            // cursor before a word
            const word = value.substring(selectionStart, findWordEnd(value, selectionStart));

            newValue = prefix + delimiterStart + word + delimiterEnd + suffix.substring(word.length);
            newStart = selectionStart + word.length + urlShift;
            newEnd = newStart + urlShift;
        } else if (cursorAfterWord) {
            // cursor after a word
            const cursorAtEndOfLine = selectionStart === selectionEnd && selectionEnd === value.length;
            if (cursorAtEndOfLine) {
                // cursor at end of line
                newValue = value + ' ' + delimiterStart + delimiterEnd;
                newStart = selectionEnd + 1 + delimiterStart.length;
                newEnd = newStart;
            } else {
                // cursor not at end of line
                const word = value.substring(findWordStart(value, selectionStart), selectionStart);

                newValue =
                    prefix.substring(0, prefix.length - word.length) + delimiterStart + word + delimiterEnd + suffix;
                newStart = selectionStart + urlShift;
                newEnd = newStart + urlShift;
            }
        } else {
            // cursor is in between a word
            const wordStart = findWordStart(value, selectionStart);
            const wordEnd = findWordEnd(value, selectionStart);
            const word = value.substring(wordStart, wordEnd);

            newValue = prefix.substring(0, wordStart) + delimiterStart + word + delimiterEnd + value.substring(wordEnd);
            newStart = wordEnd + urlShift;
            newEnd = newStart + urlShift;
        }
    }

    return {
        message: newValue,
        selectionStart: newStart,
        selectionEnd: newEnd,
    };
}

function findWordEnd(text: string, start: number) {
    const wordEnd = text.indexOf(' ', start);
    return wordEnd === -1 ? text.length : wordEnd;
}

function findWordStart(text: string, start: number) {
    const wordStart = text.lastIndexOf(' ', start - 1) + 1;
    return wordStart === -1 ? 0 : wordStart;
}
