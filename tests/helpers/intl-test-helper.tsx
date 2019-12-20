// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {
    ReactElement,
} from 'react';
import {
    createIntl,
    injectIntl,
    IntlShape,
    IntlProvider,
} from 'react-intl';
import {
    shallow,
    mount,
    ShallowRendererProps,
    MountRendererProps,
} from 'enzyme';

import defaultMessages from 'i18n/en.json';

export const defaultIntl = createIntl({
    locale: 'en',
    defaultLocale: 'en',
    timeZone: 'Etc/UTC',
    messages: defaultMessages,
    textComponent: 'span',
});

type IntlInjectedElement = ReactElement<any, ReturnType<typeof injectIntl>>;
export function isIntlInjectedElement(element: ReactElement): element is IntlInjectedElement {
    const {type} = element;
    if (typeof type === 'function' && type.name === 'WithIntl') {
        return true;
    }
    return false;
}

interface ShallowWithIntlOptions extends ShallowRendererProps {
    intl?: IntlShape;
}

export function shallowWithIntl<T extends IntlInjectedElement>(element: T, options?: ShallowWithIntlOptions = {}) {
    const {intl = defaultIntl, ...shallowOptions} = options || {};

    if (!isIntlInjectedElement(element)) {
        throw new Error('shallowWithIntl() allows only components wrapped by injectIntl() HOC. Use shallow() instead.');
    }

    return shallow(

        // Unwrap injectIntl
        <element.type.WrappedComponent
            intl={intl}
            {...element.props}
        />,

        // Override options
        shallowOptions,
    );
}

interface MountWithIntlOptions extends MountRendererProps {
    intl?: IntlShape;
}
export function mountWithIntl<T extends ReactElement | IntlInjectedElement>(element: T, options?: MountWithIntlOptions) {
    const {intl = defaultIntl, ...mountOptions} = options || {};

    // Unwrap injectIntl
    const newElement = isIntlInjectedElement(element) ? (
        <element.type.WrappedComponent
            intl={intl}
            {...element.props}
        />
    ) : element;

    return mount(
        newElement,

        // For useIntl, <Formatted.../>
        {
            wrappingComponent: IntlProvider,
            wrappingComponentProps: {...intl},

            // For legacy
            context: {
                intl,
                ...mountOptions.context,
            },
            childContextTypes: {
                intl: PropTypes.any.isRequired,
                ...mountOptions.childContextTypes,
            },

            // Override options
            ...mountOptions,
        },
    );
}
