// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl, mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import Toast from './toast.jsx';

describe('components/Toast', () => {
    const defaultProps = {
        onClick: jest.fn(),
        show: true,
        showOnlyOnce: false,
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(<Toast {... defaultProps}><span>{'child'}</span></Toast>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should click', () => {
        const wrapper = mountWithIntl(<Toast {... defaultProps}><span>{'child'}</span></Toast>);
        const toast = wrapper.find(Toast).instance();

        toast.handleClick();
        expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });

    test('should dismiss', () => {
        defaultProps.onDismiss = jest.fn();

        const wrapper = mountWithIntl(<Toast {... defaultProps}><span>{'child'}</span></Toast>);
        const toast = wrapper.find(Toast).instance();

        toast.handleDismiss();
        expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    test('should hide', () => {
        defaultProps.showOnlyOnce = true;

        const wrapper = mountWithIntl(<Toast {... defaultProps}><span>{'child'}</span></Toast>);
        const toast = wrapper.find(Toast).instance();
        expect(toast.state.hide).toEqual(false);
        toast.handleDismiss();
        expect(toast.state.hide).toEqual(true);
    });

    test('should never show', () => {
        defaultProps.showOnlyOnce = true;
        defaultProps.show = false;

        const wrapper = mountWithIntl(<Toast {... defaultProps}><span>{'child'}</span></Toast>);
        const toast = wrapper.find(Toast).instance();
        expect(toast.state.hide).toEqual(true);
    });
});
