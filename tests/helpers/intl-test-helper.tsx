// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {createIntl, IntlProvider, IntlShape, injectIntl} from 'react-intl';
import {mount, shallow, ShallowRendererProps, MountRendererProps} from 'enzyme';

const defaultMessages = require('i18n/en.json');
const defaultIntl = createIntl({
    locale: 'en',
    timeZone: 'Etc/UTC',
    messages: defaultMessages,
});

interface ShallowWithIntlOptions extends ShallowRendererProps {
    intl?: IntlShape;
}

export function shallowWithIntl<T extends React.ReactElement<any, ReturnType<typeof injectIntl>>>(element: T, options?: ShallowWithIntlOptions) {
    const {intl = defaultIntl, ...shallowOptions} = options || {};
    const {locale, defaultLocale, messages} = intl;

    return shallow(

        // Using WrappedComponent for injectIntl
        <element.type.WrappedComponent intl={intl} {...element.props} />,

        // For useIntl, <Formatted.../>
        {
            wrappingComponent: IntlProvider,
            wrappingComponentProps: {
                locale,
                defaultLocale,
                messages,
                textComponent: 'span',
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
export function mountWithIntl<T extends React.ReactElement<any, ReturnType<typeof injectIntl>>>(element: T, options?: MountWithIntlOptions) {
    const {intl = defaultIntl, ...mountOptions} = options || {};
    const {locale, defaultLocale, messages} = intl;
    return mount(

        // Using WrappedComponent for injectIntl
        <element.type.WrappedComponent intl={intl} {...element.props} />,

        // For useIntl, <Formatted.../>
        {
            wrappingComponent: IntlProvider,
            wrappingComponentProps: {
                locale,
                defaultLocale,
                messages,
                textComponent: 'span',
            },

            // For legacy
            context: {
                intl,
                ...mountOptions.context,
            },
            childContextTypes: {
                intl: PropTypes.any.isRequired,
                ...mountOptions.childContextTypes,
            },
            ...mountOptions,
        },
    );
}
