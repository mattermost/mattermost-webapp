// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import marked, {MarkedOptions} from 'marked';

import * as PostUtils from 'utils/post_utils';
import * as SyntaxHighlighting from 'utils/syntax_highlighting';
import * as TextFormatting from 'utils/text_formatting';
import {getScheme, isUrlSafe} from 'utils/url';
import EmojiMap from 'utils/emoji_map';

export default class Renderer extends marked.Renderer {
    private formattingOptions: TextFormatting.TextFormattingOptions;
    private emojiMap: EmojiMap;
    public constructor(
        options: MarkedOptions,
        formattingOptions: TextFormatting.TextFormattingOptions,
        emojiMap = new EmojiMap(new Map()),
    ) {
        super(options);

        this.heading = this.heading.bind(this);
        this.paragraph = this.paragraph.bind(this);
        this.text = this.text.bind(this);
        this.emojiMap = emojiMap;

        this.formattingOptions = formattingOptions;
    }

    public code(code: string, language: string) {
        let usedLanguage = language || '';
        usedLanguage = usedLanguage.toLowerCase();

        if (usedLanguage === 'tex' || usedLanguage === 'latex') {
            return `<div data-latex="${TextFormatting.escapeHtml(code)}"></div>`;
        }
        if (usedLanguage === 'texcode' || usedLanguage === 'latexcode') {
            usedLanguage = 'tex';
        }

        // treat html as xml to prevent injection attacks
        if (usedLanguage === 'html') {
            usedLanguage = 'xml';
        }

        let className = 'post-code';
        if (!usedLanguage) {
            className += ' post-code--wrap';
        }

        let header = '';
        if (SyntaxHighlighting.canHighlight(usedLanguage)) {
            header = (
                '<span class="post-code__language">' +
                    SyntaxHighlighting.getLanguageName(usedLanguage) +
                '</span>'
            );
        }

        let lineNumbers = '';
        if (SyntaxHighlighting.canHighlight(usedLanguage)) {
            lineNumbers = (
                '<div class="post-code__line-numbers">' +
                    SyntaxHighlighting.renderLineNumbers(code) +
                '</div>'
            );
        }

        // If we have to apply syntax highlighting AND highlighting of search terms, create two copies
        // of the code block, one with syntax highlighting applied and another with invisible text, but
        // search term highlighting and overlap them
        const content = SyntaxHighlighting.highlight(usedLanguage, code);
        let searchedContent = '';

        if (this.formattingOptions.searchPatterns) {
            const tokens = new Map();

            let searched = TextFormatting.sanitizeHtml(code);
            searched = TextFormatting.highlightSearchTerms(
                searched,
                tokens,
                this.formattingOptions.searchPatterns,
            );

            if (tokens.size > 0) {
                searched = TextFormatting.replaceTokens(searched, tokens);

                searchedContent = (
                    '<div class="post-code__search-highlighting">' +
                        searched +
                    '</div>'
                );
            }
        }

        return (
            '<div class="' + className + '">' +
                header +
                '<div class="hljs">' +
                    lineNumbers +
                    '<code>' +
                        searchedContent +
                        content +
                    '</code>' +
                '</div>' +
            '</div>'
        );
    }

    public codespan(text: string) {
        let output = text;

        if (this.formattingOptions.searchPatterns) {
            const tokens = new Map();
            output = TextFormatting.highlightSearchTerms(
                output,
                tokens,
                this.formattingOptions.searchPatterns,
            );
            output = TextFormatting.replaceTokens(output, tokens);
        }

        return (
            '<span class="codespan__pre-wrap">' +
                '<code>' +
                    output +
                '</code>' +
            '</span>'
        );
    }

    public br() {
        if (this.formattingOptions.singleline) {
            return ' ';
        }

        return super.br();
    }

    public image(href: string, title: string, text: string) {
        let src = href;
        let dimensions: string[] = [];
        const parts = href.split(' ');
        if (parts.length > 1) {
            const lastPart = parts.pop();
            src = parts.join(' ');
            if (lastPart && lastPart[0] === '=') {
                dimensions = lastPart.substr(1).split('x');
                if (dimensions.length === 2 && dimensions[1] === '') {
                    dimensions[1] = 'auto';
                }
            }
        }
        src = PostUtils.getImageSrc(src, this.formattingOptions.proxyImages);
        let out = `<img src="${src}" alt="${text}"`;
        if (title) {
            out += ` title="${title}"`;
        }
        if (dimensions.length > 0) {
            out += ` width="${dimensions[0]}"`;
        }
        if (dimensions.length > 1) {
            out += ` height="${dimensions[1]}"`;
        }
        out += ' class="markdown-inline-img"';
        out += this.options.xhtml ? '/>' : '>';
        return out;
    }

    public heading(text: string, level: number) {
        return `<h${level} class="markdown__heading">${text}</h${level}>`;
    }

