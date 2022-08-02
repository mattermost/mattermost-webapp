// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {shallow} from 'enzyme';
import React from 'react';

import CodeBlock from './code_block';

describe('codeBlock', () => {
    const postId = 'randompostid';

    test('should render typescript code block', () => {
        const language = 'typescript';
        const input = `\`\`\`${language}
const myFunction = () => {
    console.log('This is a meaningful function');
};
\`\`\`
`;

        const wrapper = shallow(
            <CodeBlock
                id={postId}
                code={input}
                language={language}
            />,
        );

        const languageHeader = wrapper.find('span.post-code__language').text();
        const lineNumbersDiv = wrapper.find('.post-code__line-numbers').exists();

        expect(languageHeader).toEqual('TypeScript');
        expect(lineNumbersDiv).toBeTruthy();

        expect(wrapper).toMatchSnapshot();
    });

    test('should render html code block with proper indentation', () => {
        const language = 'html';
        const input = `\`\`\`${language}
<div className='myClass'>
  <a href='https://randomgibberishurl.com'>ClickMe</a>
</div>
\`\`\`
`;

        const wrapper = shallow(
            <CodeBlock
                id={postId}
                code={input}
                language={language}
            />,
        );

        const languageHeader = wrapper.find('span.post-code__language').text();
        const lineNumbersDiv = wrapper.find('.post-code__line-numbers').exists();

        expect(languageHeader).toEqual('HTML, XML');
        expect(lineNumbersDiv).toBeTruthy();
        expect(wrapper).toMatchSnapshot();
    });

    test('should render unknown language', () => {
        const language = 'unknownLanguage';
        const input = `\`\`\`${language}
this is my unknown language
it shouldn't highlight, it's just garbage
\`\`\`
`;

        const wrapper = shallow(
            <CodeBlock
                id={postId}
                code={input}
                language={language}
            />,
        );

        const languageHeader = wrapper.find('span.post-code__language').exists();
        const lineNumbersDiv = wrapper.find('.post-code__line-numbers').exists();

        expect(languageHeader).toBeFalsy();
        expect(lineNumbersDiv).toBeFalsy();
        expect(wrapper).toMatchSnapshot();
    });
});
