// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

const moment = require('moment-timezone');

const {LastPostAt} = require('./last_post_at');

describe('components/more_direct_channels/LastPostAt', () => {
    test.each([
        [moment().add(-1, 'minutes').valueOf(), '1 minute ago'],
        [moment().add(-1, 'seconds').valueOf(), 'now'],
        [moment().add(-60, 'minutes').valueOf(), '1 hour ago'],
        [moment().add(-23, 'hours').valueOf(), '23 hours ago'],
        [moment().add(-25, 'hours').valueOf(), 'yesterday'],
        [moment().add(-33, 'days').valueOf(), 'last month'],
        [moment().add(-11, 'months').valueOf(), '11 months ago'],
        [moment().add(-12, 'months').valueOf(), 'last year'],
        [moment().add(-2, 'years').valueOf(), '2 years ago'],
    ])('should render the last post at for %i as %s ', (timestamp, expected) => {
        const props = {lastPostAt: timestamp};

        const wrapper = mountWithIntl(<LastPostAt {...props}/>);
        const time = wrapper.find('time');

        expect(time.text()).toBe(expected);
    });
});
