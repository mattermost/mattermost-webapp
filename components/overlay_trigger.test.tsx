// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {mount} from 'enzyme';
import React from 'react';
import {OverlayTrigger as BaseOverlayTrigger} from 'react-bootstrap';
import {FormattedMessage, IntlProvider} from 'react-intl';

import OverlayTrigger from './overlay_trigger';

describe('OverlayTrigger', () => {
    const testId = 'test.value';

    const intlProviderProps = {
        defaultLocale: 'en',
        locale: 'en',
        messages: {
            [testId]: 'Actual value',
        },
    };
    const testOverlay = (
        <FormattedMessage
            id={testId}
            defaultMessage='Default value'
        />
    );

    // Intercept console error messages since we intentionally cause some as part of these tests
    let originalConsoleError: () => void;

    beforeEach(() => {
        originalConsoleError = console.error;
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    test('base OverlayTrigger should fail to pass intl to overlay', () => {
        const wrapper = mount(
            <IntlProvider {...intlProviderProps}>
                <BaseOverlayTrigger overlay={testOverlay}>
                    <span/>
                </BaseOverlayTrigger>
            </IntlProvider>
        );

        const overlay = mount(wrapper.find(BaseOverlayTrigger).prop('overlay'));

        expect(overlay.text()).toBe('Default value');

        // console.error will have been called by FormattedMessage because its intl context is missing
        expect(console.error).toHaveBeenCalled();
    });

    test('custom OverlayTrigger should fail to pass intl to overlay', () => {
        const wrapper = mount(
            <IntlProvider {...intlProviderProps}>
                <OverlayTrigger overlay={testOverlay}>
                    <span/>
                </OverlayTrigger>
            </IntlProvider>
        );

        const overlay = mount(wrapper.find(BaseOverlayTrigger).prop('overlay'));

        expect(overlay.text()).toBe('Actual value');
        expect(console.error).not.toHaveBeenCalled();
    });
});
