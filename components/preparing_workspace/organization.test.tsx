// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {render, fireEvent} from '@testing-library/react';

import {withIntl} from 'tests/helpers/intl-test-helper';

import * as useValidateTeam from 'components/common/hooks/useValidateTeam';

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

    test('enables continuing with valid input', async () => {
        props.organization = 'My Org';

        jest.spyOn(useValidateTeam, 'default').mockImplementation(() => ({
            validate: jest.fn(),
            verifying: false,
            result: {
                valid: true,
                error: '',
            },
        }));
        const {getByTestId} = render(withIntl(<Organization {...props}/>));
        expect(getByTestId('continue')).not.toBeDisabled();
        expect(props.next).not.toHaveBeenCalled();
        fireEvent.click(getByTestId('continue'));
        expect(props.next).toHaveBeenCalled();
    });

    test('disables continuing without input', () => {
        jest.spyOn(useValidateTeam, 'default').mockImplementation(() => ({
            validate: jest.fn(),
            verifying: false,
            result: {
                valid: false,
                error: 'no input',
            },
        }));
        const {getByTestId} = render(withIntl(<Organization {...props}/>));
        expect(getByTestId('continue')).toBeDisabled();
    });
});
