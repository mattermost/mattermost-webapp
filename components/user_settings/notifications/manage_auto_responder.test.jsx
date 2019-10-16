// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import ManageAutoResponder from 'components/user_settings/notifications/manage_auto_responder.jsx';

describe('components/user_settings/notifications/ManageAutoResponder', () => {
    const mockStore = configureStore();
    const requiredProps = {
        autoResponderActive: false,
        autoResponderMessage: 'Hello World!',
        updateSection: jest.fn(),
        setParentState: jest.fn(),
        submit: jest.fn(),
        saving: false,
        error: '',
    };

    test('should match snapshot, default disabled', () => {
        const wrapper = mountWithIntl(<Provider store={mockStore({})}><ManageAutoResponder {...requiredProps}/></Provider>);

        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find('#autoResponderActive').exists()).toBe(true);
        expect(wrapper.find('#autoResponderMessage').exists()).toBe(false);
    });

    test('should match snapshot, enabled', () => {
        const wrapper = mountWithIntl(
            <Provider store={mockStore({})}>
                <ManageAutoResponder
                    {...requiredProps}
                    autoResponderActive={true}
                />
            </Provider>
        );

        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find('#autoResponderActive').exists()).toBe(true);
        expect(wrapper.find('#autoResponderMessage').exists()).toBe(true);
    });

    test('should pass handleChange', () => {
        const setParentState = jest.fn();
        const wrapper = mountWithIntl(
            <Provider store={mockStore({})}>
                <ManageAutoResponder
                    {...requiredProps}
                    autoResponderActive={true}
                    setParentState={setParentState}
                />
            </Provider>
        );

        expect(wrapper.find('#autoResponderActive').exists()).toBe(true);
        expect(wrapper.find('#autoResponderMessageInput').exists()).toBe(true);

        wrapper.find('#autoResponderMessageInput').at(1).simulate('change');
        expect(setParentState).toBeCalled();
        expect(setParentState).toBeCalledWith('autoResponderMessage', 'Hello World!');

        wrapper.find('#autoResponderActive').simulate('change');
        expect(setParentState).toBeCalled();
    });
});
