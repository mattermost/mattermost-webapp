// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format} from './index';

describe('format', () => {
    test('should highlight code without space before language', () => {
        const output = format(`~~~diff
- something
+ something else
~~~`);

        expect(output).toContain('<span class="post-code__language">Diff</span>');
    });

    test('should highlight code with space before language', () => {
        const output = format(`~~~ diff
- something
+ something else
~~~`);

        expect(output).toContain('<span class="post-code__language">Diff</span>');
    });

    test('should not highlight code with an invalid language', () => {
        const output = format(`~~~garbage
~~~`);

        expect(output).not.toContain('<span class="post-code__language">');
    });

    describe('lists', () => {
        test('unordered lists should not include a start index', () => {
            const input = `- a
- b
- c`;
            const expected = `<ul className="markdown__list">
<li><span>a</span></li><li><span>b</span></li><li><span>c</span></li></ul>`;

            const output = format(input);
            expect(output).toBe(expected);
        });

        test('ordered lists starting at 1 should include a start index', () => {
            const input = `1. a
2. b
3. c`;
            const expected = `<ol className="markdown__list" style="counter-reset: list 0">
<li><span>a</span></li><li><span>b</span></li><li><span>c</span></li></ol>`;

            const output = format(input);
            expect(output).toBe(expected);
        });

        test('ordered lists starting at 0 should include a start index', () => {
            const input = `0. a
1. b
2. c`;
            const expected = `<ol className="markdown__list" style="counter-reset: list -1">
<li><span>a</span></li><li><span>b</span></li><li><span>c</span></li></ol>`;

            const output = format(input);
            expect(output).toBe(expected);
        });

        test('ordered lists starting at any other number should include a start index', () => {
            const input = `999. a
1. b
1. c`;
            const expected = `<ol className="markdown__list" style="counter-reset: list 998">
<li><span>a</span></li><li><span>b</span></li><li><span>c</span></li></ol>`;

            const output = format(input);
            expect(output).toBe(expected);
        });
    });

    test('should wrap code without a language tag', () => {
        const output = format(`~~~
this is long text this is long text this is long text this is long text this is long text this is long text
~~~`);

        expect(output).toContain('post-code--wrap');
    });

    test('should not wrap code with a valid language tag', () => {
        const output = format(`~~~java
this is long text this is long text this is long text this is long text this is long text this is long text
~~~`);

        expect(output).not.toContain('post-code--wrap');
    });

    test('should not wrap code with an invalid language', () => {
        const output = format(`~~~nowrap
this is long text this is long text this is long text this is long text this is long text this is long text
~~~`);

        expect(output).not.toContain('post-code--wrap');
    });

    test('should highlight code with Tex highlighting without rendering', () => {
        const output = format(`~~~texcode
\\sqrt{x * y + 2}
~~~`);

        expect(output).toContain('<span class="post-code__language">TeX</span>');
    });

    test('should add line numbers to code', () => {
        const output = format(`~~~diff
- something
+ something else
~~~`);

        expect(output).toContain('<div class="post-code__line-numbers">1\n2</div>');
    });

    test('should generate valid HTML for code blocks with line numbers', () => {
        const output = format(`\`\`\`python
    op.execute("""
        UPDATE events.settings
        SET name = 'paper_review_conditions'
        WHERE module = 'editing' AND name = 'review_conditions'
    """)
\`\`\``);

        const div = document.createElement('div');
        div.innerHTML = output;

        // The HTML is valid as long as no new HTML tags have been injected. Unescaped characters are fine though.
        expect(div.innerHTML).toBe(output.replace(/&quot;&quot;&quot;/g, '"""').replace(/&#x27;/g, '\''));
    });

    test('<a> should contain target=_blank for external links', () => {
        const output = format('[external_link](http://example.com)', {siteURL: 'http://localhost'});

        expect(output).toContain('<a class="theme markdown__link" href="http://example.com" rel="noreferrer" target="_blank">external_link</a>');
    });

    test('<a> should not contain target=_blank for internal links', () => {
        const output = format('[internal_link](http://localhost/example)', {siteURL: 'http://localhost'});

        expect(output).toContain('<a class="theme markdown__link" href="http://localhost/example" rel="noreferrer" data-link="/example">internal_link</a>');
    });

    test('<a> should not contain target=_blank for pl|channels|messages links', () => {
        const pl = format('[thread](/reiciendis-0/pl/b3hrs3brjjn7fk4kge3xmeuffc))', {siteURL: 'http://localhost'});
        expect(pl).toContain('<a class="theme markdown__link" href="/reiciendis-0/pl/b3hrs3brjjn7fk4kge3xmeuffc" rel="noreferrer" data-link="/reiciendis-0/pl/b3hrs3brjjn7fk4kge3xmeuffc">thread</a>');

        const channels = format('[thread](/reiciendis-0/channels/b3hrs3brjjn7fk4kge3xmeuffc))', {siteURL: 'http://localhost'});
        expect(channels).toContain('<a class="theme markdown__link" href="/reiciendis-0/channels/b3hrs3brjjn7fk4kge3xmeuffc" rel="noreferrer" data-link="/reiciendis-0/channels/b3hrs3brjjn7fk4kge3xmeuffc">thread</a>');

        const messages = format('[thread](/reiciendis-0/messages/b3hrs3brjjn7fk4kge3xmeuffc))', {siteURL: 'http://localhost'});
        expect(messages).toContain('<a class="theme markdown__link" href="/reiciendis-0/messages/b3hrs3brjjn7fk4kge3xmeuffc" rel="noreferrer" data-link="/reiciendis-0/messages/b3hrs3brjjn7fk4kge3xmeuffc">thread</a>');
    });
});
