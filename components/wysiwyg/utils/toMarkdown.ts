// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {fromHtml} from 'hast-util-from-html';
import {toMdast} from 'hast-util-to-mdast';
import {toMarkdown} from 'mdast-util-to-markdown';

// extension for github flavored markdown
import {gfmToMarkdown} from 'mdast-util-gfm';

import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const markdownToHtml = (markdown: string) => unified().
    use(remarkParse).
    use(remarkGfm).
    use(remarkRehype).
    use(rehypeStringify).
    processSync(markdown);

const htmlToMarkdown = (html: string) => {
    return toMarkdown(toMdast(fromHtml(html)), {extensions: [gfmToMarkdown()]});
};

export {htmlToMarkdown, markdownToHtml};
