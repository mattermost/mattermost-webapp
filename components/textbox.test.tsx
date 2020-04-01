// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {UserProfile} from 'mattermost-redux/types/users';

import Textbox from 'components/textbox/textbox';

const mkUserProfile = (id: string): UserProfile => ({
    id,
    create_at: 0,
    update_at: 0,
    delete_at: 0,
    username: `username-${id}`,
    auth_data: '',
    auth_service: '',
    email: `${id}@email.test`,
    email_verified: true,
    nickname: id,
    first_name: `name-${id}`,
    last_name: `name-${id}`,
    position: '',
    roles: '',
    locale: '',
    notify_props: {
        desktop: 'default',
        desktop_sound: 'true',
        email: 'true',
        mark_unread: 'all',
        push: 'default',
        push_status: 'ooo',
        comments: 'never',
        first_name: 'true',
        channel: 'true',
        mention_keys: '',
    },
    terms_of_service_id: `tos-${id}`,
    terms_of_service_create_at: 0,
    is_bot: false,
    last_picture_update: 0
});

describe('components/TextBox', () => {
    const baseProps = {
        currentUserId: 'currentUserId',
        profilesInChannel: ['id1', 'id2'].map(mkUserProfile),
        profilesNotInChannel: ['id3', 'id4'].map(mkUserProfile),
        actions: {
            autocompleteUsersInChannel: jest.fn(),
            autocompleteChannels: jest.fn(),
        },
        useChannelMentions: true,
    };

    test('should match snapshot with required props', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <Textbox
                id='someid'
                value='some test text'
                onChange={emptyFunction}
                onKeyPress={emptyFunction}
                characterLimit={4000}
                createMessage='placeholder text'
                supportsCommands={false}
                {...baseProps}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should throw error when value is too long', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        // this mock function should be called when the textbox value is too long
        let gotError = false;
        function handlePostError(msg: JSX.Element | null) {
            gotError = msg !== null;
        }

        const wrapper = shallow(
            <Textbox
                id='someid'
                value='some test text that exceeds char limit'
                onChange={emptyFunction}
                onKeyPress={emptyFunction}
                characterLimit={14}
                createMessage='placeholder text'
                supportsCommands={false}
                handlePostError={handlePostError}
                {...baseProps}
            />
        );

        expect(gotError).toEqual(true);
        expect(wrapper).toMatchSnapshot();
    });

    test('should throw error when new property is too long', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        // this mock function should be called when the textbox value is too long
        let gotError = false;
        function handlePostError(msg: JSX.Element | null) {
            gotError = msg !== null;
        }

        const wrapper = shallow(
            <Textbox
                id='someid'
                value='some test text'
                onChange={emptyFunction}
                onKeyPress={emptyFunction}
                characterLimit={14}
                createMessage='placeholder text'
                supportsCommands={false}
                handlePostError={handlePostError}
                {...baseProps}
            />
        );

        wrapper.setProps({value: 'some test text that exceeds char limit'});
        wrapper.update();
        expect(gotError).toEqual(true);

        expect(wrapper).toMatchSnapshot();
    });
});
