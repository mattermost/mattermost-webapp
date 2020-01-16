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
