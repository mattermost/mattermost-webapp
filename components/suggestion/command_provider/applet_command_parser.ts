// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getPluginsLocations} from 'mattermost-redux/selectors/entities/plugins';
import {default as PluginLocationConst} from 'mattermost-redux/constants/plugins';
import {GlobalState} from 'mattermost-redux/types/store';
import {PluginLocation} from 'mattermost-redux/types/plugins';

import * as Utils from 'utils/utils.jsx';

import {
    AppletCall,
    AutocompleteDynamicSelect,
    AutocompleteElement,
    AutocompleteStaticSelect,
    AppletBinding,
    AppletContext,
    FormMetadataResponse,
    AppletField,
    AppletSelectOption,
    AppletFieldTypes,
} from 'actions/applet_types';

import {EXECUTE_CURRENT_COMMAND_ITEM_ID} from './command_provider';
import {doAppletCall} from 'actions/applets';

export type SuggestionChoice = {
    suggestion: string;
    complete?: string;
    getComplete?: (pretext: string, value: string) => string;
    description?: string;
    hint?: string;
    iconData?: string;
}

export const decorateSuggestionChoiceComplete = (pretext: string, choice: SuggestionChoice): SuggestionChoice => {
    if (choice.complete?.endsWith(EXECUTE_CURRENT_COMMAND_ITEM_ID)) {
        return choice;
    }

    const words = pretext.split(' ');
    words.pop();
    const before = words.join(' ') + ' ';

    if (choice.getComplete) {
        choice.complete = choice.getComplete(pretext, choice.suggestion);
    }
    choice.hint = choice.hint || '';

    if (!words.length) {
        // base command
        return choice;
    }

    return {
        ...choice,
        suggestion: '/' + choice.suggestion,
        complete: before + choice.suggestion,
    };
}

const extractBaseCommand = (pretext: string) => {
    return pretext.substring(1).split(' ')[0];
}

export const shouldHandleCommand = (pretext: string, bindings: AppletBinding[]): boolean => {
    for (const binding of bindings) {
        let trigger = binding.name;
        if (!trigger) {
            continue;
        }

        if (trigger[0] !== '/') {
            trigger = '/' + trigger;
        }

        if (pretext.startsWith(trigger + ' ')) {
            return true;
        }
    }
    return false;
}

let ARGS: AppletContext = {};
let COMMANDS: AppletBinding[] = [];
export const setCommands = ((cmds: AppletBinding[]) => COMMANDS = cmds); // hacky for tests

export const fetchCloudAppCommand = async (binding: AppletBinding): Promise<AppletBinding | void> => {
    if (!binding.call) {
        return;
    }

    const payload: AppletCall = {
        ...binding.call,
        as_modal: true,
        context: {
            ...ARGS,
            app_id: binding.app_id,
        },
    };

    const res = await doAppletCall<void, FormMetadataResponse>(payload);
    if (res.data) {
        const b = {
            ...binding,
            func: res.data,
        }
        COMMANDS.push(b);
        return b;
    }
}

export const getCloudAppCommandLocations = (state: GlobalState): AppletBinding[] => {
    // return STATIC_BINDINGS;
    const bindings = getPluginsLocations(state, "/command");
    return bindings;
}

export const getCloudAppCommand = (name: string): AppletBinding | void => {
    return COMMANDS.find((c) => c.name === name);
}

export const getCloudAppCommands = (): AppletBinding[] => {
    return COMMANDS;
}

export const handleCommand = async (pretext: string, bindings: AppletBinding[], args: {channel_id: string; root_id?: string;}): Promise<SuggestionChoice[]> => {
    ARGS = {
        app_id: '',
        acting_user_id: '',
        channel_id: args.channel_id,
        root_post_id: args.root_id,
    };

    const base = extractBaseCommand(pretext);
    let binding = getCloudAppCommand(base);
    if (!binding) {
        binding = bindings.find((b) => b.name === base);
        if (!binding) {
            return [];
        }
        if (binding.call) {
            binding = await fetchCloudAppCommand(binding);
        }
    }

    if (!binding) {
        return [{suggestion: 'oh no'}]
    }
    const res = await getCurrentlyEditingToken(pretext, [binding]);
    return res.map((sug) => decorateSuggestionChoiceComplete(pretext, sug));
}

