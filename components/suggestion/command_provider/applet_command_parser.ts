// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getPluginsLocations} from 'mattermost-redux/selectors/entities/plugins';
import {default as PluginLocationConst} from 'mattermost-redux/constants/plugins';
import {GlobalState} from 'mattermost-redux/types/store';
import {PluginLocation} from 'mattermost-redux/types/plugins';

import * as Utils from 'utils/utils.jsx';

import {
    AppletCall,
    // AutocompleteDynamicSelect,
    // AutocompleteElement,
    // AutocompleteStaticSelect,
    AppletBinding,
    AppletContext,
    AppletFormMetadataResponse,
    AppletField,
    AppletSelectOption,
    AppletFieldTypes,
    AppletCallResponse,
    AppletFunction,
    AppBinding,
} from 'actions/applet_types';

import {EXECUTE_CURRENT_COMMAND_ITEM_ID} from './command_provider';
import {doAppletCall} from 'actions/applets';
import {CallResponseTypes} from 'actions/app_daniel';

export type SuggestionChoice = {
    suggestion: string;
    complete?: string;
    getComplete?: (pretext: string, value: string) => string;
    description?: string;
    hint?: string;
    iconData?: string;
}

type BindingWithFullPretext = AppletBinding & {fullPretext: string}

const extractBaseCommand = (pretext: string) => {
    return pretext.substring(1).split(' ')[0];
}

let ARGS: AppletContext = {};
let COMMANDS: AppletBinding[] = [];

export const setCommands = ((cmds: AppletBinding[]) => COMMANDS = cmds); // hacky for tests

export const getAppCommandLocations = (state: GlobalState): AppletBinding[] => {
    // return STATIC_BINDINGS;
    const bindings = getPluginsLocations(state, "/command");
    return bindings;
}

export class AppCommandParser {
    private bindings: AppletBinding[];
    private context: AppletContext;

    constructor(bindings: AppletBinding[], context: AppletContext & {root_id?: string}) {
        if (context.root_id) {
            context.root_post_id = context.root_id;
        }

        this.bindings = bindings;
        this.context = context;
    }

