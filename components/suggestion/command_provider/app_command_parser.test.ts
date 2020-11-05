// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import {Client4} from 'mattermost-redux/client';

import {AppBinding, AppFieldTypes, AppForm} from 'mattermost-redux/types/apps';

import {
    AutocompleteSuggestion,
    AppCommandParser,
    AutocompleteSuggestionWithComplete,
} from './app_command_parser';
import {reduxTestState} from './test_data';

const mockStore = configureStore([thunk]);

const definitions: AppBinding[] = [
    {
        app_id: 'jira',
        location_id: '/command',
        label: 'jira',
        bindings: [{
            app_id: 'jira',
            label: 'issue',
            description: 'Interact with Jira issues',
            bindings: [
                {
                    app_id: 'jira',
                    label: 'view',
                    description: 'View details of a Jira issue',
                    func: {
                        data: {
                            form: {
                                fields: [
                                    {
                                        name: 'project',
                                        autocomplete_label: 'project',
                                        description: 'The Jira project description',
                                        type: AppFieldTypes.DYNAMIC_SELECT,
                                        // flag_name: 'project',
                                        hint: 'The Jira project hint',
                                        // role_id: 'system_user',
                                        position: 1,
                                        source_url: '/projects',
                                    },
                                    {
                                        name: 'issue',
                                        autocomplete_label: 'issue',
                                        description: 'The Jira issue key',
                                        type: AppFieldTypes.TEXT,
                                        // flag_name: 'issue',
                                        hint: 'MM-11343',
                                        // role_id: 'system_user',
                                    },
                                ],
                            } as AppForm,
                        },
                    },
                },
                {
                    app_id: 'jira',
                    label: 'create',
                    description: 'Create a new Jira issue',
                    func: {
                        data: {
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
                                        autocomplete_label: 'epic',
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
                        },
                    },
                },
            ],
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
    }

    let parser: AppCommandParser;
    beforeEach(async () => {
        const store = await makeStore(definitions);
        parser = new AppCommandParser(store.dispatch, store.getState, '');
    });

    describe('flattenCommandList', () => {
        test('should parse', () => {
            const bindings = parser.flattenCommandList(definitions, '');
            expect(bindings).toHaveLength(4);
            expect(bindings.map((b) => b.fullPretext)).toEqual([
                'jira',
                'jira issue',
                'jira issue view',
                'jira issue create',
            ]);
        });
    });

    describe('getForm', () => {
        test('filled out form', () => {
            const msg = '/jira issue view dynamic-value --issue  MM-32343';
            const flattened = parser.flattenCommandList(definitions);
            const res = parser.getForm(msg, flattened[2]);
            expect(res).toBeTruthy();
            expect(res).toEqual({
                issue: 'MM-32343',
                project: 'dynamic-value',
            });
        });
    });

    describe('getAppSuggestionsForBindings', () => {
        test('string matches 1', () => {
            const res = parser.getAppSuggestionsForBindings('/');
            expect(res).toHaveLength(1);
        });

        test('string matches 2', () => {
            const res = parser.getAppSuggestionsForBindings('/ji');
            expect(res).toHaveLength(1);
        });

        test('string matches 3', () => {
            const res = parser.getAppSuggestionsForBindings('/jira');
            expect(res).toHaveLength(1);
        });

        test('string is past base command', () => {
            const res = parser.getAppSuggestionsForBindings('/jira ');
            expect(res).toHaveLength(0);
        });

        test('string does not match', () => {
            const res = parser.getAppSuggestionsForBindings('/other');
            expect(res).toHaveLength(0);
        });
    });

    describe('matchBinding', () => {
        test('should return null if no command matches', () => {
            let res;
            res = parser.matchBinding('/hey');
            expect(res).toBeNull();
        });

        test('should return null if theres no space after', () => {
            let res;
            res = parser.matchBinding('/jira');
            expect(res).toBeNull();
        });

        test('should return parent', () => {
            let res;
            res = parser.matchBinding('/jira ');
            expect(res).toBeTruthy();
            expect(res.label).toEqual(definitions[0].label);
        });

        test('should return parent while typing 1', () => {
            let res;
            res = parser.matchBinding('/jira iss');
            expect(res).toBeTruthy();
            expect(res.label).toEqual(definitions[0].label);
        });

        test('should return parent while typing 2', () => {
            let res;
            res = parser.matchBinding('/jira issue');
            expect(res).toBeTruthy();
            expect(res.label).toEqual(definitions[0].label);
        });

        test('should return child after space', () => {
            let res;
            res = parser.matchBinding('/jira issue ');
            expect(res).toBeTruthy();
            expect(res.label).toEqual('issue');
        });

        test('should return nested child', () => {
            let res;
            res = parser.matchBinding('/jira issue view ');
            expect(res).toBeTruthy();
            expect(res.label).toEqual('view');
        });
    });

    describe('getSuggestionsForCursorPosition', () => {
        test('choosing subcommand 1', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestionWithComplete[] = [];

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
                    description: 'Interact with Jira issues',
                },
            ]);
        });

        test('choosing subcommand 2', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestionWithComplete[] = [];

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
                    description: 'View details of a Jira issue',
                },
                {
                    suggestion: 'create',
                    complete: 'create',
                    description: 'Create a new Jira issue',
                },
            ]);
        });

        test('choosing subcommand 3', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestionWithComplete[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'c'
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(1);
            expect(res).toEqual([
                {
                    suggestion: 'create',
                    complete: 'create',
                    description: 'Create a new Jira issue',
                },
            ]);
        });

        test('typing flag', async () => {
            let cmdStr = '';
            let res: AutocompleteSuggestionWithComplete[] = [];

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
            let res: AutocompleteSuggestionWithComplete[] = [];

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
            let res: AutocompleteSuggestionWithComplete[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'view',
                '',
            ].join(' ');

            const f = Client4.executeAppCall
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
            let res: AutocompleteSuggestionWithComplete[] = [];

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
            let res: AutocompleteSuggestionWithComplete[] = [];

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
            let res: AutocompleteSuggestionWithComplete[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'create',
                '--project',
                'KT',
                '--summary',
                '"The feature is great!"',
                '--epic',
                ''
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(3);
            expect(res).toEqual([
                parser.getSuggestionForExecute(cmdStr),
                {
                    suggestion: 'Dylan Epic',
                    complete: 'Dylan Epic',
                    description: '',
                },
                {
                    suggestion: 'Michael Epic',
                    complete: 'Michael Epic',
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
                'M'
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(2);
            const sug = res[1];
            expect(sug).toEqual({
                suggestion: 'Michael Epic',
                complete: 'Michael Epic',
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
                'Nope'
            ].join(' ');

            res = await parser.getSuggestionsForCursorPosition(cmdStr);

            expect(res).toHaveLength(1);
            expect(res).toEqual([parser.getSuggestionForExecute(cmdStr)])
        });
    });
});
