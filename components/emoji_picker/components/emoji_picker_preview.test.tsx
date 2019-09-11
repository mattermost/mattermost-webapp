// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import EmojiPickerPreview, {SystemEmoji, CustomEmoji} from './emoji_picker_preview';

describe('components/EmojiPicker/components/EmojiPickerPreview', () => {
    it('should match snapshot with no emoji', () => {
        const wrapper = shallow(<EmojiPickerPreview/>);
        expect(wrapper).toMatchSnapshot();
    })

    it('should match snapshot with system emoji', () => {
        const emoji: SystemEmoji = {
            aliases: ['grinning'],
            category: 'people',
            batch: '1',
            filename: '1f600',
            offset: null,
            visible: false,
        };
        const wrapper = shallow(<EmojiPickerPreview emoji={emoji}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with custom emoji', () => {
        const emoji: CustomEmoji = {
            aliases: ['test'],
            category: 'custom',
            filename: 'c4d3e4c85frmbfpirk3ctr7opw',
            id: 'c4d3e4c85frmbfpirk3ctr7opw',
            name: 'test',
            offset: null,
            visible: false,
        };
        const wrapper = shallow(<EmojiPickerPreview emoji={emoji}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