export const getSynchronousResults = (pretext: string, bindings: AppletBinding[]): SuggestionChoice[] => {
    const result: SuggestionChoice[] = [];
    for (const binding of bindings) {
        let trigger = binding.name;
        if (trigger[0] !== '/') {
            trigger = '/' + trigger;
        }
        if (trigger.startsWith(pretext)) {
            result.push(decorateSuggestionChoiceComplete(pretext, {
                complete: trigger,
                suggestion: trigger,
                // description: cmd.description,
                // hint: cmd.pretext,
            }));
        }
    }

    return result;
}

export const getCurrentlyEditingToken = async (pretext: string, bindings: AppletBinding[]): Promise<SuggestionChoice[]> => {
    if (!pretext.length) {
    }

    let cmd = getMatchedCommand(pretext, bindings);

    if (!cmd) {
        return [];
    }

    let suggestions: SuggestionChoice[] = [];
    if (cmd.bindings && cmd.bindings.length) {
        const subSuggestions = getSuggestionsForSubCommands(pretext, cmd);
        suggestions = suggestions.concat(subSuggestions);
    } else {
        // Add "Execute Current Command" suggestion
        const execute = getSuggestionForExecute(pretext);
        suggestions = [execute, ...suggestions];
    }

    if (cmd.call && !cmd.func) {
        cmd = await fetchCloudAppCommand(cmd);
    }

    if (cmd.func && cmd.func.form) {
        const argSuggestions = await getSuggestionsForArguments(pretext, cmd);
        suggestions = suggestions.concat(argSuggestions);
    }

    return suggestions;
};

export const getSuggestionForExecute = (pretext: string): SuggestionChoice => {
    let cmd = 'Ctrl';
    if (Utils.isMac()) {
        cmd = '⌘';
    }

    return {
        complete: pretext + EXECUTE_CURRENT_COMMAND_ITEM_ID,
        suggestion: '/Execute Current Command',
        hint: '',
        description: 'Select this option or use ' + cmd + '+Enter to execute the current command.',
        iconData: EXECUTE_CURRENT_COMMAND_ITEM_ID,
    }
}

const getSuggestionsForArguments = async (pretext: string, binding: AppletBinding): Promise<SuggestionChoice[]> => {
    if (!binding.func || !binding.func.form) {
        return [];
    }

    const form = binding.func.form;
    const positionalDefinitions = form.fields.filter((d) => d.positional);

    let tokens = getTokens(pretext);

    tokens = tokens.slice(binding.fullPretext?.split(' ').length);
    const lastToken = tokens.pop();

    const position = tokens.length;

    const field = positionalDefinitions[position];
    if (field) {
        return getSuggestionsForField(field, lastToken.value, pretext);
    }

    const previousToken = tokens[position-1];
    if (previousToken && previousToken.type === 'flag') {
        const field = form.fields.find((arg) => arg.name === previousToken.name);
        if (field) {
            return getSuggestionsForField(field, lastToken.value, pretext);
        }
        return [];
    }

    // '', '-', or '--' (show named args)
    if ('--'.startsWith(lastToken.value.trim())) {
        const available = form.fields.filter((arg) => {
            if (arg.positional) {
                return false;
            }
            if (tokens.find((t) => t.type === 'flag' && t.name === arg.name)) {
                return false;
            }
            if (arg.name.startsWith(lastToken.name)) {
                return true;
            }

            return false;
        });
        return getSuggestionsFromFlags(available);
    }

    return [{suggestion: 'Default Argument Suggestion'}];
};

export const getSuggestionsForField = async (field: AutocompleteElement, userInput: string, pretext: string): Promise<SuggestionChoice[]> => {
    switch (field.type) {
        case AppletFieldTypes.BOOL:
            return getBooleanSuggestions(userInput);
        case AppletFieldTypes.DYNAMIC_SELECT:
            return getDynamicSelectSuggestions(field as AutocompleteDynamicSelect, userInput, pretext)
        case AppletFieldTypes.STATIC_SELECT:
            return getStaticSelectSuggestions(field as AutocompleteStaticSelect, userInput)
    }

    return [{
        complete: '',
        suggestion: userInput,
        description: field.description,
        hint: field.hint,
    }];
}

