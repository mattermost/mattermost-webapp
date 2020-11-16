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

    test('<a> should contain target=_blank for internal links that live under /plugins', () => {
        const output = format('[internal_link](http://localhost/plugins/example)', {siteURL: 'http://localhost'});

        expect(output).toContain('<a class="theme markdown__link" href="http://localhost/plugins/example" rel="noreferrer" target="_blank">internal_link</a>');
    });

    test('<a> should contain target=_blank for internal links that are files', () => {
        const output = format('http://localhost/files/o6eujqkmjfd138ykpzmsmc131y/public?h=j5nPX8JlgUeNVMOB3dLXwyG_jlxlSw4nSgZmegXfpHw', {siteURL: 'http://localhost'});

        expect(output).toContain('<a class="theme markdown__link" href="http://localhost/files/o6eujqkmjfd138ykpzmsmc131y/public?h=j5nPX8JlgUeNVMOB3dLXwyG_jlxlSw4nSgZmegXfpHw" rel="noreferrer" target="_blank">http://localhost/files/o6eujqkmjfd138ykpzmsmc131y/public?h=j5nPX8JlgUeNVMOB3dLXwyG_jlxlSw4nSgZmegXfpHw</a>');
    });

    test('<a> should not contain target=_blank for pl|channels|messages links', () => {
        const pl = format('[thread](/reiciendis-0/pl/b3hrs3brjjn7fk4kge3xmeuffc))', {siteURL: 'http://localhost'});
        expect(pl).toContain('<a class="theme markdown__link" href="/reiciendis-0/pl/b3hrs3brjjn7fk4kge3xmeuffc" rel="noreferrer" data-link="/reiciendis-0/pl/b3hrs3brjjn7fk4kge3xmeuffc">thread</a>');

        const channels = format('[thread](/reiciendis-0/channels/b3hrs3brjjn7fk4kge3xmeuffc))', {siteURL: 'http://localhost'});
        expect(channels).toContain('<a class="theme markdown__link" href="/reiciendis-0/channels/b3hrs3brjjn7fk4kge3xmeuffc" rel="noreferrer" data-link="/reiciendis-0/channels/b3hrs3brjjn7fk4kge3xmeuffc">thread</a>');

        const messages = format('[thread](/reiciendis-0/messages/b3hrs3brjjn7fk4kge3xmeuffc))', {siteURL: 'http://localhost'});
        expect(messages).toContain('<a class="theme markdown__link" href="/reiciendis-0/messages/b3hrs3brjjn7fk4kge3xmeuffc" rel="noreferrer" data-link="/reiciendis-0/messages/b3hrs3brjjn7fk4kge3xmeuffc">thread</a>');

        const plugin = format('[plugin](/reiciendis-0/plugins/example))', {siteURL: 'http://localhost'});
        expect(plugin).toContain('<a class="theme markdown__link" href="/reiciendis-0/plugins/example" rel="noreferrer" data-link="/reiciendis-0/plugins/example">plugin</a>');
    });

    describe('should correctly open links in the current tab based on whether they are handled by the web app', () => {
        for (const testCase of [
            {name: 'regular link', link: 'https://example.com', handled: false},
            {name: 'www link', link: 'www.example.com', handled: false},

            {name: 'link to a channel', link: 'http://localhost/team/channels/foo', handled: true},
            {name: 'link to a DM', link: 'http://localhost/team/messages/@bar', handled: true},
            {name: 'link to the system console', link: 'http://localhost/admin_console', handled: true},
            {name: 'permalink', link: 'http://localhost/reiciendis-0/pl/b3hrs3brjjn7fk4kge3xmeuffc', handled: true},
            {name: 'link to a specific system console page', link: 'http://localhost/admin_console/plugins/plugin_com.github.matterpoll.matterpoll', handled: true},

            {name: 'relative link', link: '/', handled: true},
            {name: 'relative link to a channel', link: '/reiciendis-0/channels/b3hrs3brjjn7fk4kge3xmeuffc', handled: true},
            {name: 'relative link to a DM', link: '/reiciendis-0/messages/b3hrs3brjjn7fk4kge3xmeuffc', handled: true},
            {name: 'relative permalink', link: '/reiciendis-0/pl/b3hrs3brjjn7fk4kge3xmeuffc', handled: true},
            {name: 'relative link to the system console', link: '/admin_console', handled: true},
            {name: 'relative link to a specific system console page', link: '/admin_console/plugins/plugin_com.github.matterpoll.matterpoll', handled: true},

            {name: 'link to a plugin-handled path', link: 'http://localhost/plugins/example', handled: false},
            {name: 'link to a file attachment public link', link: 'http://localhost/files/o6eujqkmjfd138ykpzmsmc131y/public?h=j5nPX8JlgUeNVMOB3dLXwyG_jlxlSw4nSgZmegXfpHw', handled: false},

            {name: 'relative link to a plugin-handled path', link: '/plugins/example', handled: false},
            {name: 'relative link to a file attachment public link', link: '/files/o6eujqkmjfd138ykpzmsmc131y/public?h=j5nPX8JlgUeNVMOB3dLXwyG_jlxlSw4nSgZmegXfpHw', handled: false},

            {name: 'link to a managed resource', link: 'http://localhost/trusted/jitsi', options: {managedResourcePaths: ['trusted']}, handled: false},
            {name: 'relative link to a managed resource', link: '/trusted/jitsi', options: {managedResourcePaths: ['trusted']}, handled: false},
            {name: 'link that is not to a managed resource', link: 'http://localhost/trusted/jitsi', options: {managedResourcePaths: ['jitsi']}, handled: true},
        ]) {
            test(testCase.name, () => {
                const options = {
                    siteURL: 'http://localhost',
                    ...testCase.options,
                };
                const output = format(`[link](${testCase.link})`, options);

                if (testCase.handled) {
                    expect(output).not.toContain('target="_blank"');
                } else {
                    expect(output).toContain('rel="noreferrer" target="_blank"');
                }
            });
        }
    });
});
