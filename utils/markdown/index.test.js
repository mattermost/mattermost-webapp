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
        expect(output).toContain("<div class=\"post-code\"><span class=\"post-code__language\">Diff</span><code class=\"hljs\"><div><span class='hljs-ln-numbers'>1</span><span class='hljs-code'><span class=\"hljs-deletion\">- something</span></span></div><div><span class='hljs-ln-numbers'>2</span><span class='hljs-code'><span class=\"hljs-addition\">+ something else</span></span></div></code></div>");
    });

    test('should highlight code with space before language', () => {
        const output = format(`~~~ diff
- something
+ something else
~~~`);

        expect(output).toContain('<span class="post-code__language">Diff</span>');
        expect(output).toContain("<div class=\"post-code\"><span class=\"post-code__language\">Diff</span><code class=\"hljs\"><div><span class='hljs-ln-numbers'>1</span><span class='hljs-code'><span class=\"hljs-deletion\">- something</span></span></div><div><span class='hljs-ln-numbers'>2</span><span class='hljs-code'><span class=\"hljs-addition\">+ something else</span></span></div></code></div>");
    });

    test('should not highlight code with an invalid language', () => {
        const output = format(`~~~garbage
~~~`);

        expect(output).not.toContain('<span class="post-code__language">');
    });
});
