// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import EmojiMap from 'utils/emoji_map';

import EmojiPicker, {filterEmojiSearchInput} from 'components/emoji_picker/emoji_picker';

import EmojiPickerCategory from './components/emoji_picker_category';
import EmojiPickerCategorySection from './emoji_picker_category_section';

describe('components/emoji_picker/EmojiPicker', () => {
    jest.useFakeTimers();

    beforeEach(() => {
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => setTimeout(cb, 16));
    });

    afterEach(() => {
        window.requestAnimationFrame.mockRestore();
    });

    const testCases = [
        {input: 'smile', output: 'smile'},
        {input: 'SMILE', output: 'smile'},
        {input: ':smile', output: 'smile'},
        {input: ':SMILE', output: 'smile'},
        {input: 'smile:', output: 'smile'},
        {input: 'SMILE:', output: 'smile'},
        {input: ':smile:', output: 'smile'},
        {input: ':SMILE:', output: 'smile'},
    ];

    testCases.forEach((testCase) => {
        test(`'${testCase.input}' should return '${testCase.output}'`, () => {
            expect(filterEmojiSearchInput(testCase.input)).toEqual(testCase.output);
        });
    });

    const actions = {
        getCustomEmojis: jest.fn(),
        incrementEmojiPickerPage: jest.fn(),
        searchCustomEmojis: jest.fn(),
    };

    const customEmojis = new Map();
    customEmojis.set('smiley', {name: 'smiley'});

    const emojiMap = new Set();
    emojiMap.add({customEmojis});
    emojiMap.add({customEmojisArray: ['smiley']});

    const smiley = new Map();
    smiley.set('smiley', {fileName: '1f603', category: 'people', aliases: ['smiley']});

    emojiMap.add(smiley);

    const baseProps = {
        customEmojiPage: 1,
        customEmojisEnabled: true,
        listHeight: 245,
        onEmojiClick: jest.fn(),
        onEmojiClose: jest.fn(),
        emojiMap: new EmojiMap([]),
        recentEmojis: [],
        actions,
        filter: '',
        handleFilterChange: jest.fn(),
    };

    test('Recent category should not exist if there are no recent emojis', () => {
        const wrapper = shallow(
            <EmojiPicker {...baseProps}/>,
        );

        wrapper.instance().emojiPickerContainer = {
            offsetHeight: 200,
        };

        // Nine categories as there is no recent caterogry
        expect(wrapper.find(EmojiPickerCategory).length).toBe(9);
        expect(wrapper.find(EmojiPickerCategory).find({selected: true}).length).toBe(1);

        expect(wrapper.find(EmojiPickerCategorySection).length).toBe(1);
        expect(wrapper.find(EmojiPickerCategorySection).find({categoryName: 'people'}).length).toBe(1);
    });

    test('Recent category should exist if there are recent emojis', () => {
        const props = {
            ...baseProps,
            recentEmojis: [
                'smiley',
            ],
        };

        const wrapper = shallow(
            <EmojiPicker {...props}/>,
        );

        wrapper.instance().emojiPickerContainer = {
            offsetHeight: 200,
        };

        // 10 categories as there is recent caterogry
        expect(wrapper.find(EmojiPickerCategory).length).toBe(10);
        expect(wrapper.find(EmojiPickerCategory).find({selected: true}).length).toBe(1);
        expect(wrapper.find(EmojiPickerCategory).find({category: 'recent'}).length).toBe(1);

        expect(wrapper.find(EmojiPickerCategorySection).length).toBe(2);
        expect(wrapper.find(EmojiPickerCategorySection).find({categoryName: 'recent'}).length).toBe(1);
    });

    test('Update should have for all categories', async () => {
        const props = {
            ...baseProps,
            recentEmojis: [
                'smiley',
            ],
        };

        const wrapper = await shallow(
            <EmojiPicker {...props}/>,
        );

        wrapper.instance().emojiPickerContainer = {
            offsetHeight: 200,
        };

        //oveflow hidden to not show the scroll bar
        expect(wrapper.find('.emoji-picker__items').prop('style')).toStrictEqual({overflowY: 'hidden'});
        expect(wrapper.find(EmojiPickerCategorySection).length).toBe(2);

        jest.runOnlyPendingTimers();
        wrapper.update();
        jest.runOnlyPendingTimers();

        expect(wrapper.state('renderAllCategories')).toEqual(true);
        expect(wrapper.find(EmojiPickerCategorySection).length).toBe(10);

        //oveflow hidden to not show the scroll bar
        expect(wrapper.find('.emoji-picker__items').prop('style')).toStrictEqual({overflowY: 'auto'});
    });
});
