// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {FormattedMessage} from 'react-intl';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import ProgressBar from './progress_bar';

describe('admin_console/progress_bar', () => {
    test('progress bar match snapshot', () => {
        const percent = 10;
        const wrapper = shallow(
            <ProgressBar
                percentage={percent}
                width={50}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('progress bar shows 10%', () => {
        const percent = 10;
        const wrapper = mountWithIntl(
            <ProgressBar
                percentage={percent}
                width={50}
            />,
        );
        expect(wrapper).toMatchSnapshot();
        const span = wrapper.find('span');
        expect(span.last().text()).toBe('10%');
    });

    test('progress bar shows right title', () => {
        const percent = 10;
        const title = (
            <FormattedMessage
                id='admin.general.importInProgress'
                defaultMessage='Import in Progress'
            />
        );
        const wrapper = mountWithIntl(
            <ProgressBar
                percentage={percent}
                width={50}
                title={title}
            />,
        );
        expect(wrapper).toMatchSnapshot();
        const span = wrapper.find('span');
        expect(span.first().text()).toBe('Import in Progress');
    });
});
