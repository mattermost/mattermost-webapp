// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import hlJS from 'highlight.js';

import Constants from './constants';
import * as TextFormatting from './text_formatting';

type LanguageObject = {
    [key: string]: {
        name: string;
        extensions: string[];
        aliases?: string[];
    };
}

const HighlightedLanguages: LanguageObject = Constants.HighlightedLanguages;

export function highlight(lang: string, code: string) {
    const language = getLanguageFromNameOrAlias(lang);

    if (language) {
        try {
            return hlJS.highlight(language, code).value;
        } catch (e) {
            // fall through if highlighting fails and handle below
        }
    }

    return TextFormatting.sanitizeHtml(code);
}

export function renderLineNumbers(code: string) {
    const numberOfLines = code.split(/\r\n|\n|\r/g).length;
    const lineNumbers = [];
    for (let i = 0; i < numberOfLines; i++) {
        lineNumbers.push((i + 1).toString());
    }

    return lineNumbers.join('\n');
}

export function getLanguageFromFileExtension(extension: string): string | null {
    for (const key in HighlightedLanguages) {
        if (HighlightedLanguages[key].extensions.find((x: string) => x === extension)) {
            return key;
        }
    }

    return null;
}

export function canHighlight(language: string): boolean {
    return Boolean(getLanguageFromNameOrAlias(language));
}

export function getLanguageName(language: string): string {
    if (canHighlight(language)) {
        const name: string | undefined = getLanguageFromNameOrAlias(language);
        if (!name) {
            return '';
        }
        return HighlightedLanguages[name].name;
    }

    return '';
}

function getLanguageFromNameOrAlias(name: string) {
    const langName: string = name.toLowerCase();
    if (HighlightedLanguages[langName]) {
        return langName;
    }

    return Object.keys(HighlightedLanguages).find((key) => {
        const aliases = HighlightedLanguages[key].aliases;
        return aliases && aliases.find((a) => a === langName);
    });
}
