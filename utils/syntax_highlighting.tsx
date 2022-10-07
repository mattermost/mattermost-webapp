// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {LanguageFn} from 'highlight.js';
import hlJS from 'highlight.js/lib/core';

import * as TextFormatting from 'utils/text_formatting';

import Constants from './constants';

type LanguageObject = {
    [key: string]: {
        name: string;
        extensions: string[];
        aliases?: string[];
    };
}

const HighlightedLanguages: LanguageObject = Constants.HighlightedLanguages;

export async function highlight(lang: string, code: string) {
    const language = getLanguageFromNameOrAlias(lang);

    if (language) {
        try {
            await registerLanguage(language);
            return hlJS.highlight(code, {language}).value;
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

async function registerLanguage(languageName: string) {
    let language: LanguageFn | undefined;
    switch (languageName) {
    case '1c':
        language = (await import('highlight.js/lib/languages/1c')).default;
        break;
    case 'actionscript':
        language = (await import('highlight.js/lib/languages/actionscript')).default;
        break;
    case 'applescript':
        language = (await import('highlight.js/lib/languages/applescript')).default;
        break;
    case 'bash':
        language = (await import('highlight.js/lib/languages/bash')).default;
        break;
    case 'clojure':
        language = (await import('highlight.js/lib/languages/clojure')).default;
        break;
    case 'coffeescript':
        language = (await import('highlight.js/lib/languages/coffeescript')).default;
        break;
    case 'cpp':
        language = (await import('highlight.js/lib/languages/cpp')).default;
        break;
    case 'csharp':
        language = (await import('highlight.js/lib/languages/csharp')).default;
        break;
    case 'css':
        language = (await import('highlight.js/lib/languages/css')).default;
        break;
    case 'd':
        language = (await import('highlight.js/lib/languages/d')).default;
        break;
    case 'dart':
        language = (await import('highlight.js/lib/languages/dart')).default;
        break;
    case 'delphi':
        language = (await import('highlight.js/lib/languages/delphi')).default;
        break;
    case 'diff':
        language = (await import('highlight.js/lib/languages/diff')).default;
        break;
    case 'django':
        language = (await import('highlight.js/lib/languages/django')).default;
        break;
    case 'dockerfile':
        language = (await import('highlight.js/lib/languages/dockerfile')).default;
        break;
    case 'elixir':
        language = (await import('highlight.js/lib/languages/elixir')).default;
        break;
    case 'erlang':
        language = (await import('highlight.js/lib/languages/erlang')).default;
        break;
    case 'fortran':
        language = (await import('highlight.js/lib/languages/fortran')).default;
        break;
    case 'fsharp':
        language = (await import('highlight.js/lib/languages/fsharp')).default;
        break;
    case 'gcode':
        language = (await import('highlight.js/lib/languages/gcode')).default;
        break;
    case 'go':
        language = (await import('highlight.js/lib/languages/go')).default;
        break;
    case 'groovy':
        language = (await import('highlight.js/lib/languages/groovy')).default;
        break;
    case 'handlebars':
        language = (await import('highlight.js/lib/languages/handlebars')).default;
        break;
    case 'haskell':
        language = (await import('highlight.js/lib/languages/haskell')).default;
        break;
    case 'haxe':
        language = (await import('highlight.js/lib/languages/haxe')).default;
        break;
    case 'java':
        language = (await import('highlight.js/lib/languages/java')).default;
        break;
    case 'javascript':
        language = (await import('highlight.js/lib/languages/javascript')).default;
        break;
    case 'json':
        language = (await import('highlight.js/lib/languages/json')).default;
        break;
    case 'julia':
        language = (await import('highlight.js/lib/languages/julia')).default;
        break;
    case 'kotlin':
        language = (await import('highlight.js/lib/languages/kotlin')).default;
        break;
    case 'latex':
        language = (await import('highlight.js/lib/languages/latex')).default;
        break;
    case 'less':
        language = (await import('highlight.js/lib/languages/less')).default;
        break;
    case 'lisp':
        language = (await import('highlight.js/lib/languages/lisp')).default;
        break;
    case 'lua':
        language = (await import('highlight.js/lib/languages/lua')).default;
        break;
    case 'makefile':
        language = (await import('highlight.js/lib/languages/makefile')).default;
        break;
    case 'markdown':
        language = (await import('highlight.js/lib/languages/markdown')).default;
        break;
    case 'matlab':
        language = (await import('highlight.js/lib/languages/matlab')).default;
        break;
    case 'objectivec':
        language = (await import('highlight.js/lib/languages/objectivec')).default;
        break;
    case 'ocaml':
        language = (await import('highlight.js/lib/languages/ocaml')).default;
        break;
    case 'perl':
        language = (await import('highlight.js/lib/languages/perl')).default;
        break;
    case 'pgsql':
        language = (await import('highlight.js/lib/languages/pgsql')).default;
        break;
    case 'php':
        language = (await import('highlight.js/lib/languages/php')).default;
        break;
    case 'plaintext':
        language = (await import('highlight.js/lib/languages/plaintext')).default;
        break;
    case 'powershell':
        language = (await import('highlight.js/lib/languages/powershell')).default;
        break;
    case 'puppet':
        language = (await import('highlight.js/lib/languages/puppet')).default;
        break;
    case 'python':
        language = (await import('highlight.js/lib/languages/python')).default;
        break;
    case 'r':
        language = (await import('highlight.js/lib/languages/r')).default;
        break;
    case 'ruby':
        language = (await import('highlight.js/lib/languages/ruby')).default;
        break;
    case 'rust':
        language = (await import('highlight.js/lib/languages/rust')).default;
        break;
    case 'scala':
        language = (await import('highlight.js/lib/languages/scala')).default;
        break;
    case 'scheme':
        language = (await import('highlight.js/lib/languages/scheme')).default;
        break;
    case 'scss':
        language = (await import('highlight.js/lib/languages/scss')).default;
        break;
    case 'smalltalk':
        language = (await import('highlight.js/lib/languages/smalltalk')).default;
        break;
    case 'sql':
        language = (await import('highlight.js/lib/languages/sql')).default;
        break;
    case 'stylus':
        language = (await import('highlight.js/lib/languages/stylus')).default;
        break;
    case 'swift':
        language = (await import('highlight.js/lib/languages/swift')).default;
        break;
    case 'typescript':
        language = (await import('highlight.js/lib/languages/typescript')).default;
        break;
    case 'vbnet':
        language = (await import('highlight.js/lib/languages/vbnet')).default;
        break;
    case 'vbscript':
        language = (await import('highlight.js/lib/languages/vbscript')).default;
        break;
    case 'verilog':
        language = (await import('highlight.js/lib/languages/verilog')).default;
        break;
    case 'vhdl':
        language = (await import('highlight.js/lib/languages/vhdl')).default;
        break;
    case 'xml':
        language = (await import('highlight.js/lib/languages/xml')).default;
        break;
    case 'yaml':
        language = (await import('highlight.js/lib/languages/yaml')).default;
        break;
    }

    if (!language) {
        return;
    }
    hlJS.registerLanguage(languageName, language);
}
