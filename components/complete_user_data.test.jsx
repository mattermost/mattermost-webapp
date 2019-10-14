// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import CompleteUserData from 'components/complete_user_data.jsx';

describe('components/CompleteUserData', () => {
    it('should match snapshot', () => {
        const wrapper = shallow(
            <CompleteUserData/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
