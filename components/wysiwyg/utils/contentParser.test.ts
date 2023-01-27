// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {contentToMarkdown} from './contentParser';

describe('contentParser: ', () => {
    describe('parses headlines', () => {
        it('without formatting', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'heading',
                        attrs: {
                            level: 1,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'Heading 1',
                            },
                        ],
                    },
                    {
                        type: 'heading',
                        attrs: {
                            level: 2,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'Heading 2',
                            },
                        ],
                    },
                    {
                        type: 'heading',
                        attrs: {
                            level: 3,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'Heading 3',
                            },
                        ],
                    },
                    {
                        type: 'heading',
                        attrs: {
                            level: 4,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'Heading 4',
                            },
                        ],
                    },
                    {
                        type: 'heading',
                        attrs: {
                            level: 5,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'Heading 5',
                            },
                        ],
                    },
                    {
                        type: 'heading',
                        attrs: {
                            level: 6,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'Heading 6',
                            },
                        ],
                    },
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: 'normal Text',
                            },
                        ],
                    },
                ],
            };
            const result = '# Heading 1\n\n## Heading 2\n\n### Heading 3\n\n#### Heading 4\n\n##### Heading 5\n\n###### Heading 6\n\nnormal Text';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('with formatting', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'heading',
                        attrs: {
                            level: 1,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'Heading 1 ',
                            },
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'strike',
                                    },
                                ],
                                text: 'with striked text',
                            },
                        ],
                    },
                    {
                        type: 'heading',
                        attrs: {
                            level: 2,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'Heading 2 ',
                            },
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'italic',
                                    },
                                ],
                                text: 'with italic text',
                            },
                        ],
                    },
                    {
                        type: 'heading',
                        attrs: {
                            level: 3,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'Heading 3 ',
                            },
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'code',
                                    },
                                ],
                                text: 'with inline code',
                            },
                        ],
                    },
                    {
                        type: 'heading',
                        attrs: {
                            level: 4,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'Heading 4 ',
                            },
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'mmLink',
                                        attrs: {
                                            href: 'http://www.mattermost.com/',
                                            target: '_blank',
                                            class: 'theme markdown__link',
                                        },
                                    },
                                ],
                                text: 'with link',
                            },
                        ],
                    },
                ],
            };
            const result = '# Heading 1 ~~with striked text~~\n\n## Heading 2 *with italic text*\n\n### Heading 3 `with inline code`\n\n#### Heading 4 [with link](http://www.mattermost.com/)';
            expect(contentToMarkdown(content)).toEqual(result);
        });
    });
    describe('parses inline formats', () => {
        it('bold', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: 'text with ',
                            },
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'bold',
                                    },
                                ],
                                text: 'bold section',
                            },
                            {
                                type: 'text',
                                text: ' in it',
                            },
                        ],
                    },
                ],
            };
            const result = 'text with **bold section** in it';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('italic', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: 'text with ',
                            },
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'italic',
                                    },
                                ],
                                text: 'italic section',
                            },
                            {
                                type: 'text',
                                text: ' in it',
                            },
                        ],
                    },
                ],
            };
            const result = 'text with *italic section* in it';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('strike', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: 'text with ',
                            },
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'strike',
                                    },
                                ],
                                text: 'striked section',
                            },
                            {
                                type: 'text',
                                text: ' in it',
                            },
                        ],
                    },
                ],
            };
            const result = 'text with ~~striked section~~ in it';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('code', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: 'text with some ',
                            },
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'code',
                                    },
                                ],
                                text: 'inline code',
                            },
                            {
                                type: 'text',
                                text: ' in it',
                            },
                        ],
                    },
                ],
            };
            const result = 'text with some `inline code` in it';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('combined', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: 'text with some ',
                            },
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'bold',
                                    },
                                    {
                                        type: 'italic',
                                    },
                                    {
                                        type: 'strike',
                                    },
                                ],
                                text: 'combined formatting section',
                            },
                            {
                                type: 'text',
                                text: ' in it',
                            },
                        ],
                    },
                ],
            };
            const result = 'text with some ~~***combined formatting section***~~ in it';
            expect(contentToMarkdown(content)).toEqual(result);
        });
    });
    describe('parses links', () => {
        it('without link text', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'mmLink',
                                        attrs: {
                                            href: 'http://www.mattermost.com',
                                            target: '_blank',
                                            class: null,
                                        },
                                    },
                                ],
                                text: 'www.mattermost.com',
                            },
                        ],
                    },
                ],
            };
            const result = '[www.mattermost.com](http://www.mattermost.com)';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('with custom link text', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'mmLink',
                                        attrs: {
                                            href: 'http://www.mattermost.com',
                                            target: '_blank',
                                            class: null,
                                        },
                                    },
                                ],
                                text: 'Mattermost',
                            },
                        ],
                    },
                ],
            };
            const result = '[Mattermost](http://www.mattermost.com)';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('with formatted link text', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                marks: [
                                    {
                                        type: 'mmLink',
                                        attrs: {
                                            href: 'http://www.mattermost.com',
                                            target: '_blank',
                                            class: null,
                                        },
                                    },
                                    {type: 'bold'},
                                ],
                                text: 'Mattermost',
                            },
                        ],
                    },
                ],
            };
            const result = '**[Mattermost](http://www.mattermost.com)**';
            expect(contentToMarkdown(content)).toEqual(result);
        });
    });
    describe('parses codeblocks', () => {
        it('without selected language', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'codeBlock',
                        attrs: {
                            language: null,
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'plain Text',
                            },
                        ],
                    },
                ],
            };
            const result = '```\nplain Text\n```';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('with selected language', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'codeBlock',
                        attrs: {
                            language: 'javascript',
                        },
                        content: [
                            {
                                type: 'text',
                                text: 'plain Text',
                            },
                        ],
                    },
                ],
            };
            const result = '```javascript\nplain Text\n```';
            expect(contentToMarkdown(content)).toEqual(result);
        });
    });
    describe('parses quotes', () => {
        it('with normal text, single line', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'blockquote',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: 'This is a quoted text',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = '> This is a quoted text';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('with normal text, multi line', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'blockquote',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: 'This is a quoted text',
                                    },
                                ],
                            },
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: 'with several lines',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = '> This is a quoted text\n> with several lines';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('with formatted text, single line', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'blockquote',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: 'some ',
                                    },
                                    {
                                        type: 'text',
                                        marks: [
                                            {
                                                type: 'bold',
                                            },
                                        ],
                                        text: 'bold',
                                    },
                                    {
                                        type: 'text',
                                        text: ', ',
                                    },
                                    {
                                        type: 'text',
                                        marks: [
                                            {
                                                type: 'italic',
                                            },
                                        ],
                                        text: 'italic',
                                    },
                                    {
                                        type: 'text',
                                        text: ', and ',
                                    },
                                    {
                                        type: 'text',
                                        marks: [
                                            {
                                                type: 'strike',
                                            },
                                        ],
                                        text: 'striked',
                                    },
                                    {
                                        type: 'text',
                                        text: ' text and a ',
                                    },
                                    {
                                        type: 'text',
                                        marks: [
                                            {
                                                type: 'mmLink',
                                                attrs: {
                                                    href: 'mattermost.com',
                                                    target: '_blank',
                                                    class: null,
                                                },
                                            },
                                        ],
                                        text: 'link',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = '> some **bold**, *italic*, and ~~striked~~ text and a [link](mattermost.com)';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('with formatted text, multi line', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'blockquote',
                        content: [
                            {
                                type: 'heading',
                                attrs: {
                                    level: 5,
                                },
                                content: [
                                    {
                                        type: 'text',
                                        text: 'QUOTE HEADLINE',
                                    },
                                ],
                            },
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: 'and some ',
                                    },
                                    {
                                        type: 'text',
                                        marks: [
                                            {
                                                type: 'bold',
                                            },
                                        ],
                                        text: 'bold',
                                    },
                                    {
                                        type: 'text',
                                        text: ', ',
                                    },
                                    {
                                        type: 'text',
                                        marks: [
                                            {
                                                type: 'italic',
                                            },
                                        ],
                                        text: 'italic',
                                    },
                                    {
                                        type: 'text',
                                        text: ', and ',
                                    },
                                    {
                                        type: 'text',
                                        marks: [
                                            {
                                                type: 'strike',
                                            },
                                        ],
                                        text: 'striked',
                                    },
                                    {
                                        type: 'text',
                                        text: ' text and a ',
                                    },
                                    {
                                        type: 'text',
                                        marks: [
                                            {
                                                type: 'mmLink',
                                                attrs: {
                                                    href: 'mattermost.com',
                                                    target: '_blank',
                                                    class: null,
                                                },
                                            },
                                        ],
                                        text: 'link',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = '> ##### QUOTE HEADLINE\n\n> and some **bold**, *italic*, and ~~striked~~ text and a [link](mattermost.com)';
            expect(contentToMarkdown(content)).toEqual(result);
        });
    });
    describe('parses unordered lists', () => {
        it('with normal text', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'bulletList',
                        content: [
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'item 1',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'item 2',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'item 3',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = '- item 1\n- item 2\n- item 3';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('with formatted text', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'bulletList',
                        content: [
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    {
                                                        type: 'bold',
                                                    },
                                                ],
                                                text: 'item 1',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    {
                                                        type: 'italic',
                                                    },
                                                ],
                                                text: 'item 2',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    {
                                                        type: 'strike',
                                                    },
                                                ],
                                                text: 'item 3',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = '- **item 1**\n- *item 2*\n- ~~item 3~~';
            expect(contentToMarkdown(content)).toEqual(result);
        });
    });
    describe('parses ordered lists', () => {
        it('with normal text, starting at 1', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'orderedList',
                        attrs: {
                            start: 1,
                        },
                        content: [
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'item 1',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'item 2',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'item 3',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = '1. item 1\n2. item 2\n3. item 3';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('with normal text, starting at 23', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'orderedList',
                        attrs: {
                            start: 23,
                        },
                        content: [
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'item 1',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'item 2',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                text: 'item 3',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = '23. item 1\n24. item 2\n25. item 3';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('with formatted text, starting at 1', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'orderedList',
                        attrs: {
                            start: 1,
                        },
                        content: [
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    {
                                                        type: 'bold',
                                                    },
                                                ],
                                                text: 'item 1',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    {
                                                        type: 'italic',
                                                    },
                                                ],
                                                text: 'item 2',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    {
                                                        type: 'strike',
                                                    },
                                                ],
                                                text: 'item 3',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    {
                                                        type: 'mmLink',
                                                        attrs: {
                                                            href: 'mattermost.com',
                                                            target: '_blank',
                                                            class: null,
                                                        },
                                                    },
                                                ],
                                                text: 'link',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = '1. **item 1**\n2. *item 2*\n3. ~~item 3~~\n4. [link](mattermost.com)';
            expect(contentToMarkdown(content)).toEqual(result);
        });
        it('with formatted text, starting at 49', () => {
            const content = {
                type: 'doc',
                content: [
                    {
                        type: 'orderedList',
                        attrs: {
                            start: 49,
                        },
                        content: [
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    {
                                                        type: 'bold',
                                                    },
                                                ],
                                                text: 'item 1',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    {
                                                        type: 'italic',
                                                    },
                                                ],
                                                text: 'item 2',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    {
                                                        type: 'strike',
                                                    },
                                                ],
                                                text: 'item 3',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                type: 'listItem',
                                content: [
                                    {
                                        type: 'paragraph',
                                        content: [
                                            {
                                                type: 'text',
                                                marks: [
                                                    {
                                                        type: 'mmLink',
                                                        attrs: {
                                                            href: 'mattermost.com',
                                                            target: '_blank',
                                                            class: null,
                                                        },
                                                    },
                                                ],
                                                text: 'link',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const result = '49. **item 1**\n50. *item 2*\n51. ~~item 3~~\n52. [link](mattermost.com)';
            expect(contentToMarkdown(content)).toEqual(result);
        });
    });

    // TODO: add tests for tables
});
