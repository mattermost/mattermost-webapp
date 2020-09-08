// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';

import TextCardWithAction from './text_card_with_action';

describe('components/next_steps_view/steps/setup_preferences_step', () => {
    const props = {
        cardBodyMessageId: 'test-id',
        cardBodyDefaultMessage: 'This is a test card body message',
        buttonMessageId: 'test-button-id',
        buttonDefaultMessage: 'this is test button text',
        onClick: () => {},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<TextCardWithAction {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
