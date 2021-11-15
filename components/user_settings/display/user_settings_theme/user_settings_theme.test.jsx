// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {render, fireEvent, screen} from '@testing-library/react';

import {Preferences} from 'mattermost-redux/constants';

import UserSettingsTheme from 'components/user_settings/display/user_settings_theme/user_settings_theme.jsx';

jest.mock('utils/utils', () => ({
    applyTheme: jest.fn(),
    toTitleCase: jest.fn(),
}));

describe('components/user_settings/display/user_settings_theme/user_settings_theme.jsx', () => {
    const mockStore = configureStore();
    const initialState = {
        entities: {
            general: {
                config: {},
            },
        },
    };
    const store = mockStore(initialState);

    const requiredProps = {
        theme: Preferences.THEMES.denim,
        updateTheme: jest.fn(),
        currentTeamId: 'teamId',
        selected: false,
        updateSection: jest.fn(),
        setRequireConfirm: jest.fn(),
        setEnforceFocus: jest.fn(),
        actions: {
            saveTheme: jest.fn().mockResolvedValue({data: true}),
            deleteTeamSpecificThemes: jest.fn().mockResolvedValue({data: true}),
            openModal: jest.fn(),
        },
        focused: false,
    };

    it('should match snapshot', () => {
        const wrapper = shallow(
            <UserSettingsTheme {...requiredProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should saveTheme', async () => {
        const wrapper = shallow(
            <UserSettingsTheme {...requiredProps}/>,
        );

        await wrapper.instance().submitTheme();

        expect(requiredProps.setRequireConfirm).toHaveBeenCalledTimes(1);
        expect(requiredProps.setRequireConfirm).toHaveBeenCalledWith(false);

        expect(requiredProps.updateSection).toHaveBeenCalledTimes(1);
        expect(requiredProps.updateSection).toHaveBeenCalledWith('');

        expect(requiredProps.actions.saveTheme).toHaveBeenCalled();
    });

    it('should deleteTeamSpecificThemes if applyToAllTeams is enabled', async () => {
        const props = {
            ...requiredProps,
            actions: {
                saveTheme: jest.fn().mockResolvedValue({data: true}),
                deleteTeamSpecificThemes: jest.fn().mockResolvedValue({data: true}),
                openModal: jest.fn(),
            },
        };

        const wrapper = shallow(
            <UserSettingsTheme {...props}/>,
        );

        wrapper.instance().setState({applyToAllTeams: true});
        await wrapper.instance().submitTheme();

        expect(props.actions.deleteTeamSpecificThemes).toHaveBeenCalled();
    });

    it('should call openModal when slack import theme button is clicked', async () => {
        const props = {
            ...requiredProps,
            allowCustomThemes: true,
            selected: true,
        };

        render(
            <IntlProvider locale={'en'}>
                <Provider store={store}>
                    <UserSettingsTheme {...props}/>
                </Provider>
            </IntlProvider>,
        );

        // Click the Slack Import button
        fireEvent.click(screen.getByText('Import theme colors from Slack'));

        expect(props.actions.openModal).toHaveBeenCalledTimes(1);
    });
});
