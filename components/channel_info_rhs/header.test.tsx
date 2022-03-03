// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {fireEvent, screen} from '@testing-library/react';

import {Channel} from 'mattermost-redux/types/channels';
import {renderWithIntl} from 'tests/react_testing_utils';

import Header from './header';

describe('channel_info_rhs/header', () => {
    test('should should the current channel name', () => {
        renderWithIntl(
            <Header
                channel={{display_name: 'my channel title'} as Channel}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText('my channel title')).toBeInTheDocument();
    });
    test('should call onClose when clicking on the close icon', () => {
        const onClose = jest.fn();

        renderWithIntl(
            <Header
                channel={{display_name: 'my channel title'} as Channel}
                onClose={onClose}
            />,
        );

        fireEvent.click(screen.getByLabelText('Close'));

        expect(onClose).toHaveBeenCalled();
    });
});
