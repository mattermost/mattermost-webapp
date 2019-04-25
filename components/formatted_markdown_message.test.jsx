// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';
import {IntlProvider} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

describe('components/FormattedMarkdownMessage', () => {
    test('should render message', () => {
        const descriptor = {
            id: 'test.foo',
            defaultMessage: '**bold** *italic* [link](https://mattermost.com/) <br/> [link target blank](!https://mattermost.com/)',
        };
        const wrapper = mount(wrapProvider(<FormattedMarkdownMessage {...descriptor}/>));
        expect(wrapper).toMatchSnapshot();
    });

    test('should backup to default', () => {
        const descriptor = {
            id: 'xxx',
            defaultMessage: 'testing default message',
        };
        const wrapper = mount(wrapProvider(<FormattedMarkdownMessage {...descriptor}/>));
        expect(wrapper).toMatchSnapshot();
    });

    test('should escape non-BR', () => {
        const descriptor = {
            id: 'test.bar',
            defaultMessage: '',
        };
        const wrapper = mount(wrapProvider(<FormattedMarkdownMessage {...descriptor}/>));
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
        const wrapper = mount(wrapProvider(<FormattedMarkdownMessage {...descriptor}/>));
        expect(wrapper).toMatchSnapshot();
    });
});

export function wrapProvider(el) {
    const enTranslationData = {
        'test.foo': '**bold** *italic* [link](https://mattermost.com/) <br/> [link target blank](!https://mattermost.com/)',
        'test.bar': '<b>hello</b> <script>var malicious = true;</script> world!',
        'test.vals': '*Hi* {petName}!',
    };
    return (
        <IntlProvider
            locale={'en'}
            messages={enTranslationData}
        >
            {el}
        </IntlProvider>)
    ;
}
