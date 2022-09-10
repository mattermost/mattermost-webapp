// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {CheckIcon} from '@mattermost/compass-icons/components';

import InfoToast from './info_toast';

describe('components/InfoToast', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <InfoToast
                actions={{closeModal: jest.fn()}}
                content={{message: 'A message'}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should close the toast on undo', () => {
        const closeModal = jest.fn();
        const wrapper = shallow(
            <InfoToast
                actions={{closeModal}}
                content={{message: 'A message', undo: jest.fn()}}
            />,
        );

        wrapper.find('button').simulate('click');

        expect(closeModal).toHaveBeenCalled();
    });

    test('should close the toast on timeout', () => {
        jest.useFakeTimers();

        const closeModal = jest.fn();
        shallow(
            <InfoToast
                actions={{closeModal}}
                content={{message: 'A message'}}
            />,
        );

        // setTimeout(() => {
        //     const activeSlide = wrapper.find('div.active-anim');
        //     const slide1Text = activeSlide.find('p.slide').text();
        //     expect(slide1Text).toEqual('Second Slide');
        //     done();
        // }, 1000);

        jest.runAllTimers();

        expect(closeModal).toHaveBeenCalled();
    });

    test('should close the toast on close button click', () => {
        const closeModal = jest.fn();
        const wrapper = shallow(
            <InfoToast
                actions={{closeModal}}
                content={{message: 'A message'}}
            />,
        );

        wrapper.find('.info-toast__icon_button').simulate('click');

        expect(closeModal).toHaveBeenCalled();
    });

    test('should match snapshot with icon', () => {
        const wrapper = shallow(
            <InfoToast
                actions={{closeModal: jest.fn()}}
                content={{message: 'A message', icon: <CheckIcon/>}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with undo', () => {
        const wrapper = shallow(
            <InfoToast
                actions={{closeModal: jest.fn()}}
                content={{message: 'A message', undo: jest.fn()}}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with className', () => {
        const wrapper = shallow(
            <InfoToast
                actions={{closeModal: jest.fn()}}
                content={{message: 'A message'}}
                className='className'
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
