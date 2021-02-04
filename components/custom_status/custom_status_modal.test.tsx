
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';
import configureStore from 'redux-mock-store';
import {Provider} from 'react-redux';

import * as UserSelectors from 'mattermost-redux/selectors/entities/users';

import {TestHelper} from 'utils/test_helper';

import CustomStatusModal from './custom_status_modal';

jest.mock('mattermost-redux/selectors/entities/users');

describe('components/custom_status/custom_status_modal', () => {
    const mockStore = configureStore();
    const store = mockStore({});
    const baseProps = {
        onHide: jest.fn(),
    };
    let user = TestHelper.getUserMock();

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
        const recentCustomStatuses = [customStatus];
        user = TestHelper.getUserMock({
            props: {
                customStatus: JSON.stringify(customStatus),
                recentCustomStatuses: JSON.stringify(recentCustomStatuses),
            },
        });
        (UserSelectors.getCurrentUser as jest.Mock).mockReturnValue(user);
        const wrapper = shallow(
            <Provider store={store}>
                <CustomStatusModal {...baseProps}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
