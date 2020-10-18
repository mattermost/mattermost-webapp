// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import hlJS from 'highlight.js';

import Constants from './constants';
import * as TextFormatting from './text_formatting';

type languageObject = {
    [key: string]: {
        name: string;
        extensions: string[];
        aliases?: string[];
    };
}

const HighlightedLanguages: languageObject = Constants.HighlightedLanguages;

// This function add line numbers to code
function formatHighLight(code: string) {
    if (code) {
        return code.split('\n').map((str) => {
            if (str || str === '') {
                return `
                    <div class='hljs-ln-numbers'>
                        <span class='hljs-code'>${str}</span>
                    </div>
                `;
            }

            return str;
        }).join('\n');
    }

    return code;
}

export function highlight(lang: string, code: string, addLineNumbers = false) {
    const language = getLanguageFromNameOrAlias(lang);

    if (language) {
        try {
            const codeValue = hlJS.highlight(language, code).value;
            if (addLineNumbers) {
                return formatHighLight(codeValue);
            }
            return codeValue;
        } catch (e) {
            // fall through if highlighting fails and handle below
        }
    }

    return TextFormatting.sanitizeHtml(code);
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
