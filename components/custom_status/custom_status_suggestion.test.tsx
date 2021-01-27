// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {shallow} from 'enzyme';
import React from 'react';

import CustomStatusSuggestion from './custom_status_suggestion';

describe('components/custom_status/custom_status_emoji', () => {
    const baseProps = {
        handleSuggestionClick: jest.fn(),
        emoji: '',
        text: '',
        handleClear: jest.fn(),
    };

    it('should match snapshot', () => {
        const wrapper = shallow(
            <CustomStatusSuggestion {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