    decorateSuggestionChoiceComplete = (pretext: string, choice: SuggestionChoice): SuggestionChoice => {
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

    isAppCommand = (pretext: string): boolean => {
        for (const binding of this.bindings) {
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

    fetchAppCommand = async (binding: AppletBinding): Promise<AppletBinding | undefined> => {
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

        let res: AppletFormMetadataResponse | undefined;
        try {
            res = await doAppletCall<void, AppletFunction>(payload);
        } catch (e) {
            console.error(e);
            return;
        }

        if (res && res.data) {
            const b = {
                ...binding,
                func: res.data,
            }
            COMMANDS.push(b);
            return b;
        }
    }

    getAppCommand = (name: string): AppletBinding | void => {
        return COMMANDS.find((c) => c.name === name);
    }

    getAppCommands = (): AppletBinding[] => {
        return COMMANDS;
    }

    getAppCommandSuggestions = async (pretext: string): Promise<SuggestionChoice[]> => {
        ARGS = {
            app_id: '',
            acting_user_id: '',
            channel_id: this.context.channel_id,
            root_post_id: this.context.root_post_id || this.context.root_id,
        };

        const base = extractBaseCommand(pretext);
        let binding = this.getAppCommand(base);
        if (!binding) {
            binding = this.bindings.find((b) => b.name === base);
            if (!binding) {
                return [];
            }
            if (binding.call) {
                binding = await this.fetchAppCommand(binding);
            }
        }

        if (!binding) {
            return [{suggestion: 'oh no'}]
        }
        const suggestions = await this.getCurrentlyEditingToken(pretext);
        return suggestions.map((suggestion) => this.decorateSuggestionChoiceComplete(pretext, suggestion));
    }

    getAppSuggestionsForBindings = (pretext: string): SuggestionChoice[] => {
        const result: SuggestionChoice[] = [];
        for (const binding of this.bindings) {
            let trigger = binding.name;
            if (trigger[0] !== '/') {
                trigger = '/' + trigger;
            }
            if (trigger.startsWith(pretext)) {
                result.push(this.decorateSuggestionChoiceComplete(pretext, {
                    complete: trigger,
                    suggestion: trigger,
                    // description: cmd.description,
                    // hint: cmd.pretext,
                }));
            }
        }

        return result;
    }

    getCurrentlyEditingToken = async (pretext: string, fullText: string): Promise<SuggestionChoice[]> => {
        if (!pretext.length) {
        }

        let cmd = this.matchBinding(pretext);

        if (!cmd) {
            return [];
        }

        let suggestions: SuggestionChoice[] = [];
        if (cmd.bindings && cmd.bindings.length) {
            return this.getSuggestionsForSubCommands(pretext, cmd);
        }

        if (cmd.call && !cmd.func) {
            cmd = await this.fetchAppCommand(cmd);
        }

        if (cmd.func && cmd.func.form) {
            const argSuggestions = await this.getSuggestionsForArguments(pretext, cmd);
            suggestions = suggestions.concat(argSuggestions);

            // Add "Execute Current Command" suggestion
            const formIsComplete = this.checkIfRequiredsAreSatisfied(fullText, cmd);
            if (formIsComplete) {
                const execute = this.getSuggestionForExecute(pretext);
                suggestions = [execute, ...suggestions];
            }
        }

        return suggestions;
    };

    checkIfRequiredsAreSatisfied = (fullText: string, binding: AppBinding): boolean => {
        return true;
    };

    getSuggestionForExecute = (pretext: string): SuggestionChoice => {
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

    getSuggestionsForArguments = async (pretext: string, binding: AppletBinding): Promise<SuggestionChoice[]> => {
        if (!binding.func || !binding.func.form) {
            return [];
        }

        const form = binding.func.form;
        const positionalDefinitions = form.fields.filter((d) => d.positional);

        let tokens = this.getTokens(pretext);

        tokens = tokens.slice(binding.fullPretext?.split(' ').length);
        const lastToken = tokens.pop();

        const position = tokens.length;

        const field = positionalDefinitions[position];
        if (field) {
            return this.getSuggestionsForField(field, lastToken.value, pretext);
        }

        const previousToken = tokens[position - 1];
        if (previousToken && previousToken.type === 'flag') {
            const field = form.fields.find((arg) => arg.name === previousToken.name);
            if (field) {
                return this.getSuggestionsForField(field, lastToken.value, pretext);
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
            return this.getSuggestionsFromFlags(available);
        }

        return [{suggestion: 'Default Argument Suggestion'}];
    };

    getSuggestionsForField = async (field: AutocompleteElement, userInput: string, pretext: string): Promise<SuggestionChoice[]> => {
        switch (field.type) {
            case AppletFieldTypes.BOOL:
                return this.getBooleanSuggestions(userInput);
            case AppletFieldTypes.DYNAMIC_SELECT:
                return this.getDynamicSelectSuggestions(field as AutocompleteDynamicSelect, userInput, pretext)
            case AppletFieldTypes.STATIC_SELECT:
                return this.getStaticSelectSuggestions(field as AutocompleteStaticSelect, userInput)
        }

        return [{
            complete: '',
            suggestion: userInput,
            description: field.description,
            hint: field.hint,
        }];
    }

    getStaticSelectSuggestions = (field: AutocompleteStaticSelect, userInput: string): SuggestionChoice[] => {
        const opts = field.options.filter((opt) => opt.label.toLowerCase().startsWith(userInput.toLowerCase()));
        return opts.map((opt) => ({
            complete: opt.label,
            suggestion: opt.label,
            // hint: opt.label,
            description: '',
        }));
    }

    getDynamicSelectSuggestions = async (field: AppletField, userInput: string, cmdStr: string): Promise<SuggestionChoice[]> => {
        const values = this.getForm(cmdStr, COMMANDS);

        const cmd = this.matchBinding(cmdStr, COMMANDS);

        const payload: AppletCall = {
            url: field.source_url || '',
            context: {
                ...ARGS,
                app_id: cmd.app_id,
            },
            values,
            raw_command: cmdStr,
        };

        let res: AppletCallResponse<AppletSelectOption[]> | undefined;
        try {
            res = await doAppletCall<{}, AppletSelectOption[]>(payload);
        } catch (e) {
            console.error(e);
            return [{suggestion: `Error: ${e.message}`}];
        }

        if (!res?.data?.length) {
            return [{suggestion: 'Received no data for dynamic suggestions'}];
        }

        return res.data.map(({label, value, icon_data}): SuggestionChoice => ({
            description: label,
            suggestion: value,
            hint: '',
            iconData: icon_data,
        }));
    }

    getBooleanSuggestions = (userInput: string): SuggestionChoice[] => {
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

    getSuggestionsFromFlags = (flags: AutocompleteElement[]): SuggestionChoice[] => {
        return flags.map((flag) => ({
            complete: '--' + flag.name,
            suggestion: '--' + flag.name,
            description: flag.description,
            hint: flag.hint,
        }));
    };

    getSuggestionsForSubCommands = (cmdStr: string, binding: AppletBinding): SuggestionChoice[] => {
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

    matchBinding = (cmdStr: string): AppletBinding => {
        const endsInSpace = cmdStr[cmdStr.length - 1] === ' ';
        cmdStr = cmdStr.split(' ').map((t) => t.trim()).filter(Boolean).join(' ');
        if (endsInSpace) {
            cmdStr += ' ';
        }
        cmdStr = cmdStr.substring(1);

        const flattened = this.flattenCommandList(this.bindings, '');
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


    flattenCommandList = (bindings: AppletBinding[], trigger = ''): BindingWithFullPretext[] => {
        let result: BindingWithFullPretext[] = [];
        for (const binding of bindings) {
            const newPretext = trigger + binding.name;
            result.push({
                ...binding,
                fullPretext: newPretext,
            });
            if (binding.bindings && binding.bindings.length) {
                const children = this.flattenCommandList(binding.bindings, newPretext + ' ');
                result = result.concat(children);
            }
        }

        return result;
    }

    getSubmissionPayload = async (cmdStr: string): Promise<AppletCall | void> => {
        this.flattenCommandList(this.bindings)
        let cmd = this.matchBinding(cmdStr, this.bindings);
        if (!cmd || !cmd.call) {
            return;
        }
        if (cmd.call && !cmd.func) {
            cmd = await this.fetchAppCommand(cmd);
        }

        const values = this.getForm(cmdStr, cmd);

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

    getForm = (cmdStr: string, cmd: AppletBinding): {[name: string]: AutocompleteElement} => {
        if (!cmd) {
            return {error: 'no command'};
        }

        if (!cmd.func || !cmd.func.form) {
            return {};
        }

        cmdStr = cmdStr.substring(1);
        cmdStr = cmdStr.substring(cmd.fullPretext.length).trim();

        const tokens = this.getTokens(cmdStr);
        const positionalDefinitions = cmd.func.form.fields.filter((f) => f.positional);

        const resolvedTokens = this.resolveNamedArguments(tokens);

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

    resolveNamedArguments = (tokens: Token[]) => {
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



    getTokens = (cmdString: string): Token[] => {
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
}

type Token = {
    type: string;
    name: string;
    value: string;
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
