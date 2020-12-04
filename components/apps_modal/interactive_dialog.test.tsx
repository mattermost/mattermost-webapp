// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';

import {AppCall, AppCallResponse, AppField, AppForm} from 'mattermost-redux/types/apps';
import {DialogElement} from 'mattermost-redux/types/integrations';

import EmojiMap from 'utils/emoji_map';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import InteractiveDialog, {Props as DialogProps} from './interactive_dialog';
import { AppCallResponseTypes } from 'mattermost-redux/constants/apps';

describe('components/apps_modal/InteractiveDialog', () => {
    const baseProps: DialogProps = {
        modal: {
            form: {} as AppForm,
            call: {} as AppCall,
        },
        url: 'http://example.com',
        callbackId: 'abc',
        elements: [],
        title: 'test title',
        iconUrl: 'http://example.com/icon.png',
        submitLabel: 'Yes',
        notifyOnCancel: true,
        state: 'some state',
        onHide: () => {},
        actions: {
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
                    submit: jest.fn().mockResolvedValue({
                        data: {error: 'This is an error.', type: AppCallResponseTypes.ERROR},
                    }),
                },
            };
            const wrapper = shallow<InteractiveDialog>(<InteractiveDialog {...props}/>);

            await wrapper.instance().handleSubmit({preventDefault: jest.fn()} as any);

            const expected = (
                <div className='error-text'>
                    {'This is an error.'}
                </div>
            );
            expect(wrapper.find(Modal.Footer).containsMatchingElement(expected)).toBe(true);
        });

        test('should not appear when submit does not return an error', async () => {
            const wrapper = shallow<InteractiveDialog>(<InteractiveDialog {...baseProps}/>);
            await wrapper.instance().handleSubmit({preventDefault: jest.fn()} as any);

            expect(wrapper.find(Modal.Footer).exists('.error-text')).toBe(false);
        });
    });

    describe('default select element in Interactive Dialog', () => {
        const mockStore = configureStore();

        test('should be enabled by default', () => {
            const selectElement: DialogElement = {
                data_source: '',
                default: 'opt3',
                display_name: 'Option Selector',
                name: 'someoptionselector',
                optional: false,
                options: [
                    {text: 'Option1', value: 'opt1'},
                    {text: 'Option2', value: 'opt2'},
                    {text: 'Option3', value: 'opt3'},
                ],
                type: 'select',
                min_length: 2,
                max_length: 1024,
                placeholder: '',
                subtype: '',
                help_text: '',
            };

            const {elements, ...rest} = baseProps;
            elements.push(selectElement);
            const props: DialogProps = {
                ...rest,
                elements,
                modal: {
                    call: {} as AppCall,
                    form: {
                        fields: [
                            {name: selectElement.name, value: selectElement.default} as AppField,
                        ],
                    },
                },
            };

            const store = mockStore({});
            const wrapper = mountWithIntl(
                <Provider store={store}>
                    <InteractiveDialog {...props}/>
                </Provider>,
            );
            expect(wrapper.find(Modal.Body).find('input').find({defaultValue: 'Option3'}).exists()).toBe(true);
        });
    });
});
