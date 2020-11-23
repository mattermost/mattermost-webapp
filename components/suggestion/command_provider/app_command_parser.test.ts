// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {Client4} from 'mattermost-redux/client';

import {AppBinding, AppForm, AutocompleteSuggestion} from 'mattermost-redux/types/apps';
import {AppFieldTypes} from 'mattermost-redux/constants/apps';

import {AppCommandParser} from './app_command_parser';

const mockStore = configureStore([thunk]);

const reduxTestState = {
    entities: {
        channels: {
            currentChannelId: 'current_channel_id',
            myMembers: {
                current_channel_id: {
                    channel_id: 'current_channel_id',
                    user_id: 'current_user_id',
                    roles: 'channel_role',
                    mention_count: 1,
                    msg_count: 9,
                },
            },
            channels: {
                current_channel_id: {
                    id: 'current_channel_id',
                    name: 'default-name',
                    display_name: 'Default',
                    delete_at: 0,
                    type: 'O',
                    total_msg_count: 10,
                    team_id: 'team_id',
                },
                current_user_id__existingId: {
                    id: 'current_user_id__existingId',
                    name: 'current_user_id__existingId',
                    display_name: 'Default',
                    delete_at: 0,
                    type: '0',
                    total_msg_count: 0,
                    team_id: 'team_id',
                },
            },
            channelsInTeam: {
                'team-id': ['current_channel_id'],
            },
        },
        teams: {
            currentTeamId: 'team-id',
            teams: {
                'team-id': {
                    id: 'team_id',
                    name: 'team-1',
                    displayName: 'Team 1',
                },
            },
            myMembers: {
                'team-id': {roles: 'team_role'},
            },
        },
        users: {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_role'},
            },
        },
        preferences: {
            myPreferences: {
                'display_settings--name_format': {
                    category: 'display_settings',
                    name: 'name_format',
                    user_id: 'current_user_id',
                    value: 'username',
                },
            },
        },
        roles: {
            roles: {
                system_role: {
                    permissions: [],
                },
                team_role: {
                    permissions: [],
                },
                channel_role: {
                    permissions: [],
                },
            },
        },
        general: {
            license: {IsLicensed: 'false'},
            serverVersion: '5.4.0',
            config: {PostEditTimeLimit: -1},
        },
    },
};

const viewCommand: AppBinding = {
    app_id: 'jira',
    label: 'view',
    description: 'View details of a Jira issue',
    form: {
        fields: [
            {
                name: 'project',
                label: 'project',
                description: 'The Jira project description',
                type: AppFieldTypes.DYNAMIC_SELECT,
                hint: 'The Jira project hint',
                position: 1,
                source_url: '/projects',
            },
            {
                name: 'issue',
                label: 'issue',
                description: 'The Jira issue key',
                type: AppFieldTypes.TEXT,
                hint: 'MM-11343',
            },
        ],
    } as AppForm,
};

const createCommand: AppBinding = {
    app_id: 'jira',
    label: 'create',
    description: 'Create a new Jira issue',
    form: {
        fields: [
            {
                name: 'project',
                autocomplete_label: 'project',
                description: 'The Jira project description',
                type: AppFieldTypes.DYNAMIC_SELECT,
                hint: 'The Jira project hint',
                source_url: '/projects',
            },
            {
                name: 'summary',
                autocomplete_label: 'summary',
                description: 'The Jira issue summary',
                type: AppFieldTypes.TEXT,
                hint: 'The thing is working great!',
            },
            {
                name: 'epic',
                label: 'epic',
                description: 'The Jira epic',
                type: AppFieldTypes.STATIC_SELECT,
                hint: 'The thing is working great!',
                options: [
                    {
                        label: 'Dylan Epic',
                        value: 'epic1',
                    },
                    {
                        label: 'Michael Epic',
                        value: 'epic2',
                    },
                ],
            },
        ],
    } as AppForm,
};

