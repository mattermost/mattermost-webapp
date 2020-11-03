import {Client4} from 'mattermost-redux/client';
import {
    getCurrentlyEditingToken,
    SuggestionChoice,
    flattenCommandList,
    getMatchedCommand,
    getSynchronousResults,
    getForm,
    setCommands,
    getSuggestionForExecute,
    AppCommandParser,
} from './applet_command_parser';

import {AppletBinding, AppletFieldTypes} from 'actions/applet_types'

const definitions: AppletBinding[] = [
    {
        app_id: 'jira',
        name: 'jira',
        bindings: [{
            app_id: 'jira',
            name: 'issue',
            description: 'Interact with Jira issues',
            bindings: [
                {
                    app_id: 'jira',
                    name: 'view',
                    description: 'View details of a Jira issue',
                    func: {
                        form: {
                            fields: [
                                {
                                    name: 'project',
                                    description: 'The Jira project description',
                                    type: AppletFieldTypes.DYNAMIC_SELECT,
                                    // flag_name: 'project',
                                    hint: 'The Jira project hint',
                                    // role_id: 'system_user',
                                    positional: true,
                                    source_url: '/projects',
                                },
                                {
                                    name: 'issue',
                                    description: 'The Jira issue key',
                                    type: AppletFieldTypes.TEXT,
                                    // flag_name: 'issue',
                                    hint: 'MM-11343',
                                    // role_id: 'system_user',
                                    positional: false,
                                },
                            ],
                        },
                    },
                },
                {
                    app_id: 'jira',
                    name: 'create',
                    description: 'Create a new Jira issue',
                    func: {
                        form: {
                            fields: [
                                {
                                    name: 'project',
                                    description: 'The Jira project description',
                                    type: AppletFieldTypes.DYNAMIC_SELECT,
                                    hint: 'The Jira project hint',
                                    positional: false,
                                    source_url: '/projects',
                                },
                                {
                                    name: 'summary',
                                    description: 'The Jira issue summary',
                                    type: AppletFieldTypes.TEXT,
                                    hint: 'The thing is working great!',
                                    positional: false,
                                },
                                {
                                    name: 'epic',
                                    description: 'The Jira epic',
                                    type: AppletFieldTypes.STATIC_SELECT,
                                    hint: 'The thing is working great!',
                                    positional: false,
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
                        },
                    },
                },
            ],
        }],
    },
];

setCommands(definitions);

describe('CommandParser', () => {
    let parser: AppCommandParser;
    beforeEach(() => {
        parser = new AppCommandParser(definitions);
    });

    describe('flattenCommandList', () => {
        test('should parse', () => {
            const cmds = parser.flattenCommandList(definitions, '');
            expect(cmds).toHaveLength(4);
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

    describe('getSynchronousResults', () => {
        test('string matches 1', () => {
            const res = parser.getAppSuggestionsForBindings('/', definitions);
            expect(res).toHaveLength(1);
        });

        test('string matches 2', () => {
            const res = parser.getAppSuggestionsForBindings('/ji', definitions);
            expect(res).toHaveLength(1);
        });

        test('string matches 3', () => {
            const res = parser.getAppSuggestionsForBindings('/jira', definitions);
            expect(res).toHaveLength(1);
        });

        test('string is past base command', () => {
            const res = parser.getAppSuggestionsForBindings('/jira ', definitions);
            expect(res).toHaveLength(0);
        });

        test('string does not match', () => {
            const res = parser.getAppSuggestionsForBindings('/other', definitions);
            expect(res).toHaveLength(0);
        });
    });

    describe('getMatchedCommand', () => {
        test('should return null if no command matches', () => {
            let res;
            res = parser.matchBinding('/hey', definitions);
            expect(res).toBeNull();
        });

        test('should return null if theres no space after', () => {
            let res;
            res = parser.matchBinding('/jira', definitions);
            expect(res).toBeNull();
        });

        test('should return parent', () => {
            let res;
            res = parser.matchBinding('/jira ', definitions);
            expect(res).toBeTruthy();
            expect(res.name).toEqual(definitions[0].name);
        });

        test('should return parent while typing 1', () => {
            let res;
            res = parser.matchBinding('/jira iss', definitions);
            expect(res).toBeTruthy();
            expect(res.name).toEqual(definitions[0].name);
        });

        test('should return parent while typing 2', () => {
            let res;
            res = parser.matchBinding('/jira issue', definitions);
            expect(res).toBeTruthy();
            expect(res.name).toEqual(definitions[0].name);
        });

        test('should return child after space', () => {
            let res;
            res = parser.matchBinding('/jira issue ', definitions);
            expect(res).toBeTruthy();
            expect(res.name).toEqual('issue');
        });

        test('should return nested child', () => {
            let res;
            res = parser.matchBinding('/jira issue view ', definitions);
            expect(res).toBeTruthy();
            expect(res.name).toEqual('view');
        });
    });

    describe('getCurrentlyEditingToken', () => {
        test('choosing subcommand 1', async () => {
            let cmdStr = '';
            let res: SuggestionChoice[] = [];

            cmdStr = [
                '/jira',
                'issue',
            ].join(' ');

            res = await parser.getCurrentlyEditingToken(cmdStr, definitions);

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
            let res: SuggestionChoice[] = [];

            cmdStr = [
                '/jira',
                'issue ',
            ].join(' ');

            res = await parser.getCurrentlyEditingToken(cmdStr, definitions);

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
            let res: SuggestionChoice[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'c'
            ].join(' ');

            res = await parser.getCurrentlyEditingToken(cmdStr, definitions);

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
            let res: SuggestionChoice[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'create',
                '--project',
                'KT',
                '--summa',
            ].join(' ');

            res = await parser.getCurrentlyEditingToken(cmdStr, definitions);

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
            let res: SuggestionChoice[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'create',
                '',
            ].join(' ');

            res = await parser.getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(4);
        });

        test('show positional arg for project value', async () => {
            let cmdStr = '';
            let res: SuggestionChoice[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'view',
                '',
            ].join(' ');

            const f = Client4.executePluginCall
            Client4.executePluginCall = () => Promise.resolve({data: [{label: 'special-label', value: 'special-value'}]});

            res = await parser.getCurrentlyEditingToken(cmdStr, definitions);
            Client4.executePluginCall = f;

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
            let res: SuggestionChoice[] = [];

            cmdStr = [
                '/jira',
                'issue',
                'view',
                'KT',
                '',
            ].join(' ');

            res = await parser.getCurrentlyEditingToken(cmdStr, definitions);

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
            let res: SuggestionChoice[] = [];

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

            res = await parser.getCurrentlyEditingToken(cmdStr, definitions);

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
            let res: SuggestionChoice[] = [];

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

            res = await parser.getCurrentlyEditingToken(cmdStr, definitions);

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

            res = await parser.getCurrentlyEditingToken(cmdStr, definitions);

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

            res = await parser.getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(1);
            expect(res).toEqual([parser.getSuggestionForExecute(cmdStr)])
        });
    });
});
