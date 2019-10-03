// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {createIntl, IntlProvider, IntlShape} from 'react-intl';
import {mount, shallow, ShallowRendererProps, MountRendererProps} from 'enzyme';

// Unwrap injectIntl
jest.mock('react-intl', () => ({
    ...require.requireActual('react-intl'),
    injectIntl: (comp: any) => comp,
}));

const messages = require('i18n/en.json');
const defaultIntl = createIntl({locale: 'en', timeZone: 'Etc/UTC', messages});

interface ShallowWithIntlOptions extends ShallowRendererProps {
    intl?: IntlShape;
}

export function shallowWithIntl<T extends React.ReactElement>(element: T, options?: ShallowWithIntlOptions) {
    const {intl = defaultIntl, ...shallowOptions} = options || {};
    const {locale, defaultLocale, messages} = intl;

    // For injectIntl in children


    return shallow(
        // For injectIntl
        React.cloneElement(element, {
            intl,
            ...element.props,
        }),
        // For useIntl, <Formatted.../>
        {
            wrappingComponent: IntlProvider,
            wrappingComponentProps: {
                locale,
                defaultLocale,
                messages,
            },
            // For legacy
            context: {
                intl,
                ...shallowOptions.context,
            },
            ...shallowOptions,
        },
    );
}

interface MountWithIntlOptions extends MountRendererProps {
    intl?: IntlShape;
}
export function mountWithIntl<T extends React.ReactElement>(element: T, options?: MountWithIntlOptions) {
    const {intl = defaultIntl, ...mountOptions} = options || {};
    const {locale, defaultLocale, messages} = intl;
    return mount(
        // For injectIntl
        React.cloneElement(element, {
            intl,
            ...element.props,
        }),
        // For useIntl, <Formatted.../>
        {
            wrappingComponent: IntlProvider,
            wrappingComponentProps: {
                locale,
                defaultLocale,
                messages,
            },
            // For legacy
            context: {
                intl,
                ...mountOptions.context,
            },
            ...mountOptions,
        },
    );
}
