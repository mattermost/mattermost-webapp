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
        expect(idx.search('ldap')).toEqual([
            'environment/session_lengths',
            'authentication/mfa',
            'authentication/ldap',
            'authentication/saml',
            'experimental/features',
            'authentication/email',
            'authentication/guest_access',
        ]);
        expect(idx.search('saml')).toEqual([
            'authentication/saml',
            'environment/session_lengths',
            'authentication/email',
            'experimental/features',
        ]);
        expect(idx.search('nginx')).toEqual([
            'environment/rate_limiting',
        ]);
        expect(idx.search('characters')).toEqual([
            'authentication/password',
            'site_config/customization',
        ]);
        expect(idx.search('caracteres')).toEqual([]);
        expect(idx.search('notexistingword')).toEqual([]);
    });

    it('should generate a index where I can search in other language', () => {
        const intlProvider = new IntlProvider({locale: 'es', messages: esMessages, defaultLocale: 'es'}, {});
        const {intl} = intlProvider.getChildContext();

        const idx = generateIndex(intl);
        expect(idx.search('ldap')).toEqual([
            'environment/session_lengths',
            'authentication/mfa',
            'authentication/ldap',
            'authentication/saml',
            'experimental/features',
            'authentication/email',
            'authentication/guest_access',
        ]);
        expect(idx.search('saml')).toEqual([
            'authentication/saml',
            'environment/session_lengths',
            'authentication/email',
            'experimental/features',
        ]);
        expect(idx.search('nginx')).toEqual([
            'environment/rate_limiting',
        ]);
        expect(idx.search('caracteres')).toEqual([
            'site_config/customization',
            'authentication/password',
        ]);
        expect(idx.search('characters')).toEqual([]);
        expect(idx.search('notexistingword')).toEqual([]);
    });
});
