// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl, defaultIntl} from 'tests/helpers/intl-test-helper';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

const enTranslationMessages = {
    'test.foo': '**bold** *italic* [link](https://mattermost.com/) <br/> [link target blank](!https://mattermost.com/)',
    'test.bar': '<b>hello</b> <script>var malicious = true;</script> world!',
    'test.vals': '*Hi* {petName}!',
} as const;

describe('components/FormattedMarkdownMessage', () => {
    test('should render message', () => {
        const descriptor = {
            id: 'test.foo',
            defaultMessage: '**bold** *italic* [link](https://mattermost.com/) <br/> [link target blank](!https://mattermost.com/)',
        };
        const wrapper = mountWithIntl(<FormattedMarkdownMessage {...descriptor}/>, {
            intl: {...defaultIntl, messages: enTranslationMessages},
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should backup to default', () => {
        const descriptor = {
            id: 'xxx',
            defaultMessage: 'testing default message',
        };
        const wrapper = mountWithIntl(<FormattedMarkdownMessage {...descriptor}/>, {
            intl: {...defaultIntl, messages: enTranslationMessages},
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('should escape non-BR', () => {
        const descriptor = {
            id: 'test.bar',
            defaultMessage: '',
        };
        const wrapper = mountWithIntl(<FormattedMarkdownMessage {...descriptor}/>, {
            intl: {...defaultIntl, messages: enTranslationMessages},
        });
        expect(wrapper).toMatchSnapshot();
    });

    test('values should work', () => {
        const descriptor = {
            id: 'test.vals',
            defaultMessage: '*Hi* {petName}!',
            values: {
                petName: 'sweetie',
            },
        };
        const wrapper = mountWithIntl(<FormattedMarkdownMessage {...descriptor}/>, {
            intl: {...defaultIntl, messages: enTranslationMessages},
        });
        expect(wrapper).toMatchSnapshot();
    });
});
