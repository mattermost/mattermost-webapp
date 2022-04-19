// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback} from 'react';

import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';

import {FormattedMessage} from 'react-intl';

import CopyButton from 'components/copy_button';

import * as SyntaxHighlighting from 'utils/syntax_highlighting';

import RootPortal from 'components/root_portal';
import {copyToClipboard} from 'utils/utils.jsx';

type Props = {
    id: string;
    code: string;
    language: string;
    searchedContent?: string;
}

const CodeBlock: React.FC<Props> = ({id, code, language, searchedContent}: Props) => {
    const getUsedLanguage = useCallback(() => {
        let usedLanguage = language || '';
        usedLanguage = usedLanguage.toLowerCase();

        if (usedLanguage === 'texcode' || usedLanguage === 'latexcode') {
            usedLanguage = 'latex';
        }

        // treat html as xml to prevent injection attacks
        if (usedLanguage === 'html') {
            usedLanguage = 'xml';
        }

        return usedLanguage;
    }, [language]);

    const usedLanguage = getUsedLanguage();

    let className = 'post-code';
    if (!usedLanguage) {
        className += ' post-code--wrap';
    }

    let header: JSX.Element = <></>;
    let lineNumbers: JSX.Element = <></>;
    if (SyntaxHighlighting.canHighlight(usedLanguage)) {
        header = (
            <span className='post-code__language'>
                {SyntaxHighlighting.getLanguageName(usedLanguage)}
            </span>
        );
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

    const copyText = () => {
        copyToClipboard(code);
    };

    const copyMarkdown = useCallback(() => {
        const markdown = `\`\`\`${language}\n${code}\n\`\`\``;
        copyToClipboard(markdown);
    }, [language, code]);

    const contextMenu = (
        <RootPortal>
            <ContextMenu
                className='post-code__context-menu'
                id={`copy-code-block-context-menu-${id}`}
            >
                <MenuItem onClick={copyText}>
                    <FormattedMessage
                        id='copy.message'
                        defaultMessage='Copy'
                    />
                </MenuItem>
                <MenuItem divider={true}/>
                <MenuItem onClick={copyMarkdown}>
                    <FormattedMessage
                        id='copy.block.message'
                        defaultMessage='Copy code block'
                    />
                </MenuItem>
            </ContextMenu>
        </RootPortal>
    );

    return (
        <div className={className}>
            <div className='post-code__overlay'>
                <CopyButton content={code}/>
                {header}
            </div>
            {contextMenu}
            <ContextMenuTrigger
                id={`copy-code-block-context-menu-${id}`}
                holdToDisplay={1000}
            >
                <div className='hljs'>
                    {lineNumbers}
                    <code dangerouslySetInnerHTML={{__html: htmlContent}}/>
                </div>
            </ContextMenuTrigger>
        </div>
    );
};

export default CodeBlock;
