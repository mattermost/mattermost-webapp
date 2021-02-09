// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import UpgradeLink from './upgrade_link';

describe('components/widgets/links/UpgradeLink', () => {
    const handleClick = jest.fn();

    test('should match the snapshot on show', () => {
        const wrapper = shallow(
            <UpgradeLink handleClick={handleClick}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should trigger telemetry call when button clicked', (done) => {
        const wrapper = shallow(
            <UpgradeLink handleClick={handleClick}/>,
        );
        expect(wrapper.find('button').exists()).toEqual(true);
        wrapper.find('button').simulate('click');

        setImmediate(() => {
            expect(handleClick).toHaveBeenCalled();
            done();
        });
        expect(wrapper).toMatchSnapshot();
    });
});
