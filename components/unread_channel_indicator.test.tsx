// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import UnreadChannelIndicator from 'components/unread_channel_indicator';

describe('components/UnreadChannelIndicator', () => {
    test('should match snapshot', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <UnreadChannelIndicator
                onClick={emptyFunction}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when show is set', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <UnreadChannelIndicator
                onClick={emptyFunction}
                show={true}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when content is text', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <UnreadChannelIndicator
                onClick={emptyFunction}
                show={true}
                content='foo'
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when content is an element', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <UnreadChannelIndicator
                onClick={emptyFunction}
                show={true}
                content={<div>{'foo'}</div>}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have called onClick', () => {
        const onClick = jest.fn();
        const name = 'name';

        const wrapper = shallow(
            <UnreadChannelIndicator
                onClick={onClick}
                show={true}
                content={<div>{'foo'}</div>}
                name={name}
            />
        );

        wrapper.find('#unreadIndicator' + name).simulate('click');
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