const definitions: AppBinding[] = [
    {
        app_id: 'jira',
        location: '/command',
        label: 'jira',
        bindings: [{
            app_id: 'jira',
            label: 'issue',
            description: 'Interact with Jira issues',
            bindings: [
                viewCommand,
                createCommand,
            ],
        }],
    },
    {
        app_id: 'other',
        location: '/command',
        label: 'other',
        bindings: [{
            app_id: 'other',
            label: 'sub1',
            description: 'Some Description',
            form: {
                fields: [{
                    name: 'summary',
                    label: 'summary',
                    description: 'The Jira issue summary',
                    type: AppFieldTypes.TEXT,
                    hint: 'The thing is working great!',
                }],
            },
        }],
    },
];

describe('AppCommandParser', () => {
    const makeStore = async (bindings: AppBinding[]) => {
        const initialState = {
            ...reduxTestState,
            entities: {
                ...reduxTestState.entities,
                apps: {bindings},
            },
        } as any;
        const testStore = await mockStore(initialState);

        return testStore;
    };

    let parser: AppCommandParser;
    beforeEach(async () => {
        const store = await makeStore(definitions);
        parser = new AppCommandParser(store, '');
    });

    describe('getFormValues', () => {
        test('filled out form', () => {
            const msg = '/jira issue view dynamic-value --issue  MM-32343';
            const res = parser.getFormValues(msg, viewCommand);
            expect(res).toBeTruthy();
            expect(res).toEqual({
                issue: 'MM-32343',
                project: 'dynamic-value',
            });
        });

        test('with quoted arg', () => {
            const msg = '/jira issue create --project PROJ --summary "My problem"';
            const res = parser.getFormValues(msg, createCommand);
            expect(res).toBeTruthy();
            expect(res).toEqual({
                summary: 'My problem',
                project: 'PROJ',
            });
        });
    });

    describe('getSuggestionsForBaseCommands', () => {
        test('string matches 1', () => {
            const res = parser.getSuggestionsForBaseCommands('/');
            expect(res).toHaveLength(2);
        });

        test('string matches 2', () => {
            const res = parser.getSuggestionsForBaseCommands('/ji');
            expect(res).toHaveLength(1);
        });

        test('string matches 3', () => {
            const res = parser.getSuggestionsForBaseCommands('/jira');
            expect(res).toHaveLength(1);
        });

        test('string is past base command', () => {
            const res = parser.getSuggestionsForBaseCommands('/jira ');
            expect(res).toHaveLength(0);
        });

        test('other command matches', () => {
            const res = parser.getSuggestionsForBaseCommands('/other');
            expect(res).toHaveLength(1);
        });

        test('string does not match', () => {
            const res = parser.getSuggestionsForBaseCommands('/wrong');
            expect(res).toHaveLength(0);
        });
    });

    describe('matchSubCommand', () => {
        test('should return null if no command matches', () => {
            const res = parser.matchSubCommand('/hey');
            expect(res).toBeNull();
        });

        test('should return null if theres no space after', () => {
            const res = parser.matchSubCommand('/jira');
            expect(res).toBeNull();
        });

        test('should return parent', () => {
            const res = parser.matchSubCommand('/jira ') as AppBinding;
            expect(res).toBeTruthy();
            expect(res.app_id).toEqual('jira');
            expect(res.label).toEqual('jira');
        });

        test('should return parent while typing 1', () => {
            const res = parser.matchSubCommand('/jira iss') as AppBinding;
            expect(res).toBeTruthy();
            expect(res.app_id).toEqual('jira');
            expect(res.label).toEqual('jira');
        });

        test('should return parent while typing 2', () => {
            const res = parser.matchSubCommand('/jira issue') as AppBinding;
            expect(res).toBeTruthy();
            expect(res.app_id).toEqual('jira');
            expect(res.label).toEqual('jira');
        });

        test('should return child after space', () => {
            const res = parser.matchSubCommand('/jira issue ') as AppBinding;
            expect(res).toBeTruthy();
            expect(res.label).toEqual('issue');
        });

        test('should return nested child', () => {
            const res = parser.matchSubCommand('/jira issue view ') as AppBinding;
            expect(res).toBeTruthy();
            expect(res.label).toEqual('view');
        });
    });

    describe('getSuggestionsForCursorPosition', () => {
        test('choosing subcommand 1', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestion[] = [];

            cmdStr = [
                '/jira',
                'issue',
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(1);
            expect(res).toEqual([
                {
                    suggestion: 'issue',
                    complete: 'issue',
                    hint: '',
                    description: 'Interact with Jira issues',
                },
            ]);
        });

        test('choosing subcommand 2', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestion[] = [];

            cmdStr = [
                '/jira',
                'issue ',
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(2);
            expect(res).toEqual([
                {
                    suggestion: 'view',
                    complete: 'view',
                    hint: '',
                    description: 'View details of a Jira issue',
                },
                {
                    suggestion: 'create',
                    complete: 'create',
                    hint: '',
                    description: 'Create a new Jira issue',
                },
            ]);
        });

        test('choosing subcommand 3', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestion[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'c',
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(1);
            expect(res).toEqual([
                {
                    suggestion: 'create',
                    complete: 'create',
                    hint: '',
                    description: 'Create a new Jira issue',
                },
            ]);
        });

        test('typing flag', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestion[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'create',
                '--project',
                'KT',
                '--summa',
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(2);
            expect(res).toEqual([
                parser.getSuggestionForExecute(cmdStr),
                {
                    suggestion: '--summary',
                    complete: '--summary',
                    description: 'The Jira issue summary',
                    hint: 'The thing is working great!',
                },
            ]);
        });

        test('show flag args', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestion[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'create',
                '',
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(4);
        });

        test('show positional arg for project value', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestion[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'view',
                '',
            ].join(' ');

            const f = Client4.executeAppCall;
            Client4.executeAppCall = jest.fn().mockResolvedValue(Promise.resolve({data: [{label: 'special-label', value: 'special-value'}]}));

            res = await parser.getSuggestionsForCursorPosition(cmdStr);
            Client4.executeAppCall = f;

            expect(res).toHaveLength(2);
            expect(res).toEqual([
                parser.getSuggestionForExecute(cmdStr),
                {
                    suggestion: 'special-value',
                    description: 'special-label',
                    hint: '',
                    iconData: undefined,
                },
            ]);
        });

        test('show positional arg for issue view project value', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestion[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'view',
                'KT',
                '',
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(2);
            expect(res).toEqual([
                parser.getSuggestionForExecute(cmdStr),
                {
                    suggestion: '--issue',
                    complete: '--issue',
                    description: 'The Jira issue key',
                    hint: 'MM-11343',
                },
            ]);
        });

        test('works with random spaces', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestion[] = [];

            cmdStr = [
                '/jira',
                '    ',
                'issue',
                '   ',
                'view',
                '   ',
                'KT    ',
                '  ',
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(2);
            expect(res).toEqual([
                parser.getSuggestionForExecute(cmdStr),
                {
                    suggestion: '--issue',
                    complete: '--issue',
                    description: 'The Jira issue key',
                    hint: 'MM-11343',
                },
            ]);
        });

        test('static options', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestion[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'create',
                '--project',
                'KT',
                '--summary',
                '"The feature is great!"',
                '--epic',
                '',
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(3);
            expect(res).toEqual([
                parser.getSuggestionForExecute(cmdStr),
                {
                    suggestion: 'Dylan Epic',
                    complete: 'Dylan Epic',
                    hint: '',
                    description: '',
                },
                {
                    suggestion: 'Michael Epic',
                    complete: 'Michael Epic',
                    hint: '',
                    description: '',
                },
            ]);

            cmdStr = [
                '/jira',
                'issue',
                'create',
                '--project',
                'KT',
                '--summary',
                '"The feature is great!"',
                '--epic',
                'M',
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(2);
            const sug = res[1];
            expect(sug).toEqual({
                suggestion: 'Michael Epic',
                complete: 'Michael Epic',
                hint: '',
                description: '',
            });

            cmdStr = [
                '/jira',
                'issue',
                'create',
                '--project',
                'KT',
                '--summary',
                '"The feature is great!"',
                '--epic',
                'Nope',
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);
            expect(res).toHaveLength(1);
            expect(res).toEqual([parser.getSuggestionForExecute(cmdStr)]);
        });

        test('form is filled out, show execute command suggestion', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestion[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'create',
                '--project',
                'KT',
                '--summary',
                '"The feature is great!"',
                '--epic',
                'the_epic',
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);
            expect(res).toHaveLength(1);
            expect(res).toEqual([parser.getSuggestionForExecute(cmdStr)]);
        });
    });
});
