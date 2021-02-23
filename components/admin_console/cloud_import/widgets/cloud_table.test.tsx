// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import CloudTable from './cloud_table';

const ReaactEl = (props: any) => (<p>{props.children}</p>);
const content = 'content';
const header = [
    <p key='header1'>{content}</p>,
    <ReaactEl key='header2'>{content}</ReaactEl>,
];

const values = [
    [<p key='row1-td1'>{content}</p>,
        <p key='row1-td2'>{content}</p>,
        <ReaactEl key='row1-td3'>{content}</ReaactEl>],
    [<p key='row2-td1'>{content}</p>,
        <p key='row2-td2'>{content}</p>,
        <ReaactEl key='row2-td3'>{content}</ReaactEl>],
];

describe('admin_console/cloud_table', () => {
    test('cloud table match snapshot', () => {
        const wrapper = shallow(
            <CloudTable
                header={header}
                list={values}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('cloud table displays without header', () => {
        const wrapper = mountWithIntl(
            <CloudTable list={values}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
