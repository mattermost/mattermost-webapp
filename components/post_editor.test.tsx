// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as React from 'react';
import {render, cleanup, fireEvent} from '@testing-library/react';

import PostEditor from './post_editor';

const mockImageUrl = 'http://an-image';
jest.mock('mattermost-redux/utils/emoji_utils', () => ({
    getEmojiImageUrl: () => mockImageUrl,
}));

describe('components/post_editor', () => {
    beforeEach(() => {
        cleanup();
        console.error = jest.fn();
    });

    const placeholder = 'some placeholder text';

    const createEmojiHtml = (text: string, name: string) =>
        `<span data-emoticon="${name}" contenteditable="false"><span alt="${text}" class="emoticon" title="${text}" style="height: inherit; min-height: inherit"><img style="height: 18px" src="${mockImageUrl}"></span><span style="display:none">${text}</span></span><span></span>`;

    const defaultProps = {
        emojiMap: {get: () => ({})} as any,
        placeholder,
    };

    it('should render the placeholder when value is empty', async () => {
        const {findByText} = render(<PostEditor {...defaultProps}/>);
        const placeholderElement = await findByText(placeholder);

        expect(placeholderElement.textContent).toEqual(placeholder);
    });

    it('should not render the placeholder when value is not empty', async () => {
        const propsWithValue = {...defaultProps, value: 'hello world'};
        const {queryByText} = render(<PostEditor {...propsWithValue}/>);
        const placeholderElement = await queryByText(placeholder);

        expect(placeholderElement).toBeNull();
    });

    describe('should render value', () => {
        [
            {description: 'with no emoji', value: 'hello world', expectedHtml: 'hello world'},
            {description: 'with emoji at the end', value: 'hello world :smile:', expectedHtml: `hello world ${createEmojiHtml(':smile:', 'smile')}`},
            {description: 'with emoji at the beginning', value: ':smile: hello world', expectedHtml: `${createEmojiHtml(':smile:', 'smile')} hello world`},
            {description: 'with emoji in the middle', value: 'hello :smile: world', expectedHtml: `hello ${createEmojiHtml(':smile:', 'smile')} world`},
            {description: 'with emoji from pattern when followed by space', value: ':-) ', expectedHtml: `${createEmojiHtml(':-)', 'slightly_smiling_face')} `},
            {description: 'with emoji from pattern when not followed by space', value: ':-)', expectedHtml: ':-)'},
            {description: 'with emoji text from pattern not surrounded by spaces', value: 'hello:-)world', expectedHtml: 'hello:-)world'},
        ].
            forEach(({description, value, expectedHtml}) => {
                it(description, async () => {
                    const propsWithValue = {...defaultProps, value};
                    const {findByLabelText} = render(<PostEditor {...propsWithValue}/>);
                    const editor = await findByLabelText(placeholder);

                    expect(editor.innerHTML).toEqual(expectedHtml);
                });
            });
    });
});