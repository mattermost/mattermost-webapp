// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {render, fireEvent} from '@testing-library/react';

import {withIntl} from 'tests/helpers/intl-test-helper';

import {Animations} from './steps';
import Organization from './organization';

describe('Organization', () => {
    let props = {
        show: true,
        next: jest.fn(),
        transitionDirection: Animations.Reasons.EnterFromBefore,
        organization: '',
        setOrganization: jest.fn(),
        onPageView: jest.fn(),
    };
    beforeEach(() => {
        props = {
            show: true,
            next: jest.fn(),
            transitionDirection: Animations.Reasons.EnterFromBefore,
            organization: '',
            setOrganization: jest.fn(),
            onPageView: jest.fn(),
        };
    });
    test('disables continuing without input', () => {
        const {getByTestId} = render(withIntl(<Organization {...props}/>));
        expect(getByTestId('continue')).toBeDisabled();
    });

    test('hides validation errors until user clicks to continue', () => {
        props.organization = 'O';
        const {getByTestId, getByText} = render(withIntl(<Organization {...props}/>));
        expect(getByTestId('continue')).not.toBeDisabled();
        fireEvent.click(getByTestId('continue'));
        getByText('between 2 and 15', {exact: false});
    });

    test('enables continuing with valid input', () => {
        props.organization = 'My Org';
        const {getByTestId} = render(withIntl(<Organization {...props}/>));
        expect(getByTestId('continue')).not.toBeDisabled();
        expect(props.next).not.toHaveBeenCalled();
        fireEvent.click(getByTestId('continue'));
        expect(props.next).toHaveBeenCalled();
    });
});
