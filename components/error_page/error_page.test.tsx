// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {screen} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';

import {renderWithIntl} from 'tests/react_testing_utils';

import {ErrorPageTypes} from 'utils/constants';
import ErrorPage from './error_page';

describe('ErrorPage', () => {
    it('displays cloud archived page correctly', () => {
        renderWithIntl(
            <BrowserRouter>
                <ErrorPage
                    location={{
                        search: `?type=${ErrorPageTypes.CLOUD_ARCHIVED}`
                    }}
                />
            </BrowserRouter>
        );

        screen.getByText('Message Archived');
        screen.getByText('archived because of cloud plan limits', {exact: false});
    });
});
