// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {
    ExoticComponent,
    ForwardRefExoticComponent,
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

import {doAddLocaleData} from 'i18n/i18n';
import defaultMessages from 'i18n/en.json';

doAddLocaleData();

export const defaultIntl = createIntl({
    locale: 'en',
    defaultLocale: 'en',
    timeZone: 'Etc/UTC',
    messages: defaultMessages,
    textComponent: 'span',
});

function unwrapForwardRef<WrappedComponentElement extends ReactElement>(element: ReactElement): WrappedComponentElement {
    const {type, props} = element as ReactElement<any, ExoticComponent>;
    if (type.$$typeof && type.$$typeof === Symbol.for('react.forward_ref')) {
        type ForwardRefComponent = ForwardRefExoticComponent<any> & {
            render: () => ReactElement;
        };
        return React.cloneElement(
            (type as ForwardRefComponent).render(),
            props,
        ) as WrappedComponentElement;
    }
    return element as WrappedComponentElement;
}

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

export function shallowWithIntl<T extends IntlInjectedElement>(element: T, options?: ShallowWithIntlOptions) {
    const {intl = defaultIntl, ...shallowOptions} = options || {};

    // eslint-disable-next-line no-param-reassign
    element = unwrapForwardRef<T>(element);

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

            // Override options
            ...mountOptions,
        },
    );
}
