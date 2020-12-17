// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import {AppCall, AppCallResponse, AppField, AppForm} from 'mattermost-redux/types/apps';
import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import EmojiMap from 'utils/emoji_map';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import AppsForm, {Props as AppsFormProps} from './apps_form';

describe('components/apps_form/AppsForm', () => {
    const baseProps: AppsFormProps = {
        form: {
            fields: [{
                name: 'field1',
                type: 'text',
            }],
        } as AppForm,
        call: {
            url: '/submit_url',
        } as AppCall,
        title: 'test title',
        iconUrl: 'http://example.com/icon.png',
        submitLabel: 'Yes',
        notifyOnCancel: true,
        state: 'some state',
        onHide: () => {},
        actions: {
            performLookupCall: jest.fn(),
            refreshOnSelect: jest.fn(),
            submit: jest.fn().mockResolvedValue({
                data: {
                    type: '',
                } as AppCallResponse,
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
                        data: {error: 'This is an error.', type: AppCallResponseTypes.ERROR},
                    }),
                },
            };
            const wrapper = shallow<AppsForm>(<AppsForm {...props}/>);

            await wrapper.instance().handleSubmit({preventDefault: jest.fn()} as any);

            const expected = (
                <div className='error-text'>
                    {'This is an error.'}
                </div>
            );
            expect(wrapper.find(Modal.Footer).containsMatchingElement(expected)).toBe(true);
        });

        test('should not appear when submit does not return an error', async () => {
            const wrapper = shallow<AppsForm>(<AppsForm {...baseProps}/>);
            await wrapper.instance().handleSubmit({preventDefault: jest.fn()} as any);

            expect(wrapper.find(Modal.Footer).exists('.error-text')).toBe(false);
        });
    });

    describe('default select element', () => {
        const mockStore = configureStore();

        test('should be enabled by default', () => {
            const selectField: AppField = {
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
            const props: AppsFormProps = {
                ...baseProps,
                call: {} as AppCall,
                form: {
                    fields,
                },
            };

            const store = mockStore({});
            const wrapper = mountWithIntl(
                <Provider store={store}>
                    <AppsForm {...props}/>
                </Provider>,
            );
            expect(wrapper.find(Modal.Body).find('.react-select__single-value').text()).toEqual('Option3');
        });
    });
});
