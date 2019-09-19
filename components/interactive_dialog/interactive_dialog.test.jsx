// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import InteractiveDialog from './interactive_dialog.jsx';

describe('components/interactive_dialog/InteractiveDialog', () => {
    const baseProps = {
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
            submitInteractiveDialog: () => ({}),
        },
    };

    describe('generic error message', () => {
        test('should appear when submit returns an error', async () => {
            const props = {
                ...baseProps,
                actions: {
                    submitInteractiveDialog: () => ({
                        data: {error: 'This is an error.'},
                    }),
                },
            };
            const wrapper = shallow(<InteractiveDialog {...props}/>);

            await wrapper.instance().handleSubmit({preventDefault: jest.fn()});

            const expected = (
                <div className='error-text'>
                    {'This is an error.'}
                </div>
            );
            expect(wrapper.find(Modal.Footer).containsMatchingElement(expected)).toBe(true);
        });

        test('should not appear when submit does not return an error', async () => {
            const wrapper = shallow(<InteractiveDialog {...baseProps}/>);
            await wrapper.instance().handleSubmit({preventDefault: jest.fn()});

            expect(wrapper.find(Modal.Footer).exists('.error-text')).toBe(false);
        });
    });
});
