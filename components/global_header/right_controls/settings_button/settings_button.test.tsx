// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import IconButton from '@mattermost/compass-components/components/icon-button';

import SettingsButton from './settings_button';

const baseProps = {
    actions: {
        openModal: jest.fn(),
    },
};

describe('components/global/settings_button', () => {
    it('should match snapshot', () => {
        const wrapper = shallow(<SettingsButton {...baseProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    it('should trigger the open modal action', () => {
        const wrapper = shallow(<SettingsButton {...baseProps}/>);

        wrapper.find(IconButton).simulate('click');
        expect(baseProps.actions.openModal).toHaveBeenCalled();
        expect(wrapper).toMatchSnapshot();
    });
});
