// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount, shallow} from 'enzyme';

import EmojiPickerCategory, {EmojiPickerCategoryProps} from './emoji_picker_category';

describe('components/EmojiPicker/components/EmojiPickerCategory', () => {
    const baseProps: EmojiPickerCategoryProps = {
        category: 'people',
        icon: <span>ICON TEST</span>,
        selected: true,
        enable: true,
        onCategoryClick: jest.fn(),
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<EmojiPickerCategory {...baseProps} />);
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when selected=false', () => {
        const wrapper = shallow(
            <EmojiPickerCategory {...baseProps} selected={false} />
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when enable=false', () => {
        const wrapper = shallow(
            <EmojiPickerCategory {...baseProps} enable={false} />
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should calls onClickCategory with category', () => {
        const expectedCategory = 'custom';
        const mockOnClickCategory = jest.fn();
        const mockEventObject = {preventDefault: jest.fn()};
        const wrapper = shallow(
            <EmojiPickerCategory
                {...baseProps}
                category={expectedCategory}
                onCategoryClick={mockOnClickCategory}
            />
        );
        wrapper.find('a').simulate('click', mockEventObject);

        expect(mockEventObject.preventDefault).toHaveBeenCalled();
        expect(mockOnClickCategory).toHaveBeenCalledWith(expectedCategory);
    });
});
