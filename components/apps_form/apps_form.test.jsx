// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import EmojiMap from 'utils/emoji_map';

import {mountWithIntl, shallowWithIntl} from 'tests/helpers/intl-test-helper';

import AppsForm from './apps_form';

describe('components/apps_form/AppsForm', () => {
    const baseProps = {
        form: {
            fields: [{
                name: 'field1',
                type: 'text',
            }],
        },
        call: {
            path: '/submit_url',
        },
        onHide: () => {},
        actions: {
            performLookupCall: jest.fn(),
            refreshOnSelect: jest.fn(),
            submit: jest.fn().mockResolvedValue({
                data: {
                    type: 'ok',
                },
            }),
        },
        emojiMap: new EmojiMap(new Map()),
    };

    describe('generic error message', () => {
        test('should appear when submit returns an error', async () => {
            const props = {
                ...baseProps,
                actions: {
                    ...baseProps.actions,
                    submit: jest.fn().mockResolvedValue({
                        error: {error: 'This is an error.', type: AppCallResponseTypes.ERROR},
                    }),
                },
            };
            const wrapper = shallowWithIntl(<AppsForm {...props}/>);

            await wrapper.instance().handleSubmit({preventDefault: jest.fn()});

            const expected = (
                <div className='error-text'>
                    {'This is an error.'}
                </div>
            );
            expect(wrapper.find(Modal.Footer).containsMatchingElement(expected)).toBe(true);
        });

        test('should not appear when submit does not return an error', async () => {
            const wrapper = shallowWithIntl(<AppsForm {...baseProps}/>);
            await wrapper.instance().handleSubmit({preventDefault: jest.fn()});

            expect(wrapper.find(Modal.Footer).exists('.error-text')).toBe(false);
        });
    });

    describe('default select element', () => {
        const mockStore = configureStore();

        test('should be enabled by default', () => {
            const selectField = {
                type: 'static_select',
                value: {label: 'Option3', value: 'opt3'},
                modal_label: 'Option Selector',
                name: 'someoptionselector',
                is_required: true,
                options: [
                    {label: 'Option1', value: 'opt1'},
                    {label: 'Option2', value: 'opt2'},
                    {label: 'Option3', value: 'opt3'},
                ],
                min_length: 2,
                max_length: 1024,
                hint: '',
                subtype: '',
                description: '',
            };

            const fields = [selectField];
            const props = {
                ...baseProps,
                call: {},
                form: {
                    fields,
                },
            };

            const state = {
                entities: {
                    general: {
                        config: {},
                    },
                    preferences: {
                        myPreferences: {},
                    },
                },
            };

            const store = mockStore(state);
            const wrapper = mountWithIntl(
                <Provider store={store}>
                    <AppsForm {...props}/>
                </Provider>,
            );
            expect(wrapper.find(Modal.Body).find('.react-select__single-value').text()).toEqual('Option3');
        });
    });
});