    public link(href: string, title: string, text: string, isUrl = false) {
        let outHref = href;

        if (!href.startsWith('/')) {
            const scheme = getScheme(href);
            if (!scheme) {
                outHref = `http://${outHref}`;
            } else if (isUrl && this.formattingOptions.autolinkedUrlSchemes) {
                const isValidUrl =
          this.formattingOptions.autolinkedUrlSchemes.indexOf(
              scheme.toLowerCase(),
          ) !== -1;

                if (!isValidUrl) {
                    return text;
                }
            }
        }

        if (!isUrlSafe(unescapeHtmlEntities(href))) {
            return text;
        }

        let output = '<a class="theme markdown__link';

        if (this.formattingOptions.searchPatterns) {
            for (const pattern of this.formattingOptions.searchPatterns) {
                if (pattern.pattern.test(href)) {
                    output += ' search-highlight';
                    break;
                }
            }
        }

        output += `" href="${outHref}" rel="noreferrer"`;

        const isInternalLink = outHref.startsWith(this.formattingOptions.siteURL || '') || outHref.startsWith('/');

        let openInNewTab;
        if (isInternalLink) {
            const path = outHref.startsWith('/') ? outHref : outHref.substring(this.formattingOptions.siteURL?.length || 0);

            // Paths managed by plugins and public file links aren't handled by the web app
            const unhandledPaths = [
                'plugins',
                'files',
            ];

            // Paths managed by another service shouldn't be handled by the web app either
            if (this.formattingOptions.managedResourcePaths) {
                for (const managedPath of this.formattingOptions.managedResourcePaths) {
                    unhandledPaths.push(TextFormatting.escapeRegex(managedPath));
                }
            }

            openInNewTab = unhandledPaths.some((unhandledPath) => new RegExp('^/' + unhandledPath + '\\b').test(path));
        } else {
            // All links outside of Mattermost should be opened in a new tab
            openInNewTab = true;
        }

        if (openInNewTab || !this.formattingOptions.siteURL) {
            output += ' target="_blank"';
        } else {
            output += ` data-link="${outHref.replace(
                this.formattingOptions.siteURL,
                '',
            )}"`;
        }

        if (title) {
            output += ` title="${title}"`;
        }

        // remove any links added to the text by hashtag or mention parsing since they'll break this link
        output += '>' + text.replace(/<\/?a[^>]*>/g, '') + '</a>';

        return output;
    }

    public paragraph(text: string) {
        if (this.formattingOptions.singleline) {
            let result;
            if (text.includes('class="markdown-inline-img"')) {
                /*
         ** use a div tag instead of a p tag to allow other divs to be nested,
         ** which avoids errors of incorrect DOM nesting (<div> inside <p>)
         */
                result = `<div class="markdown__paragraph-inline">${text}</div>`;
            } else {
                result = `<p class="markdown__paragraph-inline">${text}</p>`;
            }
            return result;
        }

        return super.paragraph(text);
    }

    public table(header: string, body: string) {
        return `<div class="table-responsive"><table class="markdown__table"><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
    }

    public tablerow(content: string) {
        return `<tr>${content}</tr>`;
    }

    public tablecell(
        content: string,
        flags: {
            header: boolean;
            align: 'center' | 'left' | 'right' | null;
        },
    ) {
        return marked.Renderer.prototype.tablecell(content, flags).trim();
    }

    public list(content: string, ordered: boolean, start: number) {
        const type = ordered ? 'ol' : 'ul';

        let output = `<${type} className="markdown__list"`;
        if (ordered && start !== undefined) {
            // The CSS that we use for lists hides the actual counter and uses ::before to simulate one so that we can
            // style it properly. We need to use a CSS counter to tell the ::before elements which numbers to show.
            output += ` style="counter-reset: list ${start - 1}"`;
        }
        output += `>\n${content}</${type}>`;

        return output;
    }

    public listitem(text: string, bullet = '') { // eslint-disable-line @typescript-eslint/no-unused-vars
        const taskListReg = /^\[([ |xX])] /;
        const isTaskList = taskListReg.exec(text);

        if (isTaskList) {
            return `<li class="list-item--task-list">${'<input type="checkbox" disabled="disabled" ' +
        (isTaskList[1] === ' ' ? '' : 'checked="checked" ') +
        '/> '}${text.replace(taskListReg, '')}</li>`;
        }

        // Added a span because if not whitespace nodes only
        // works in Firefox but not in Webkit
        return `<li><span>${text}</span></li>`;
    }

    public text(txt: string) {
        return TextFormatting.doFormatText(
            txt,
            this.formattingOptions,
            this.emojiMap,
        );
    }
}

// Marked helper functions that should probably just be exported

function unescapeHtmlEntities(html: string) {
    return html.replace(/&([#\w]+);/g, (_, m) => {
        const n = m.toLowerCase();
        if (n === 'colon') {
            return ':';
        } else if (n.charAt(0) === '#') {
            return n.charAt(1) === 'x' ?
                String.fromCharCode(parseInt(n.substring(2), 16)) :
                String.fromCharCode(Number(n.substring(1)));
        }
        return '';
    });
}
