// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import * as Utils from 'utils/utils.jsx';

import Toast from './toast.jsx';

describe('components/Toast', () => {
    const defaultProps = {
        onClick: jest.fn(),
        show: true,
        showActions: true,
        onClickMessage: Utils.localizeMessage('postlist.toast.scrollToBottom', 'Jump to recents'),
        width: 1000,
    };

    test('should match snapshot for showing toast', () => {
        const wrapper = shallow(<Toast {...defaultProps}><span>{'child'}</span></Toast>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for hiding toast', () => {
        const wrapper = shallow(<Toast {...{...defaultProps, show: false}}><span>{'child'}</span></Toast>);
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.toast__visible').length).toBe(0);
    });

    test('should match snapshot for toast width less than 780px', () => {
        const wrapper = shallow(<Toast {...{...defaultProps, width: 779}}><span>{'child'}</span></Toast>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot to not have actions', () => {
        const wrapper = shallow(<Toast {...{...defaultProps, showActions: false}}><span>{'child'}</span></Toast>);
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('.toast__pointer').length).toBe(0);
    });

    test('should dismiss', () => {
        defaultProps.onDismiss = jest.fn();

        const wrapper = mountWithIntl(<Toast {... defaultProps}><span>{'child'}</span></Toast>);
        const toast = wrapper.find(Toast).instance();

        toast.handleDismiss();
        expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    test('should match snapshot to have extraClasses', () => {
        const wrapper = shallow(<Toast {...{...defaultProps, extraClasses: 'extraClasses'}}><span>{'child'}</span></Toast>);
        expect(wrapper).toMatchSnapshot();
    });
});
