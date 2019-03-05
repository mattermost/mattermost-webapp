// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {IntlProvider} from 'react-intl';

import {generateIndex} from './admin_console_index.jsx';

const enMessages = require('../i18n/en');
const esMessages = require('../i18n/es');

describe('AdminConsoleIndex.generateIndex', () => {
    it('should generate a index where I can search', () => {
        const intlProvider = new IntlProvider({locale: 'en', messages: enMessages, defaultLocale: 'en'}, {});
        const {intl} = intlProvider.getChildContext();

        const idx = generateIndex(intl);
        expect(idx.search('ldap')).toEqual(['authentication/ldap', 'authentication/saml', 'authentication/mfa', 'security/sessions', 'authentication/authentication_email', 'advanced/experimental']);
        expect(idx.search('saml')).toEqual(['authentication/saml', 'authentication/authentication_email', 'security/sessions']);
        expect(idx.search('nginx')).toEqual(['advanced/rate']);
        expect(idx.search('characters')).toEqual(['security/password', 'customization/custom_brand']);
        expect(idx.search('caracteres')).toEqual([]);
        expect(idx.search('notexistingword')).toEqual([]);
    });

    it('should generate a index where I can search in other language', () => {
        const intlProvider = new IntlProvider({locale: 'es', messages: esMessages, defaultLocale: 'es'}, {});
        const {intl} = intlProvider.getChildContext();

        const idx = generateIndex(intl);
        expect(idx.search('ldap')).toEqual(['authentication/ldap', 'authentication/saml', 'authentication/mfa', 'security/sessions', 'authentication/authentication_email', 'advanced/experimental']);
        expect(idx.search('saml')).toEqual(['authentication/saml', 'authentication/authentication_email', 'security/sessions']);
        expect(idx.search('nginx')).toEqual(['advanced/rate']);
        expect(idx.search('caracteres')).toEqual(['security/password', 'customization/custom_brand']);
        expect(idx.search('characters')).toEqual([]);
        expect(idx.search('notexistingword')).toEqual([]);
    });
});
