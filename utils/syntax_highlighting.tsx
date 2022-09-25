// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import hlJS from 'highlight.js/lib/core';
import oneC from 'highlight.js/lib/languages/1c';
import actionscript from 'highlight.js/lib/languages/actionscript';
import applescript from 'highlight.js/lib/languages/applescript';
import bash from 'highlight.js/lib/languages/bash';
import clojure from 'highlight.js/lib/languages/clojure';
import coffeescript from 'highlight.js/lib/languages/coffeescript';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import d from 'highlight.js/lib/languages/d';
import dart from 'highlight.js/lib/languages/dart';
import delphi from 'highlight.js/lib/languages/delphi';
import diff from 'highlight.js/lib/languages/diff';
import django from 'highlight.js/lib/languages/django';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import elixir from 'highlight.js/lib/languages/elixir';
import erlang from 'highlight.js/lib/languages/erlang';
import fortran from 'highlight.js/lib/languages/fortran';
import fsharp from 'highlight.js/lib/languages/fsharp';
import gcode from 'highlight.js/lib/languages/gcode';
import go from 'highlight.js/lib/languages/go';
import groovy from 'highlight.js/lib/languages/groovy';
import handlebars from 'highlight.js/lib/languages/handlebars';
import haskell from 'highlight.js/lib/languages/haskell';
import haxe from 'highlight.js/lib/languages/haxe';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import julia from 'highlight.js/lib/languages/julia';
import kotlin from 'highlight.js/lib/languages/kotlin';
import latex from 'highlight.js/lib/languages/latex';
import less from 'highlight.js/lib/languages/less';
import lisp from 'highlight.js/lib/languages/lisp';
import lua from 'highlight.js/lib/languages/lua';
import makefile from 'highlight.js/lib/languages/makefile';
import markdown from 'highlight.js/lib/languages/markdown';
import matlab from 'highlight.js/lib/languages/matlab';
import objectivec from 'highlight.js/lib/languages/objectivec';
import ocaml from 'highlight.js/lib/languages/ocaml';
import perl from 'highlight.js/lib/languages/perl';
import pgsql from 'highlight.js/lib/languages/pgsql';
import php from 'highlight.js/lib/languages/php';
import powershell from 'highlight.js/lib/languages/powershell';
import puppet from 'highlight.js/lib/languages/puppet';
import python from 'highlight.js/lib/languages/python';
import r from 'highlight.js/lib/languages/r';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import scala from 'highlight.js/lib/languages/scala';
import scheme from 'highlight.js/lib/languages/scheme';
import scss from 'highlight.js/lib/languages/scss';
import smalltalk from 'highlight.js/lib/languages/smalltalk';
import sql from 'highlight.js/lib/languages/sql';
import stylus from 'highlight.js/lib/languages/stylus';
import swift from 'highlight.js/lib/languages/swift';
import plaintext from 'highlight.js/lib/languages/plaintext';
import typescript from 'highlight.js/lib/languages/typescript';
import vbnet from 'highlight.js/lib/languages/vbnet';
import vbscript from 'highlight.js/lib/languages/vbscript';
import verilog from 'highlight.js/lib/languages/verilog';
import vhdl from 'highlight.js/lib/languages/vhdl';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hlJS.registerLanguage('1c', oneC);
hlJS.registerLanguage('actionscript', actionscript);
hlJS.registerLanguage('applescript', applescript);
hlJS.registerLanguage('bash', bash);
hlJS.registerLanguage('clojure', clojure);
hlJS.registerLanguage('coffeescript', coffeescript);
hlJS.registerLanguage('cpp', cpp);
hlJS.registerLanguage('csharp', csharp);
hlJS.registerLanguage('css', css);
hlJS.registerLanguage('d', d);
hlJS.registerLanguage('dart', dart);
hlJS.registerLanguage('delphi', delphi);
hlJS.registerLanguage('diff', diff);
hlJS.registerLanguage('django', django);
hlJS.registerLanguage('dockerfile', dockerfile);
hlJS.registerLanguage('elixir', elixir);
hlJS.registerLanguage('erlang', erlang);
hlJS.registerLanguage('fortran', fortran);
hlJS.registerLanguage('fsharp', fsharp);
hlJS.registerLanguage('gcode', gcode);
hlJS.registerLanguage('go', go);
hlJS.registerLanguage('groovy', groovy);
hlJS.registerLanguage('handlebars', handlebars);
hlJS.registerLanguage('haskell', haskell);
hlJS.registerLanguage('haxe', haxe);
hlJS.registerLanguage('java', java);
hlJS.registerLanguage('javascript', javascript);
hlJS.registerLanguage('json', json);
hlJS.registerLanguage('julia', julia);
hlJS.registerLanguage('kotlin', kotlin);
hlJS.registerLanguage('latex', latex);
hlJS.registerLanguage('less', less);
hlJS.registerLanguage('lisp', lisp);
hlJS.registerLanguage('lua', lua);
hlJS.registerLanguage('makefile', makefile);
hlJS.registerLanguage('markdown', markdown);
hlJS.registerLanguage('matlab', matlab);
hlJS.registerLanguage('objectivec', objectivec);
hlJS.registerLanguage('ocaml', ocaml);
hlJS.registerLanguage('perl', perl);
hlJS.registerLanguage('pgsql', pgsql);
hlJS.registerLanguage('php', php);
hlJS.registerLanguage('plaintext', plaintext);
hlJS.registerLanguage('powershell', powershell);
hlJS.registerLanguage('puppet', puppet);
hlJS.registerLanguage('python', python);
hlJS.registerLanguage('r', r);
hlJS.registerLanguage('ruby', ruby);
hlJS.registerLanguage('rust', rust);
hlJS.registerLanguage('scala', scala);
hlJS.registerLanguage('scheme', scheme);
hlJS.registerLanguage('scss', scss);
hlJS.registerLanguage('smalltalk', smalltalk);
hlJS.registerLanguage('sql', sql);
hlJS.registerLanguage('stylus', stylus);
hlJS.registerLanguage('swift', swift);
hlJS.registerLanguage('typescript', typescript);
hlJS.registerLanguage('vbnet', vbnet);
hlJS.registerLanguage('vbscript', vbscript);
hlJS.registerLanguage('verilog', verilog);
hlJS.registerLanguage('vhdl', vhdl);
hlJS.registerLanguage('xml', xml);
hlJS.registerLanguage('yaml', yaml);

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
