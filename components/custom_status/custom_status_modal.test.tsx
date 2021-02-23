// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';
import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import * as StatusSelectors from 'selectors/views/custom_status';

import CustomStatusModal from './custom_status_modal';

jest.mock('selectors/views/custom_status');

describe('components/custom_status/custom_status_modal', () => {
    const mockStore = configureStore();
    const store = mockStore({});
    const baseProps = {
        onHide: jest.fn(),
    };

    it('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <CustomStatusModal {...baseProps}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when user has custom status set', () => {
        const customStatus = {
            emoji: 'speech_balloon',
            text: 'speaking',
        };
        (StatusSelectors.makeGetCustomStatus as jest.Mock).mockReturnValue(() => customStatus);
        const wrapper = shallow(
            <Provider store={store}>
                <CustomStatusModal {...baseProps}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
