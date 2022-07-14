// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ReactWrapper} from 'enzyme';
import {IntlProvider} from 'react-intl';
import {BrowserRouter} from 'react-router-dom';
import {act} from '@testing-library/react';

import * as global_actions from 'actions/global_actions';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import Signup from 'components/signup/signup';
import Input from 'components/widgets/inputs/input/input';
import PasswordInput from 'components/widgets/inputs/password_input/password_input';
import SaveButton from 'components/save_button';

import {RequestStatus} from 'mattermost-redux/constants';
import {ClientConfig} from '@mattermost/types/config';
import {GlobalState} from 'types/store';
import {WindowSizes} from 'utils/constants';

let mockState: GlobalState;
let mockLocation = {pathname: '', search: '', hash: ''};
const mockHistoryPush = jest.fn();
let mockLicense = {IsLicensed: 'true'};
let mockConfig: Partial<ClientConfig>;
let mockDispatch = jest.fn();

const intlProviderProps = {
    defaultLocale: 'en',
    locale: 'en',
    messages: {},
};

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => mockDispatch,
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom') as typeof import('react-router-dom'),
    useLocation: () => mockLocation,
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

jest.mock('mattermost-redux/selectors/entities/general', () => ({
    ...jest.requireActual('mattermost-redux/selectors/entities/general') as typeof import('mattermost-redux/selectors/entities/general'),
    getLicense: () => mockLicense,
    getConfig: () => mockConfig,
}));

jest.mock('mattermost-redux/selectors/entities/users', () => ({
    ...jest.requireActual('mattermost-redux/selectors/entities/users') as typeof import('mattermost-redux/selectors/entities/users'),
    getCurrentUserId: () => '',
}));

jest.mock('actions/team_actions', () => ({
    ...jest.requireActual('actions/team_actions') as typeof import('actions/team_actions'),
    addUsersToTeamFromInvite: jest.fn().mockResolvedValue({name: 'teamName'}),
}));

jest.mock('mattermost-redux/actions/users', () => ({
    ...jest.requireActual('mattermost-redux/actions/users') as typeof import('mattermost-redux/actions/users'),
    createUser: jest.fn().mockResolvedValue({data: {}}),
}));

jest.mock('actions/views/login', () => ({
    ...jest.requireActual('actions/views/login') as typeof import('actions/views/login'),
    loginById: jest.fn().mockResolvedValue({data: {}}),
}));

jest.mock('actions/team_actions', () => ({
    ...jest.requireActual('actions/team_actions') as typeof import('actions/team_actions'),
    addUserToTeamFromInvite: jest.fn().mockResolvedValue({data: {}}),
}));

jest.mock('actions/storage');

const actImmediate = (wrapper: ReactWrapper) =>
    act(
        () =>
            new Promise<void>((resolve) => {
                setImmediate(() => {
                    wrapper.update();
                    resolve();
                });
            }),
    );

