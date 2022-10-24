// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {fireEvent, screen} from '@testing-library/react';

import {renderWithIntl} from 'tests/react_testing_utils';

import ViewThreadButton from './view_thread_button';

describe('components/threading/common/follow_button', () => {
    test('should render view thread button correctly with text view thread', () => {
        const clickHandler = jest.fn();

        const wrapper = renderWithIntl(
            <ViewThreadButton
                hasNewReplies={false}
                onClick={clickHandler}
            />,
        );

        const button = screen.getByTestId('view-thread-button');

        expect(wrapper).toMatchSnapshot();
        expect(button).toHaveTextContent('View thread');
    });

    test('should render view thread button correctly with text view newer replies', () => {
        const clickHandler = jest.fn();

        const wrapper = renderWithIntl(
            <ViewThreadButton
                hasNewReplies={true}
                onClick={clickHandler}
            />,
        );

        const button = screen.getByTestId('view-thread-button');

        expect(wrapper).toMatchSnapshot();
        expect(button).toHaveTextContent('View newer replies');
    });

    test('should fire click handler', async () => {
        const clickHandler = jest.fn();

        const wrapper = renderWithIntl(
            <ViewThreadButton
                hasNewReplies={false}
                onClick={clickHandler}
            />,
        );

        const button = screen.getByTestId('view-thread-button');

        fireEvent.click(button);

        expect(wrapper).toMatchSnapshot();
        expect(clickHandler).toHaveBeenCalled();
    });
});
