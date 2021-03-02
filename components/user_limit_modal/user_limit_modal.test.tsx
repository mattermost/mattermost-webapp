// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';

import UserLimitModal from './user_limit_modal';

describe('component/UserLimitModal', () => {
    const requiredProps = {
        show: true,
        actions: {
            closeModal: () => { },
            openModal: jest.fn(),
        },
    };

    test('should match snapshot without children', () => {
        const wrapper = shallow(<UserLimitModal {...requiredProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should not display when show is false', () => {
        const wrapper = shallow(
            <UserLimitModal
                {...requiredProps}
                show={false}
            />);
        expect(wrapper).toMatchSnapshot();
    });
});
