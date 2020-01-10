// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlProvider} from 'react-intl';
import {mount, shallow} from 'enzyme';

import {intlShape} from 'utils/react_intl';

const intlProvider = new IntlProvider({locale: 'en', timeZone: 'Etc/UTC'}, {});
const {intl} = intlProvider.getChildContext();

export function isIntlInjectedElement(element) {
    const {type} = element;
    if (typeof type === 'function' && type.name === 'InjectIntl') {
        return true;
    }
    return false;
}

export function shallowWithIntl(node, {context} = {}) {
    if (!isIntlInjectedElement(node)) {
        throw new Error('shallowWithIntl() allows only components wrapped by injectIntl() HOC. Use shallow() instead.');
    }

    return shallow(React.cloneElement(node, {intl}), {
        context: Object.assign({}, context, {intl}),
    }).dive();
}

export function mountWithIntl(node, {context, childContextTypes} = {}) {
    return mount(React.cloneElement(node, {intl}), {
        context: Object.assign({}, context, {intl}),
        childContextTypes: Object.assign({}, {intl: intlShape}, childContextTypes),
    });
}
