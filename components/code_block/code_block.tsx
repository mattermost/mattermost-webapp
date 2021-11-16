// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import CopyButton from 'components/copy_button';

import * as SyntaxHighlighting from 'utils/syntax_highlighting';
import * as TextFormatting from 'utils/text_formatting';

type Props = {
    code: string;
    language: string;
    searchedContent?: string;
}

const CodeBlock: React.FC<Props> = ({code, language, searchedContent}: Props) => {
    let usedLanguage = language || '';
    usedLanguage = usedLanguage.toLowerCase();

    if (usedLanguage === 'tex' || usedLanguage === 'latex') {
        return (
            <div data-latex={TextFormatting.escapeHtml(code)}/>
        );
    }

    if (usedLanguage === 'texcode' || usedLanguage === 'latexcode') {
        usedLanguage = 'latex';
    }

    // treat html as xml to prevent injection attacks
    if (usedLanguage === 'html') {
        usedLanguage = 'xml';
    }

    let className = 'post-code';
    if (!usedLanguage) {
        className += ' post-code--wrap';
    }

    let header: JSX.Element = <></>;
    if (SyntaxHighlighting.canHighlight(usedLanguage)) {
        header = (
            <span className='post-code__language'>
                {SyntaxHighlighting.getLanguageName(usedLanguage)}
            </span>
        );
    }

    let lineNumbers: JSX.Element = <></>;
    if (SyntaxHighlighting.canHighlight(usedLanguage)) {
        lineNumbers = (
            <div className='post-code__line-numbers'>
                {SyntaxHighlighting.renderLineNumbers(code)}
            </div>
        );
    }

    // If we have to apply syntax highlighting AND highlighting of search terms, create two copies
    // of the code block, one with syntax highlighting applied and another with invisible text, but
    // search term highlighting and overlap them
    const content = SyntaxHighlighting.highlight(usedLanguage, code);

    let htmlContent = content;
    if (searchedContent) {
        htmlContent = `${searchedContent} ${content}`;
    }

    return (
        <div className={className}>
            <div className='post-code__overlay'>
                <CopyButton content={TextFormatting.convertEntityToCharacter(code)}/>
                {header}
            </div>
            <div className='hljs'>
                {lineNumbers}
                <code dangerouslySetInnerHTML={{__html: htmlContent}}/>
            </div>
        </div>
    );
};

export default CodeBlock;
