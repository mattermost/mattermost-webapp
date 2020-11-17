
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import TeamSettingsModal from 'components/team_settings_modal/team_settings_modal';

describe('components/team_settings_modal', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <TeamSettingsModal
                isCloud={false}
                onHide={jest.fn()}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should call onHide callback when the modal is hidden', () => {
        const onHide = jest.fn();

        const wrapper = shallow(
            <TeamSettingsModal
                isCloud={false}
                onHide={onHide}
            />,
        );

        (wrapper.instance() as TeamSettingsModal).handleHidden();
        expect(onHide).toHaveBeenCalledTimes(1);
    });
});

