// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamImage from './team_image.jsx';

describe('admin_console/team_channel_settings/team/TeamImage', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <TeamImage
                small={false}
                displayName={'test'}
                teamIconUrl={null}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
