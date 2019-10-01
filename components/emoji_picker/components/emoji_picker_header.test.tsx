// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import EmojiPickerHeader from 'components/emoji_picker/components/emoji_picker_header';

describe('components/emoji_picker/components/EmojiPickerHeader', () => {
    test('should match snapshot, ', () => {
        const props = {
            onClickClose: jest.fn(),
        };

        const wrapper = shallow(
            <EmojiPickerHeader {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
    test('onClickClose, should have called props.onClickClose', () => {
        const props = {
            onClickClose: jest.fn(),
        };

        const wrapper = shallow(
            <EmojiPickerHeader {...props}/>
        );

        expect(wrapper).toMatchSnapshot();

        wrapper.find('button').first().simulate('click');
        expect(props.onClickClose).toHaveBeenCalledTimes(1);
    });
});