export const getStaticSelectSuggestions = (field: AutocompleteStaticSelect, userInput: string): SuggestionChoice[] => {
    const opts = field.options.filter((opt) => opt.label.toLowerCase().startsWith(userInput.toLowerCase()));
    return opts.map((opt) => ({
        complete: opt.label,
        suggestion: opt.label,
        // hint: opt.label,
        description: '',
    }));
}

export const getDynamicSelectSuggestions = async (field: AppletField, userInput: string, cmdStr: string): Promise<SuggestionChoice[]> => {
    const values = getForm(cmdStr, COMMANDS);

    const cmd = getMatchedCommand(cmdStr, COMMANDS);

    const payload: AppletCall = {
        url: field.source_url || '',
        context: {
            ...ARGS,
            app_id: cmd.app_id,
        },
        values,
        raw_command: cmdStr,
    };

    const res = await doAppletCall<{}, AppletSelectOption[]>(payload);
    if (!res.data) {
        return [{suggestion: 'Received no data for dynamic suggestions'}];
    }

    return res.data.map(({label, value, icon_data}): SuggestionChoice => ({
        description: label,
        suggestion: value,
        hint: '',
        iconData: icon_data,
    }));
}

export const getBooleanSuggestions = (userInput: string): SuggestionChoice[] => {
    const suggestions: SuggestionChoice[] = [];

    if ('true'.startsWith(userInput)) {
        suggestions.push({
            complete: 'true',
            suggestion: 'true',
        });
    }
    if ('false'.startsWith(userInput)) {
        suggestions.push({
            complete: 'false',
            suggestion: 'false',
        });
    }
    return suggestions;
}

export const getSuggestionsFromFlags = (flags: AutocompleteElement[]): SuggestionChoice[] => {
    return flags.map((flag) => ({
        complete: '--' + flag.name,
        suggestion: '--' + flag.name,
        description: flag.description,
        hint: flag.hint,
    }));
};

export const getSuggestionsForSubCommands = (cmdStr: string, binding: AppletBinding): SuggestionChoice[] => {
    if (!binding.bindings || !binding.bindings.length) {
        return [];
    }

    const result: SuggestionChoice[] = [];

    cmdStr = cmdStr.substring((binding.fullPretext + ' ').length).toLowerCase().trim();
    for (const sub of binding.bindings) {
        if (sub.name.toLowerCase().startsWith(cmdStr)) {
            result.push({
                complete: sub.name,
                suggestion: sub.name,
                description: sub.description,
                // hint: sub.pretext,
            });
        }
    }

    return result;
}

export const getMatchedCommand = (cmdStr: string, bindings: AppletBinding[]): AppletBinding => {
    const endsInSpace = cmdStr[cmdStr.length-1] === ' ';
    cmdStr = cmdStr.split(' ').map((t) => t.trim()).filter(Boolean).join(' ');
    if (endsInSpace) {
        cmdStr += ' ';
    }
    cmdStr = cmdStr.substring(1);

    const flattened = flattenCommandList(bindings, '');
    return flattened.reduce((prev, current) => {
        if (!cmdStr.startsWith(current.fullPretext + ' ')) {
            return prev;
        }
        if (!prev) {
            return current;
        }
        if (prev.fullPretext.length > current.fullPretext.length) {
            return prev;
        }
        return current;
    }, null);
};

type BindingWithFullPretext = AppletBinding & {fullPretext: string};

export const flattenCommandList = (bindings: AppletBinding[], trigger=''): BindingWithFullPretext[] => {
    let result: BindingWithFullPretext[] = [];
    for (const binding of bindings) {
        const newPretext = trigger + binding.name;
        result.push({
            ...binding,
            fullPretext: newPretext,
        });
        if (binding.bindings && binding.bindings.length) {
            const children = flattenCommandList(binding.bindings, newPretext + ' ');
            result = result.concat(children);
        }
    }

    return result;
}

