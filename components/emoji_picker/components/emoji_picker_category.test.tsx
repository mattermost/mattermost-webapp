// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {EmojiCategory} from '../utils';

import EmojiPickerCategory, {EmojiPickerCategoryProps} from './emoji_picker_category';

describe('components/EmojiPicker/components/EmojiPickerCategory', () => {
    const baseProps: EmojiPickerCategoryProps = {
        category: 'people',
        // eslint-disable-next-line react/jsx-no-literals
        selected: true,
        enable: true,
    };

    it.each([
        'activity',
        'custom',
        'flags',
        'foods',
        'nature',
        'objects',
        'people',
        'places',
        'recent',
        'symbols',
    ])('should match snapshot for %s', (category) => {
        const wrapper = shallow(
            <EmojiPickerCategory
                {...baseProps}
                category={category as EmojiCategory}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when selected=false', () => {
        const wrapper = shallow(
            <EmojiPickerCategory
                {...baseProps}
                selected={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when enable=false', () => {
        const wrapper = shallow(
            <EmojiPickerCategory
                {...baseProps}
                enable={false}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
