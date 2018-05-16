// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import * as PostUtils from 'utils/post_utils.jsx';
import * as TextFormatting from 'utils/text_formatting.jsx';

jest.mock('mattermost-redux/client', () => {
    return {
        Client4: jest.fn(() => true),
    };
});

describe('PostUtils.containsAtChannel', function() {
    test('should return correct @all (same for @channel)', function() {
        for (const data of [
            {
                text: '',
                result: false,
            },
            {
                text: 'all',
                result: false,
            },
            {
                text: '@allison',
                result: false,
            },
            {
                text: '@ALLISON',
                result: false,
            },
            {
                text: '@all123',
                result: false,
            },
            {
                text: '123@all',
                result: false,
            },
            {
                text: 'hey@all',
                result: false,
            },
            {
                text: 'hey@all.com',
                result: false,
            },
            {
                text: '@all',
                result: true,
            },
            {
                text: '@ALL',
                result: true,
            },
            {
                text: '@all hey',
                result: true,
            },
            {
                text: 'hey @all',
                result: true,
            },
            {
                text: 'HEY @ALL',
                result: true,
            },
            {
                text: 'hey @all!',
                result: true,
            },
            {
                text: 'hey @all:+1:',
                result: true,
            },
            {
                text: 'hey @ALL:+1:',
                result: true,
            },
            {
                text: '`@all`',
                result: false,
            },
            {
                text: '@someone `@all`',
                result: false,
            },
            {
                text: '``@all``',
                result: false,
            },
            {
                text: '```@all```',
                result: false,
            },
            {
                text: '```\n@all\n```',
                result: false,
            },
            {
                text: '```````\n@all\n```````',
                result: false,
            },
            {
                text: '```code\n@all\n```',
                result: false,
            },
            {
                text: '~~~@all~~~',
                result: true,
            },
            {
                text: '~~~\n@all\n~~~',
                result: false,
            },
            {
                text: ' /not_cmd @all',
                result: true,
            },
            {
                text: '/cmd @all',
                result: false,
            },
            {
                text: '/cmd @all test',
                result: false,
            },
            {
                text: '/cmd test @all',
                result: false,
            },
            {
                text: '@channel',
                result: true,
            },
            {
                text: '@channel.',
                result: true,
            },
            {
                text: '@channel/test',
                result: true,
            },
            {
                text: 'test/@channel',
                result: true,
            },
            {
                text: '@all/@channel',
                result: true,
            },
            {
                text: '@cha*nnel*',
                result: false,
            },
            {
                text: '@cha**nnel**',
                result: false,
            },
            {
                text: '*@cha*nnel',
                result: false,
            },
            {
                text: '[@chan](https://google.com)nel',
                result: false,
            },
            {
                text: '@cha![](https://myimage)nnel',
                result: false,
            },
        ]) {
            const containsAtChannel = PostUtils.containsAtChannel(data.text);

            assert.equal(containsAtChannel, data.result, data.text);
        }
    });

    describe('messageHtmlToComponent', () => {
        test('plain text', () => {
            const input = 'Hello, world!';
            const html = TextFormatting.formatText(input);

            expect(PostUtils.messageHtmlToComponent(html)).toMatchSnapshot();
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

            expect(PostUtils.messageHtmlToComponent(html)).toMatchSnapshot();
        });
    });
});

describe('PostUtils.changeToJPGSrc', function() {
    test('should return correct for all gifv URLs', function() {
        for (const data of [
            {
                url: '',
                result: '',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.gifv',
                result: 'https://i.imgur.com/FY1AbSo.jpg',
            },
            {
                url: 'https://i.imgur.com/123123123.gifv',
                result: 'https://i.imgur.com/123123123.jpg',
            },
            {
                url: 'https://random.gifv',
                result: 'https://random.jpg',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.gif',
                result: 'https://i.imgur.com/FY1AbSo.gif',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.jpg',
                result: 'https://i.imgur.com/FY1AbSo.jpg',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.jpg',
                result: 'https://i.imgur.com/FY1AbSo.jpg',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.png',
                result: 'https://i.imgur.com/FY1AbSo.png',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.mkv',
                result: 'https://i.imgur.com/FY1AbSo.mkv',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo',
                result: 'https://i.imgur.com/FY1AbSo',
            },
            {
                url: 'https://i.imgur.com/FY1Agifv',
                result: 'https://i.imgur.com/FY1Agifv',
            },
            {
                url: 'https://i.imgur.com/FY1Agifva13',
                result: 'https://i.imgur.com/FY1Agifva13',
            },
            {
                url: 'https://i.gifv.com/FY1Agifva13',
                result: 'https://i.gifv.com/FY1Agifva13',
            },
        ]) {
            const JPGSrc = PostUtils.changeToJPGSrc(data.url, false);

            assert.equal(JPGSrc, data.result);
        }
    });
});

describe('PostUtils.changeToMp4Src', function() {
    test('should return correct for all gifv URLs', function() {
        for (const data of [
            {
                url: '',
                result: '',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.gifv',
                result: 'https://i.imgur.com/FY1AbSo.mp4',
            },
            {
                url: 'https://i.imgur.com/123123123.gifv',
                result: 'https://i.imgur.com/123123123.mp4',
            },
            {
                url: 'https://random.gifv',
                result: 'https://random.mp4',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.gif',
                result: 'https://i.imgur.com/FY1AbSo.gif',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.jpg',
                result: 'https://i.imgur.com/FY1AbSo.jpg',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.jpg',
                result: 'https://i.imgur.com/FY1AbSo.jpg',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.png',
                result: 'https://i.imgur.com/FY1AbSo.png',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo.mkv',
                result: 'https://i.imgur.com/FY1AbSo.mkv',
            },
            {
                url: 'https://i.imgur.com/FY1AbSo',
                result: 'https://i.imgur.com/FY1AbSo',
            },
            {
                url: 'https://i.imgur.com/FY1Agifv',
                result: 'https://i.imgur.com/FY1Agifv',
            },
            {
                url: 'https://i.imgur.com/FY1Agifva13',
                result: 'https://i.imgur.com/FY1Agifva13',
            },
            {
                url: 'https://i.gifv.com/FY1Agifva13',
                result: 'https://i.gifv.com/FY1Agifva13',
            },
        ]) {
            const Mp4Src = PostUtils.changeToMp4Src(data.url, false);

            assert.equal(Mp4Src, data.result);
        }
    });
});