export const getSubmissionPayload = async (cmdStr: string, bindings: AppletBinding[], args: AppletContext): Promise<AppletCall | void> => {
    flattenCommandList(bindings)
    let cmd = getMatchedCommand(cmdStr, bindings);
    if (!cmd || !cmd.call) {
        return;
    }
    if (cmd.call && !cmd.func) {
        cmd = await fetchCloudAppCommand(cmd);
    }

    const values = getForm(cmdStr, cmd);

    const payload: AppletCall = {
        ...cmd.call,
        context: {
            ...args,
            app_id: cmd.app_id,
        },
        values,
        raw_command: cmdStr,
    };
    return payload;
};

export const getForm = (cmdStr: string, cmd: AppletBinding): {[name: string]: AutocompleteElement} => {
    if (!cmd) {
        return {error: 'no command'};
    }

    if (!cmd.func || !cmd.func.form) {
        return {};
    }

    cmdStr = cmdStr.substring(1);
    cmdStr = cmdStr.substring(cmd.fullPretext.length).trim();

    const tokens = getTokens(cmdStr);
    const positionalDefinitions = cmd.func.form.fields.filter((f) => f.positional);

    const resolvedTokens = resolveNamedArguments(tokens);

    const form = cmd.func.form;

    const res: {[name: string]: any} = {};
    resolvedTokens.forEach((token, i) => {
        let name = token.name || '';
        if (!name.length && token.type === 'positional' && positionalDefinitions[i]) {
            name = positionalDefinitions[i].name;
        }

        if (!name.length) {
            // throw {error: ['couldnt find item', token]};
            return;
        }

        const arg = form.fields.find((arg) => arg.name === name);
        if (!arg) {
            // throw {error: ['couldnt find item 2', token]};
            return;
        }

        // res[arg.name] = {
        //     ...arg,
        //     value: token.value,
        // };
        res[arg.name] = token.value;
    });

    return res;
}

export const resolveNamedArguments = (tokens: Token[]) => {
    const result = [];

    let namedArg = '';
    for (const token of tokens) {
        if (token.type === 'flag') {
            namedArg = token.name;
            continue;
        }

        if (namedArg.length) {
            result.push(makeNamedArgumentToken(namedArg, token.value));
            namedArg = '';
        } else {
            result.push(makePositionalArgumentToken('', token.value));
        }
    }

    return result;
}

type Token = {
    type: string;
    name: string;
    value: string;
}

export const getTokens = (cmdString: string): Token[] => {
    const tokens: Token[] = [];
    const words = cmdString.split(' ');

    let quotedArg = '';

    words.forEach((word, index) => {
        if (!word.trim().length) {
            if (quotedArg.length) {
                quotedArg += word;
            }

            if (index === words.length - 1) {
                tokens.push(makePositionalArgumentToken('', quotedArg));
            }
            return;
        }

        if (quotedArg.length) {
            quotedArg += ` ${word}`;
            if (index === words.length - 1) {
                tokens.push(makePositionalArgumentToken('', word));
                return;
            }
            if (word.endsWith('"')) {
                const trimmed = quotedArg.substring(1, quotedArg.length - 1);
                tokens.push(makePositionalArgumentToken('', trimmed));
                quotedArg = '';
            } else if (index === words.length - 1) {
                tokens.push(makePositionalArgumentToken('', word));
            }
            return;
        }

        if (word.startsWith('"')) {
            quotedArg = word;
            return;
        }

        if (word.startsWith('--')) {
            // if there is a named argument before this, it will be ignored
            tokens.push(makeNamedFlagToken(word.substring(2), ''));
            return;
        }

        tokens.push(makePositionalArgumentToken('', word));
    });

    return tokens;
}

const makeNamedFlagToken = (name: string, value: string) => {
    return {
        type: 'flag',
        name,
        value,
    };
}

const makeNamedArgumentToken = (name: string, value: string) => {
    return {
        type: 'named',
        name,
        value,
    };
}

const makePositionalArgumentToken = (name: string, value: string) => {
    return {
        type: 'positional',
        name,
        value,
    };
}

const STATIC_BINDINGS: AppletBinding[] = [
    {
        app_id: 'jira',
        name: '/michael',
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
