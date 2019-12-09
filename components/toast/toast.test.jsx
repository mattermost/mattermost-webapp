// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import Toast from './toast.jsx';

describe('components/Toast', () => {
    const defaultProps = {
        onClick: jest.fn(),
        show: true,
        showOnlyOnce: false,
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<Toast {... defaultProps}><span>{'child'}</span></Toast>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should dismiss', () => {
        defaultProps.onDismiss = jest.fn();

        const wrapper = mountWithIntl(<Toast {... defaultProps}><span>{'child'}</span></Toast>);
        const toast = wrapper.find(Toast).instance();

        toast.handleDismiss();
        expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });
});
