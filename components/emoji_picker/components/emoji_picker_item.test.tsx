// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlProvider} from 'react-intl';
import {mount} from 'enzyme';

import EmojiPickerItem, {EmojiPickerItemProps} from './emoji_picker_item';

describe.skip('components/EmojiPicker/components/EmojiPickerItem', () => {
    const intlProviderProps = {
        locale: 'en',
        messages: {},
    };

    const baseProps: EmojiPickerItemProps = {
        emoji: {
            id: '',
            name: '',
            aliases: ['grinning'],
            category: 'people',
            batch: 1,
            filename: '1f600',
        },
        isSelected: true,
        onItemClick: jest.fn(),
    };

    it('should match snapshot', () => {
        const wrapper = mount(
            <IntlProvider {...intlProviderProps}>
                <EmojiPickerItem {...baseProps}/>
            </IntlProvider>
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when isSelected=false', () => {
        const wrapper = mount(
            <IntlProvider {...intlProviderProps}>
                <EmojiPickerItem
                    {...baseProps}
                    isSelected={false}
                />
            </IntlProvider>
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should calls onItemClick with emoji', () => {
        const mockOnItemClick = jest.fn();
        const wrapper = mount(
            <IntlProvider {...intlProviderProps}>
                <EmojiPickerItem
                    {...baseProps}
                    onItemClick={mockOnItemClick}
                />
            </IntlProvider>
        );
        wrapper.find('img').simulate('click');

        expect(mockOnItemClick).toHaveBeenCalledWith(baseProps.emoji);
    });
});
