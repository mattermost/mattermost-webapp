// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

const moment = require('moment-timezone');
const {shallow} = require('enzyme');

const {LastPostAt} = require('./last_post_at');

describe('components/more_direct_channels/LastPostAt', () => {
    test.each([
        [moment().add(-1, 'minutes').valueOf(), 'more_direct_channels.last.post.at.minutes'],
        [moment().add(-1, 'seconds').valueOf(), 'more_direct_channels.last.post.at.minutes'],
        [moment().add(-60, 'minutes').valueOf(), 'more_direct_channels.last.post.at.hours'],
        [moment().add(-23, 'hours').valueOf(), 'more_direct_channels.last.post.at.hours'],
        [moment().add(-25, 'hours').valueOf(), 'more_direct_channels.last.post.at.days'],
        [moment().add(-30, 'days').valueOf(), 'more_direct_channels.last.post.at.months'],
        [moment().add(-11, 'months').valueOf(), 'more_direct_channels.last.post.at.months'],
        [moment().add(-12, 'months').valueOf(), 'more_direct_channels.last.post.at.years'],
        [moment().add(-2, 'years').valueOf(), 'more_direct_channels.last.post.at.years'],
    ])('should render the last post at for %i as %s ', (timestamp, expected) => {
        const props = {lastPostAt: timestamp};
        const wrapper = shallow(<LastPostAt {...props}/>);

        const message = wrapper.find('FormattedMessage');

        expect(message.prop('id')).toBe(expected);
    });
});