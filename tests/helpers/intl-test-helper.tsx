// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {ReactElement} from 'react';
import {createIntl, IntlProvider, IntlShape, injectIntl} from 'react-intl';
import {mount, shallow, ShallowRendererProps, MountRendererProps} from 'enzyme';

const defaultMessages = require('i18n/en.json');
const defaultIntl = createIntl({
    locale: 'en',
    timeZone: 'Etc/UTC',
    messages: defaultMessages,
});

export type IntlInjectedElement = ReactElement<any, ReturnType<typeof injectIntl>>;
export function isIntlInjectedElement(element: ReactElement): element is IntlInjectedElement {
    const {type} = element;
    return typeof type ==='object' && 'WrappedComponent' in type;
}

interface ShallowWithIntlOptions extends ShallowRendererProps {
    intl?: IntlShape;
}

export function shallowWithIntl<T extends IntlInjectedElement>(element: T, options?: ShallowWithIntlOptions) {
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
export function mountWithIntl<T extends ReactElement | IntlInjectedElement>(element: T, options?: MountWithIntlOptions) {
    const {intl = defaultIntl, ...mountOptions} = options || {};
    const {locale, defaultLocale, messages} = intl;
    const newElement = isIntlInjectedElement(element) ? (

        // Using WrappedComponent for injectIntl
        <element.type.WrappedComponent intl={intl} {...element.props} />
    ) : element;

    return mount(
        newElement,

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
