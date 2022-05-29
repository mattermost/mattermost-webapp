// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {act} from 'react-dom/test-utils';

import thunk from 'redux-thunk';

import {shallow} from 'enzyme';

import GenericModal from 'components/generic_modal';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import RequestBusinessEmailModal from './request_business_email_modal';

jest.mock('actions/cloud.tsx', () => {
    // const checkValidEmail = jest.fn().
    //     mockResolvedValueOnce(false).
    //     mockResolvedValue(true);
    const original = jest.requireActual('actions/cloud.tsx');
    return {
        ...original,
        validateBusinessEmail: () => () => {
            return new Promise<boolean>((resolve) => {
                process.nextTick(() => resolve(false));
            });
        },
    };
});

describe('components/request_business_email_modal/request_business_email_modal', () => {
    // required state to mount using the provider
    const state = {
        entities: {
            admin: {},
            general: {},
        },
        views: {
            modals: {
                modalState: {
                    request_business_email_modal: {
                        open: 'true',
                    },
                },
            },
        },
    };

    const props = {
        onExited: jest.fn(),
    };

    const mockStore = configureStore([thunk]);
    const store = mockStore(state);

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Provider store={store}>
                <RequestBusinessEmailModal {...props}/>
            </Provider>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should show the Start Cloud Trial Button', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RequestBusinessEmailModal {...props}/>
            </Provider>,
        );

        expect(wrapper.find('CloudStartTrialButton')).toHaveLength(1);
    });

    test('should call on close', () => {
        const mockOnClose = jest.fn();

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RequestBusinessEmailModal
                    {...props}
                    onClose={mockOnClose}
                />
            </Provider>,
        );

        wrapper.find(GenericModal).props().onExited();

        expect(mockOnClose).toHaveBeenCalled();
    });

    test('should call on exited', () => {
        const mockOnExited = jest.fn();

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RequestBusinessEmailModal
                    {...props}
                    onExited={mockOnExited}
                />
            </Provider>,
        );

        wrapper.find(GenericModal).props().onExited();

        expect(mockOnExited).toHaveBeenCalled();
    });

    test('should show the Start Cloud Trial Button', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RequestBusinessEmailModal {...props}/>
            </Provider>,
        );

        expect(wrapper.find('CloudStartTrialButton')).toHaveLength(1);
    });

    test('should start with Start Cloud Trial Button disabled', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RequestBusinessEmailModal {...props}/>
            </Provider>,
        );

        const startTrialBtn = wrapper.find('CloudStartTrialButton');

        expect(startTrialBtn.props().disabled).toEqual(true);
    });

    test.only('should validate the email entered', async () => {
        const event = {
            target: {value: 'email@domain.com'},
        };

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RequestBusinessEmailModal {...props}/>
            </Provider>,
        );

        await act(async () => {
            const input = wrapper.find('input');
            input.find('input').simulate('change', event);
        });

        await act(async () => {
            console.log(wrapper.debug());
            const customMessageElement = wrapper.find('.Input___customMessage.Input___error');
            expect(customMessageElement.length).toBe(1);
        });
    });
});
