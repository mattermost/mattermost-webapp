import {Client4} from 'mattermost-redux/client';
import {
    ElementType,
    SubCommand,
    getCurrentlyEditingToken,
    SuggestionChoice,
    flattenCommandList,
    getMatchedCommand,
    getSynchronousResults,
    getForm,
    setCommands,
} from './command_parser';

const definitions: SubCommand[] = [
    {
        pretext: '/jira',
        trigger: 'jira',
        sub_commands: [{
            trigger: 'issue',
            pretext: 'issue',
            description: 'Interact with Jira issues',
            sub_commands: [
                {
                    trigger: 'view',
                    pretext: 'view',
                    description: 'View details of a Jira issue',
                    args: [
                        {
                            name: 'project',
                            description: 'The Jira project description',
                            type: ElementType.ElementTypeDynamicSelect,
                            flag_name: 'project',
                            hint: 'The Jira project hint',
                            role_id: 'system_user',
                            positional: true,
                            refresh_url: '/projects',
                        },
                        {
                            name: 'issue_key',
                            description: 'The Jira issue key',
                            type: ElementType.ElementTypeText,
                            flag_name: 'issue',
                            hint: 'MM-11343',
                            role_id: 'system_user',
                            positional: false,
                        },
                    ],
                },
                {
                    trigger: 'create',
                    pretext: 'create',
                    description: 'Create a new Jira issue',
                    args: [
                        {
                            name: 'project',
                            description: 'The Jira project description',
                            type: ElementType.ElementTypeDynamicSelect,
                            flag_name: 'project',
                            hint: 'The Jira project hint',
                            role_id: 'system_user',
                            positional: false,
                            refresh_url: '/projects',
                        },
                        {
                            name: 'summary',
                            description: 'The Jira issue summary',
                            type: ElementType.ElementTypeText,
                            flag_name: 'summary',
                            hint: 'The thing is working great!',
                            role_id: 'system_user',
                            positional: false,
                        },
                        {
                            name: 'epic_link',
                            description: 'The Jira epic',
                            type: ElementType.ElementTypeStaticSelect,
                            flag_name: 'epic',
                            hint: 'The thing is working great!',
                            role_id: 'system_user',
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
            ],
        }],
    },
];

setCommands(definitions);

describe('CommandParser', () => {

    describe('flattenCommandList', () => {
        test('should parse', () => {
            const cmds = flattenCommandList(definitions, '');
            expect(cmds).toHaveLength(4);
        });
    });

    describe('getForm', () => {
        test('string matches 1', () => {
            const msg = '/jira issue view dynamic-value --issue  MM-32343';
            const res = getForm(msg, definitions);
            expect(res).toBeTruthy();
            expect(res).toEqual({
                issue_key: 'MM-32343',
                project: 'dynamic-value',
            });
        });
    });

    describe('getSynchronousResults', () => {
        test('string matches 1', () => {
            const res = getSynchronousResults('/', definitions);
            expect(res).toHaveLength(1);
        });

        test('string matches 2', () => {
            const res = getSynchronousResults('/ji', definitions);
            expect(res).toHaveLength(1);
        });

        test('string matches 3', () => {
            const res = getSynchronousResults('/jira', definitions);
            expect(res).toHaveLength(1);
        });

        test('string is past base command', () => {
            const res = getSynchronousResults('/jira ', definitions);
            expect(res).toHaveLength(0);
        });

        test('string does not match', () => {
            const res = getSynchronousResults('/other', definitions);
            expect(res).toHaveLength(0);
        });
    });

    describe('getMatchedCommand', () => {
        test('should return null if no command matches', () => {
            let res;
            res = getMatchedCommand('/hey', definitions);
            expect(res).toBeNull();
        });

        test('should return null if theres no space after', () => {
            let res;
            res = getMatchedCommand('/jira', definitions);
            expect(res).toBeNull();
        });

        test('should return parent', () => {
            let res;
            res = getMatchedCommand('/jira ', definitions);
            expect(res).toBeTruthy();
            expect(res.pretext).toEqual(definitions[0].pretext);
        });

        test('should return parent while typing 1', () => {
            let res;
            res = getMatchedCommand('/jira iss', definitions);
            expect(res).toBeTruthy();
            expect(res.pretext).toEqual(definitions[0].pretext);
        });

        test('should return parent while typing 2', () => {
            let res;
            res = getMatchedCommand('/jira issue', definitions);
            expect(res).toBeTruthy();
            expect(res.pretext).toEqual(definitions[0].pretext);
        });

        test('should return child after space', () => {
            let res;
            res = getMatchedCommand('/jira issue ', definitions);
            expect(res).toBeTruthy();
            expect(res.pretext).toEqual('issue');
        });

        test('should return nested child', () => {
            let res;
            res = getMatchedCommand('/jira issue view ', definitions);
            expect(res).toBeTruthy();
            expect(res.pretext).toEqual('view');
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

            res = await getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(1);
            expect(res).toEqual([
                {
                    suggestion: 'issue',
                    complete: 'issue',
                    description: 'Interact with Jira issues',
                    hint: 'issue',
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

            res = await getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(2);
            expect(res).toEqual([
                {
                    suggestion: 'view',
                    complete: 'view',
                    description: 'View details of a Jira issue',
                    hint: 'view',
                },
                {
                    suggestion: 'create',
                    complete: 'create',
                    description: 'Create a new Jira issue',
                    hint: 'create',
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

            res = await getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(1);
            expect(res).toEqual([
                {
                    suggestion: 'create',
                    complete: 'create',
                    description: 'Create a new Jira issue',
                    hint: 'create',
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

            res = await getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(1);
            expect(res).toEqual([
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

            res = await getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(3);
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

            res = await getCurrentlyEditingToken(cmdStr, definitions);
            Client4.executePluginCall = f;

            expect(res).toHaveLength(1);
            expect(res).toEqual([{
                suggestion: 'special-value',
                description: 'special-label',
                hint: '',
                iconData: undefined,
            }]);
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

            res = await getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(1);
            expect(res).toEqual([{
                suggestion: '--issue',
                complete: '--issue',
                description: 'The Jira issue key',
                hint: 'MM-11343',
            }]);
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

            res = await getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(1);
            expect(res).toEqual([{
                suggestion: '--issue',
                complete: '--issue',
                description: 'The Jira issue key',
                hint: 'MM-11343',
            }]);
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
                '"Hey dude"',
                '--epic',
                ''
            ].join(' ');

            res = await getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(2);
            expect(res).toEqual([
                {
                    suggestion: 'Dylan Epic',
                    complete: 'Dylan Epic',
                    description: '',
                    hint: 'Dylan Epic',
                },
                {
                    suggestion: 'Michael Epic',
                    complete: 'Michael Epic',
                    description: '',
                    hint: 'Michael Epic',
                },
            ]);

            cmdStr = [
                '/jira',
                'issue',
                'create',
                '--project',
                'KT',
                '--summary',
                '"Hey dude"',
                '--epic',
                'M'
            ].join(' ');

            res = await getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(1);
            const sug = res[0];
            expect(sug).toEqual({
                suggestion: 'Michael Epic',
                complete: 'Michael Epic',
                description: '',
                hint: 'Michael Epic',
            });

            cmdStr = [
                '/jira',
                'issue',
                'create',
                '--project',
                'KT',
                '--summary',
                '"Hey dude"',
                '--epic',
                'Nope'
            ].join(' ');

            res = await getCurrentlyEditingToken(cmdStr, definitions);

            expect(res).toHaveLength(0);
        });
    });
});
