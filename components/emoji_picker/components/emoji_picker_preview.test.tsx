// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {SystemEmoji, CustomEmoji} from 'mattermost-redux/types/emojis';

import EmojiPickerPreview from './emoji_picker_preview';

describe('components/EmojiPicker/components/EmojiPickerPreview', () => {
    it('should match snapshot with no emoji', () => {
        const wrapper = shallow(<EmojiPickerPreview/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with system emoji', () => {
        const emoji: SystemEmoji = {
            id: '',
            name: '',
            aliases: ['grinning'],
            category: 'people',
            filename: '1f600',
            batch: 1,
        };
        const wrapper = shallow(<EmojiPickerPreview emoji={emoji}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with custom emoji', () => {
        const emoji: CustomEmoji = {
            id: 'c4d3e4c85frmbfpirk3ctr7opw',
            name: 'test',
            creator_id: 'TEST_USER_ID',
            create_at: 0,
            update_at: 0,
            delete_at: 0,
        };
        const wrapper = shallow(<EmojiPickerPreview emoji={emoji}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
