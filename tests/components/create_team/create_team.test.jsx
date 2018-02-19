// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {shallowWithIntl, mountWithIntl} from 'tests/helpers/intl-test-helper';

import CreateTeam from 'components/create_team/create_team.jsx';

jest.mock('components/announcement_bar');
jest.mock('components/common/back_button.jsx');
jest.mock('react-router-dom');

describe('/components/create_team', () => {
    global.window.mm_license = {};
    global.window.mm_config = {};

    const defaultProps = {
        currentChannel: {name: 'test-channel'},
        currentTeam: {name: 'test-team'},
        siteName: 'Mattermost',
        isLicensed: true,
        customBrand: true,
        enableCustomBrand: true,
        customDescriptionText: 'Welcome to our custom branded site!',
        match: {
            url: 'http://localhost:8065/create_team'
        },
        history: {
            push: jest.fn()
        }
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(<CreateTeam {...defaultProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should display custom branded description', () => {
        const wrapper = shallowWithIntl(<CreateTeam {...defaultProps}/>);

        const customText = wrapper.find('h4').text();

        expect(customText).toBe(defaultProps.customDescriptionText);
    });

    test('should run props.history.push with new state', () => {
        const wrapper = shallowWithIntl(<CreateTeam {...defaultProps}/>);

        const history = wrapper.instance().props.history;
        const state = wrapper.instance().state;

        expect(state.team.name).toBeUndefined();

        state.team.name = 'new_team';
        wrapper.instance().updateParent(state);

        expect(state.team.name).toBe('new_team');
        expect(history.push).toHaveBeenCalledWith('/create_team/display_name');
    });
});
