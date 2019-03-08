// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import messageHtmlToComponent from 'utils/message_html_to_component';
import * as TextFormatting from 'utils/text_formatting';

describe('messageHtmlToComponent', () => {
    test('plain text', () => {
        const input = 'Hello, world!';
        const html = TextFormatting.formatText(input);

        expect(messageHtmlToComponent(html)).toMatchSnapshot();
    });

    test('latex', () => {
        const input = `This is some latex!
\`\`\`latex
x^2 + y^2 = z^2
\`\`\`

\`\`\`latex
F_m - 2 = F_0 F_1 \\dots F_{m-1}
\`\`\`

That was some latex!`;
        const html = TextFormatting.formatText(input);

        expect(messageHtmlToComponent(html)).toMatchSnapshot();
    });

    test('link without enabled tooltip plugins', () => {
        const input = 'lorem ipsum www.dolor.com sit amet';
        const html = TextFormatting.formatText(input);

        expect(messageHtmlToComponent(html)).toMatchSnapshot();
    });

    test('link with enabled a tooltip plugin', () => {
        const input = 'lorem ipsum www.dolor.com sit amet';
        const html = TextFormatting.formatText(input);

        expect(messageHtmlToComponent(html, false, {hasPluginTooltips: true})).toMatchSnapshot();
    });
});
