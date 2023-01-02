// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {act} from 'react-dom/test-utils';
import {ReactWrapper} from 'enzyme';
import {Provider} from 'react-redux';

import {GlobalState} from 'types/store';
import Permissions from 'mattermost-redux/constants/permissions';

import * as ChannelViewsActions from 'actions/views/channel';

jest.mock('mattermost-redux/actions/channels');
import mockStore from 'tests/test_store';

import {suitePluginIds} from 'utils/constants';
import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import {ClientPluginManifest} from '@mattermost/types/plugins';

import NewChannelModal from './new_channel_modal';

const createBoardFromTemplateMock = () => {
    return jest.fn().mockResolvedValue(Promise.resolve({
        data: {
            id: 'new-created-board',
            channelId: 'new-channel-id',
            title: 'the new created board',
        },
    }));
};

jest.mock('mattermost-redux/actions/boards', () => ({
    ...jest.requireActual('mattermost-redux/actions/boards'),
    createBoardFromTemplate: createBoardFromTemplateMock,
    attachBoardToChannel: () => {
        return jest.fn().mockResolvedValue(Promise.resolve({
            data: {
                id: 'new-created-board',
                channelId: 'new-channel-id',
                title: 'the new created board',
            },
        }));
    },
    getBoardsTemplates: () => {
        return jest.fn().mockResolvedValue(Promise.resolve({
            data: [{id: '1', title: 'template 1'}, {id: '2', title: 'template 2'}],
        }));
    },
    setNewChannelWithBoardPreference: () => {
        return jest.fn().mockResolvedValue(Promise.resolve({
            data: true,
        }));
    },
}));

jest.mock('mattermost-redux/actions/channels', () => ({
    ...jest.requireActual('mattermost-redux/actions/channels'),
    createChannel: () => {
        return jest.fn().mockResolvedValue(Promise.resolve({
            data: {
                id: 'new-channel-id',
            },
        }));
    },
}));

jest.mock('actions/global_actions', () => ({
    ...jest.requireActual('actions/global_actions'),
    sendGenericPostMessage: () => {
        return jest.fn().mockResolvedValue(Promise.resolve({
            data: true,
        }));
    },
}));

let mockState: GlobalState;

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux') as typeof import('react-redux'),
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

describe('components/new_channel_modal', () => {
    beforeEach(() => {
        mockState = {
            entities: {
                general: {
                    config: {},
                },
                channels: {
                    currentChannelId: 'current_channel_id',
                    channels: {
                        current_channel_id: {
                            id: 'current_channel_id',
                            display_name: 'Current channel',
                            name: 'current_channel',
                        },
                    },
                    roles: {
                        current_channel_id: [
                            'channel_user',
                            'channel_admin',
                        ],
                    },
                },
                teams: {
                    currentTeamId: 'current_team_id',
                    myMembers: {
                        current_team_id: {
                            roles: 'team_user team_admin',
                        },
                    },
                    teams: {
                        current_team_id: {
                            id: 'current_team_id',
                            description: 'Curent team description',
                            name: 'current-team',
                        },
                    },
                },
                preferences: {
                    myPreferences: {},
                },
                users: {
                    currentUserId: 'current_user_id',
                    profiles: {
                        current_user_id: {roles: 'system_admin system_user'},
                    },
                },
                roles: {
                    roles: {
                        channel_admin: {
                            permissions: [],
                        },
                        channel_user: {
                            permissions: [],
                        },
                        team_admin: {
                            permissions: [],
                        },
                        team_user: {
                            permissions: [
                                Permissions.CREATE_PRIVATE_CHANNEL,
                            ],
                        },
                        system_admin: {
                            permissions: [
                                Permissions.CREATE_PUBLIC_CHANNEL,
                            ],
                        },
                        system_user: {
                            permissions: [],
                        },
                    },
                },
            },
            plugins: {
                plugins: {focalboard: {id: suitePluginIds.focalboard, version: '7.2.1'}},
            },
        } as unknown as GlobalState;
    });

    const store = mockStore(mockState);

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

    test('should show the boards template when the user clicks the create template checkbox', async () => {
        const store = await mockStore(mockState);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <NewChannelModal/>
            </Provider>,
        );
        const showTemplatesCheck = wrapper.find('.add-board-to-channel input');

        showTemplatesCheck.simulate('change');

        await actImmediate(wrapper);

        const inputTemplatesSelector = wrapper.find('#input_select-board-template');

        expect(inputTemplatesSelector).toHaveLength(1);
    });

    test('should show the list of templates when the templates selector is clicked', async () => {
        const store = await mockStore(mockState);
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <NewChannelModal/>
            </Provider>,
        );
        const showTemplatesCheck = wrapper.find('.add-board-to-channel input');

        showTemplatesCheck.simulate('change');

        await actImmediate(wrapper);

        const templatesSelector = wrapper.find('#input_select-board-template');

        templatesSelector.simulate('click');

        await actImmediate(wrapper);

        const menuItems = wrapper.find('li.MenuItem');

        const createEmptyBoardItem = wrapper.find('li#Empty_board');
        expect(createEmptyBoardItem).toHaveLength(1);

        // contains 3 items because of the create empty board menu item
        expect(menuItems).toHaveLength(3);
    });

    test('when a board template is selected must call the switch to channel butoon', async () => {
        const switchToChannelFn = jest.fn();
        jest.spyOn(ChannelViewsActions, 'switchToChannel').mockImplementation(switchToChannelFn);

        const name = 'New channel with board';
        const mockChangeEvent = {
            preventDefault: jest.fn(),
            target: {
                value: name,
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        const wrapper = mountWithIntl(
            <Provider store={store}>
                <NewChannelModal/>
            </Provider>,
        );

        const genericModal = wrapper.find('GenericModal');
        const displayName = genericModal.find('.new-channel-modal-name-input');
        const confirmButton = genericModal.find('button[type=\'submit\']');

        displayName.simulate('change', mockChangeEvent);

        // Display name should be updated
        expect((displayName.instance() as unknown as HTMLInputElement).value).toEqual(name);

        // Confirm button should be enabled
        expect((confirmButton.instance() as unknown as HTMLButtonElement).disabled).toEqual(false);

        const showTemplatesCheck = wrapper.find('.add-board-to-channel input');

        showTemplatesCheck.simulate('change');

        await actImmediate(wrapper);

        const templatesSelector = wrapper.find('#input_select-board-template');

        templatesSelector.simulate('click');

        await actImmediate(wrapper);

        const firstTemplate = wrapper.find('li.MenuItem').at(0).find('button');

        expect(firstTemplate).toHaveLength(1);

        firstTemplate.simulate('click');

        await actImmediate(wrapper);

        // Submit
        await act(async () => {
            confirmButton.simulate('click');
        });
        expect(switchToChannelFn).toHaveBeenCalled();
    });

    test('if focalboard plugin is not enabled, the option to create a board should be hidden', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        mockState.plugins.plugins = {} as ClientPluginManifest;
        const storeNoPlugins = await mockStore(mockState);
        const wrapper = mountWithIntl(
            <Provider store={storeNoPlugins}>
                <NewChannelModal/>
            </Provider>,
        );
        const showTemplatesCheck = wrapper.find('.add-board-to-channel input');

        expect(showTemplatesCheck).toHaveLength(0);
    });
});
