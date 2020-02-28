// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';
import {IntlProvider} from 'react-intl';

import EmojiPickerSearchInput from './emoji_picker_search_input';

describe('components/EmojiPicker/components/EmojiPickerSearchInput', () => {
    it('should match snapshot', () => {
        const wrapper = mount(
            <IntlProvider
                locale='en'
                messages={{}}
            >
                <EmojiPickerSearchInput/>
            </IntlProvider>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
