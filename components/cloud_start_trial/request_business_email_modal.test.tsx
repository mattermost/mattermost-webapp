// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {act} from 'react-dom/test-utils';

import thunk from 'redux-thunk';

import {shallow} from 'enzyme';

import * as cloudActions from 'actions/cloud';

import GenericModal from 'components/generic_modal';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import RequestBusinessEmailModal from './request_business_email_modal';

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

    test('should show the Input to enter the valid Business Email', () => {
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RequestBusinessEmailModal {...props}/>
            </Provider>,
        );

        expect(wrapper.find('InputBusinessEmail')).toHaveLength(1);
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

    test('should ENABLE the trial button if email is VALID', async () => {
        // mock validation response to TRUE meaning the email is a valid email
        const validateBusinessEmail = () => () => Promise.resolve(true);
        jest.spyOn(cloudActions, 'validateBusinessEmail').mockImplementation(validateBusinessEmail);

        const event = {
            target: {value: 'valid-email@domain.com'},
        };

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RequestBusinessEmailModal {...props}/>
            </Provider>,
        );

        await act(async () => {
            const inputBusinessEmail = wrapper.find('InputBusinessEmail');
            const input = inputBusinessEmail.find('input');
            input.find('input').at(0).simulate('change', event);
        });

        act(() => {
            wrapper.update();
            const startTrialBtn = wrapper.find('CloudStartTrialButton');
            expect(startTrialBtn.props().disabled).toEqual(false);
        });
    });

    test('should show the success custom message if the email is valid', async () => {
        // mock validation response to TRUE meaning the email is a valid email
        const validateBusinessEmail = () => () => Promise.resolve(true);

        jest.spyOn(cloudActions, 'validateBusinessEmail').mockImplementation(validateBusinessEmail);

        const event = {
            target: {value: 'valid-email@domain.com'},
        };

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <RequestBusinessEmailModal {...props}/>
            </Provider>,
        );

        await act(async () => {
            const inputBusinessEmail = wrapper.find('InputBusinessEmail');
            const input = inputBusinessEmail.find('input');
            input.find('input').at(0).simulate('change', event);
        });

        act(() => {
            wrapper.update();
            const customMessageElement = wrapper.find('.Input___customMessage.Input___success');
            expect(customMessageElement.length).toBe(1);
        });
    });

    // test('should DISABLE the trial button if email is INVALID', async () => {
    //     // mock validation response to FALSE meaning the email is an invalid email
    //     const validateBusinessEmail = () => () => Promise.resolve(false);
    //     jest.spyOn(cloudActions, 'validateBusinessEmail').mockImplementation(validateBusinessEmail);

    //     const event = {
    //         target: {value: 'INvalid-email@domain.com'},
    //     };

    //     const wrapper = mountWithIntl(
    //         <Provider store={store}>
    //             <RequestBusinessEmailModal {...props}/>
    //         </Provider>,
    //     );

    //     await act(async () => {
    //         const inputBusinessEmail = wrapper.find('InputBusinessEmail');
    //         const input = inputBusinessEmail.find('input');
    //         input.find('input').at(0).simulate('change', event);
    //     });

    //     act(() => {
    //         wrapper.update();
    //         const startTrialBtn = wrapper.find('CloudStartTrialButton');
    //         expect(startTrialBtn.props().disabled).toEqual(true);
    //     });
    // });

    // test('should show the error custom message if the email is invalid', async () => {
    //     // mock validation response to FALSE meaning the email is an invalid email
    //     const validateBusinessEmail = () => () => Promise.resolve(false);
    //     jest.spyOn(cloudActions, 'validateBusinessEmail').mockImplementation(validateBusinessEmail);

    //     const event = {
    //         target: {value: 'INvalid-email@domain.com'},
    //     };

    //     const wrapper = mountWithIntl(
    //         <Provider store={store}>
    //             <RequestBusinessEmailModal {...props}/>
    //         </Provider>,
    //     );

    //     await act(async () => {
    //         const inputBusinessEmail = wrapper.find('InputBusinessEmail');
    //         const input = inputBusinessEmail.find('input');
    //         input.find('input').at(0).simulate('change', event);
    //     });

    //     act(() => {
    //         wrapper.update();
    //         const customMessageElement = wrapper.find('.Input___customMessage.Input___error');
    //         expect(customMessageElement.length).toBe(1);
    //     });
    // });
});
