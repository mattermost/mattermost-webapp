// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

const moment = require('moment-timezone');
const {shallow} = require('enzyme');

const {LastPostAt} = require('./last_post_at');

describe('components/more_direct_channels/LastPostAt', () => {
    test.each([
        [moment().add(-1, 'minutes').valueOf(), 'minute'],
        [moment().add(-1, 'seconds').valueOf(), 'minute'],
        [moment().add(-60, 'minutes').valueOf(), 'hour'],
        [moment().add(-23, 'hours').valueOf(), 'hour'],
        [moment().add(-25, 'hours').valueOf(), 'day'],
        [moment().add(-33, 'days').valueOf(), 'month'],
        [moment().add(-11, 'months').valueOf(), 'month'],
        [moment().add(-12, 'months').valueOf(), 'year'],
        [moment().add(-2, 'years').valueOf(), 'year'],
    ])('should render the last post at for %i as %s ', (timestamp, expected) => {
        const props = {lastPostAt: timestamp};
        const wrapper = shallow(<LastPostAt {...props}/>);

        const message = wrapper.find('injectIntl(Timestamp)');
        expect(message.prop('unit')).toBe(expected);
    });
});