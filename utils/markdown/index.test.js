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
        expect(output).toContain('<code class="hljs hljs-ln">');
    });

    test('should highlight code with space before language', () => {
        const output = format(`~~~ diff
- something
+ something else
~~~`);

        expect(output).toContain('<span class="post-code__language">Diff</span>');
        expect(output).toContain('<code class="hljs hljs-ln">');
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
});
