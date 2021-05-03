// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {CustomStatusDuration} from 'mattermost-redux/types/users';

import ExpiryMenu from './expiry_menu';

describe('components/custom_status/expiry_menu', () => {
    const baseProps = {
        expiry: CustomStatusDuration.DONT_CLEAR,
        handleExpiryChange: jest.fn(),
    };

    it('should match snapshot', () => {
        const wrapper = mountWithIntl(<ExpiryMenu {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot with different props', () => {
        baseProps.expiry = CustomStatusDuration.DATE_AND_TIME;
        const wrapper = mountWithIntl(<ExpiryMenu {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });
});
