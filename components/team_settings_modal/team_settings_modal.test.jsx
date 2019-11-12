
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamSettingsModal from 'components/team_settings_modal/team_settings_modal';

require('perfect-scrollbar/jquery')($);

describe('components/team_settings_modal', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(<TeamSettingsModal/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should call onHide callback when the modal is hidden', () => {
        const onHide = jest.fn();

        const wrapper = shallow(
            <TeamSettingsModal
                onHide={onHide}
            />
        );

        wrapper.instance().handleHidden();
        expect(onHide).toHaveBeenCalledTimes(1);
    });
});