describe('components/signup/Signup', () => {
    beforeEach(() => {
        mockLocation = {pathname: '', search: '', hash: ''};

        mockLicense = {IsLicensed: 'true'};

        mockState = {
            entities: {
                general: {
                    config: {},
                    license: {},
                },
                users: {
                    currentUserId: '',
                    profiles: {
                        user1: {
                            id: 'user1',
                            roles: '',
                        },
                    },
                },
                teams: {
                    currentTeamId: 'team1',
                    teams: {
                        team1: {
                            id: 'team1',
                            name: 'team-1',
                            displayName: 'Team 1',
                        },
                    },
                    myMembers: {
                        team1: {roles: 'team_role'},
                    },
                },
            },
            requests: {
                users: {
                    logout: {
                        status: RequestStatus.NOT_STARTED,
                    },
                },
            },
            storage: {
                initialized: true,
            },
            views: {
                browser: {
                    windowSize: WindowSizes.DESKTOP_VIEW,
                },
            },
        } as unknown as GlobalState;

        mockConfig = {
            EnableLdap: 'true',
            EnableSaml: 'true',
            EnableSignInWithEmail: 'true',
            EnableSignInWithUsername: 'true',
            EnableSignUpWithEmail: 'true',
            EnableSignUpWithGitLab: 'true',
            EnableSignUpWithOffice365: 'true',
            EnableSignUpWithGoogle: 'true',
            EnableSignUpWithOpenId: 'true',
            EnableOpenServer: 'true',
            LdapLoginFieldName: '',
            GitLabButtonText: '',
            GitLabButtonColor: '',
            OpenIdButtonText: '',
            OpenIdButtonColor: '',
            SamlLoginButtonText: '',
            EnableCustomBrand: 'false',
            CustomBrandText: '',
            CustomDescriptionText: '',
            SiteName: 'Mattermost',
            ExperimentalPrimaryTeam: '',
        };
    });

    it('should match snapshot for all signup options enabled with isLicensed enabled', () => {
        const wrapper = shallow(
            <Signup/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot for all signup options enabled with isLicensed disabled', () => {
        mockLicense = {IsLicensed: 'false'};

        const wrapper = shallow(
            <Signup/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should create user, log in and redirect to invite teamname', async () => {
        mockLocation.search = 'd=%7B"name"%3A"teamName"%7D';

        mockDispatch = jest.fn().
            mockResolvedValueOnce({}). // removeGlobalItem
            mockResolvedValueOnce({data: {id: 'userId', password: 'password', email: 'jdoe@mm.com}'}}). // createUser
            mockResolvedValueOnce({error: {server_error_id: 'api.user.login.not_verified.app_error'}}); // loginById

        const mockRedirectUserToDefaultTeam = jest.fn();
        jest.spyOn(global_actions, 'redirectUserToDefaultTeam').mockImplementation(mockRedirectUserToDefaultTeam);

        const wrapper = mountWithIntl(
            <IntlProvider {...intlProviderProps}>
                <BrowserRouter>
                    <Signup/>
                </BrowserRouter>
            </IntlProvider>,
        );

        const emailInput = wrapper.find(Input).first().find('input').first();
        emailInput.simulate('change', {target: {value: 'jdoe@mm.com'}});

        const nameInput = wrapper.find('#input_name').first();
        nameInput.simulate('change', {target: {value: 'jdoe'}});

        const passwordInput = wrapper.find(PasswordInput).first().find('input').first();
        passwordInput.simulate('change', {target: {value: 'password'}});

        const saveButton = wrapper.find(SaveButton).first();
        expect(saveButton.props().disabled).toEqual(false);

        saveButton.find('button').first().simulate('click');

        await actImmediate(wrapper);

        expect(wrapper.find(Input).first().props().disabled).toEqual(true);
        expect(wrapper.find('#input_name').first().props().disabled).toEqual(true);
        expect(wrapper.find(PasswordInput).first().props().disabled).toEqual(true);

        expect(mockRedirectUserToDefaultTeam).not.toHaveBeenCalled();
        expect(mockHistoryPush).toHaveBeenCalledWith('/should_verify_email?email=jdoe%40mm.com&teamname=teamName');
    });

    it('should create user, log in and redirect to default team', async () => {
        mockDispatch = jest.fn().
            mockResolvedValueOnce({}). // removeGlobalItem
            mockResolvedValueOnce({data: {id: 'userId', password: 'password', email: 'jdoe@mm.com}'}}). // createUser
            mockResolvedValueOnce({}); // loginById

        const mockRedirectUserToDefaultTeam = jest.fn();
        jest.spyOn(global_actions, 'redirectUserToDefaultTeam').mockImplementation(mockRedirectUserToDefaultTeam);

        const wrapper = mountWithIntl(
            <IntlProvider {...intlProviderProps}>
                <BrowserRouter>
                    <Signup/>
                </BrowserRouter>
            </IntlProvider>,
        );

        const emailInput = wrapper.find(Input).first().find('input').first();
        emailInput.simulate('change', {target: {value: 'jdoe@mm.com'}});

        const nameInput = wrapper.find('#input_name').first();
        nameInput.simulate('change', {target: {value: 'jdoe'}});

        const passwordInput = wrapper.find(PasswordInput).first().find('input').first();
        passwordInput.simulate('change', {target: {value: 'password'}});

        const saveButton = wrapper.find(SaveButton).first();
        expect(saveButton.props().disabled).toEqual(false);

        saveButton.find('button').first().simulate('click');

        await actImmediate(wrapper);

        expect(wrapper.find(Input).first().props().disabled).toEqual(true);
        expect(wrapper.find('#input_name').first().props().disabled).toEqual(true);
        expect(wrapper.find(PasswordInput).first().props().disabled).toEqual(true);

        expect(mockRedirectUserToDefaultTeam).toHaveBeenCalled();
    });

    it('should add user to team and redirect when team invite valid and logged in', async () => {
        mockLocation.search = '?id=ppni7a9t87fn3j4d56rwocdctc';

        const wrapper = shallow(
            <Signup/>,
        );

        setTimeout(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith('/teamName/channels/town-square');
            expect(wrapper).toMatchSnapshot();
        }, 0);
    });

    it('should handle failure adding user to team when team invite and logged in', () => {
        mockLocation.search = '?id=ppni7a9t87fn3j4d56rwocdctc';

        const wrapper = shallow(
            <Signup/>,
        );

        setTimeout(() => {
            expect(mockHistoryPush).not.toHaveBeenCalled();
            expect(wrapper.find('.content-layout-column-title').text()).toEqual('This invite link is invalid');
        });
    });
});
