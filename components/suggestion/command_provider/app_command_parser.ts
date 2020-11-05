// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAppsBindings} from 'mattermost-redux/selectors/entities/apps';

import * as Utils from 'utils/utils.jsx';

import {
    AppCall,
    AppBinding,
    AppField,
    AppSelectOption,
    AppFieldTypes,
    AppCallResponse,
    AppFunction,
    AppContext,
    AppForm,
} from 'mattermost-redux/types/apps';

import {doAppCall} from 'actions/apps';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getChannel, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {Channel} from 'mattermost-redux/types/channels';

import {Constants} from 'utils/constants';
const EXECUTE_CURRENT_COMMAND_ITEM_ID = Constants.Integrations.EXECUTE_CURRENT_COMMAND_ITEM_ID;

export type AutocompleteSuggestion = {
    suggestion: string;
    complete?: string;
    description?: string;
    hint?: string;
    iconData?: string;
}

export type AutocompleteSuggestionWithComplete = AutocompleteSuggestion & {
    complete: string;
}

type BindingWithFullPretext = AppBinding & {fullPretext: string}

const extractBaseCommand = (pretext: string) => {
    return pretext.substring(1).split(' ')[0];
}

const getFormFromBinding = (binding: AppBinding): AppForm => {
    return binding?.func?.data?.form;
}

type AutocompleteElement = {};
type AutocompleteStaticSelect = {
    options: {
        label: string;
        value: string;
        hint?: string;
    }[];
};

type AutocompleteDynamicSelect = {};

export type Store = {
    dispatch: DispatchFunc;
    getState: GetStateFunc;
}

export class AppCommandParser {
    private store: Store;
    private rootPostID: string;

    fullCommands: AppBinding[] = [];

    constructor(dispatch: DispatchFunc, getState: GetStateFunc, rootPostID: string = '') {
        this.store = {dispatch, getState};
        this.rootPostID = rootPostID;
    }

    decorateSuggestionComplete = (pretext: string, choice: AutocompleteSuggestionWithComplete): AutocompleteSuggestionWithComplete => {
        if (choice.complete?.endsWith(EXECUTE_CURRENT_COMMAND_ITEM_ID)) {
            return choice;
        }

        // AutocompleteSuggestion.complete is required to be all text leading up to the current suggestion
        const words = pretext.split(' ');
        words.pop();
        const before = words.join(' ') + ' ';

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

    getCommandBindings = (): AppBinding[] => {
        return getAppsBindings(this.store.getState(), '/command')
    }

    getChannel = (): Channel | void => {
        const state = this.store.getState();
        if (!this.rootPostID) {
            return getCurrentChannel(state);
        }

        const post = getPost(state, this.rootPostID);
        if (!post) {
            return;
        }

        return getChannel(state, post.channel_id);
    }

    isAppCommand = (pretext: string): boolean => {
        for (const binding of this.getCommandBindings()) {
            let label = binding.label;
            if (!label) {
                continue;
            }

            if (label[0] !== '/') {
                label = '/' + label;
            }

            if (pretext.startsWith(label + ' ')) {
                return true;
            }
        }
        return false;
    }

    getAppContext = (): Partial<AppContext> | void => {
        const channel = this.getChannel();
        if (!channel) {
            return;
        }

        return {
            channel_id: channel.id,
            team_id: channel.team_id,
            root_id: this.rootPostID,
        }
    }

    fetchAppCommand = async (binding: AppBinding): Promise<AppBinding | undefined> => {
        if (!binding.call) {
            return;
        }

        const payload: AppCall = {
            ...binding.call,
            as_modal: true,
            context: {
                ...this.getAppContext(),
                app_id: binding.app_id,
            },
        };

        let res: AppCallResponse<AppFunction> | undefined;
        try {
            res = await this.store.dispatch(doAppCall<void, AppFunction>(payload));
        } catch (e) {
            console.error(e);
            return;
        }

        if (res && res.data) {
            const b = {
                ...binding,
                func: res.data,
            }
            this.fullCommands.push(b);
            return b;
        }
    }

    getAppCommand = (name: string): AppBinding | void => {
        return this.fullCommands.find((c) => c.label === name);
    }

    getAppCommandSuggestions = async (pretext: string): Promise<AutocompleteSuggestionWithComplete[]> => {
        const channel = this.getChannel();
        if (!channel) {
            return [];
        }

        const base = extractBaseCommand(pretext);
        let binding = this.getAppCommand(base);
        if (!binding) {
            binding = this.getCommandBindings().find((b) => b.label === base);
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
        const suggestions = await this.getSuggestionsForCursorPosition(pretext);
        return suggestions.map((suggestion) => this.decorateSuggestionComplete(pretext, suggestion));
    }

    getAppSuggestionsForBindings = (pretext: string): AutocompleteSuggestionWithComplete[] => {
        const result: AutocompleteSuggestionWithComplete[] = [];
        for (const binding of this.getCommandBindings()) {
            let label = binding.label;
            if (label[0] !== '/') {
                label = '/' + label;
            }
            if (label.startsWith(pretext)) {
                result.push(this.decorateSuggestionComplete(pretext, {
                    complete: label,
                    suggestion: label,
                    description: binding.description,
                    hint: binding.hint,
                }));
            }
        }

        return result;
    }

    getSuggestionsForCursorPosition = async (pretext: string): Promise<AutocompleteSuggestionWithComplete[]> => {
        if (!pretext.length) {
        }

        let cmd = this.matchBinding(pretext);

        if (!cmd) {
            return [];
        }

        let suggestions: AutocompleteSuggestionWithComplete[] = [];
        if (cmd.bindings && cmd.bindings.length) {
            return this.getSuggestionsForBinding(pretext, cmd);
        }

        if (cmd.call && !cmd.func) {
            cmd = await this.fetchAppCommand(cmd);
        }

        const form = getFormFromBinding(cmd);
        if (form) {
            const argSuggestions = await this.getSuggestionsForArguments(pretext, cmd);
            suggestions = suggestions.concat(argSuggestions);

            // Add "Execute Current Command" suggestion
            // TODO get full text from SuggestionBox
            const fullText = pretext;
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

    composeCallFromCommandStr = async (cmdStr: string): Promise<AppCall | void> => {
        let cmd = this.matchBinding(cmdStr);
        if (!cmd || !cmd.call) {
            return;
        }

        const call = cmd.call;
        if (call && !cmd.func) {
            cmd = await this.fetchAppCommand(cmd);
        }

        const values = this.getForm(cmdStr, cmd);

        const payload: AppCall = {
            ...call,
            as_modal: false,
            context: {
                ...this.getAppContext(),
                app_id: cmd.app_id,
            },
            values,
            raw_command: cmdStr,
        };
        return payload;
    };

    getForm = (cmdStr: string, cmd: AppBinding): {[name: string]: string} => {
        if (!cmd) {
            return {error: 'no command'};
        }

        const form = getFormFromBinding(cmd);
        if (!form) {
            return {};
        }

        cmdStr = cmdStr.substring(1);
        cmdStr = cmdStr.substring(cmd.fullPretext.length).trim();

        const tokens = this.getTokens(cmdStr);

        const resolvedTokens = this.resolveNamedArguments(tokens);

        const res: {[name: string]: any} = {};
        resolvedTokens.forEach((token, i) => {
            let name = token.name || '';
            const positionalArg = form.fields.find((field) => field.position === i + 1);
            if (!name.length && token.type === 'positional' && positionalArg) {
                name = positionalArg.name;
            }

            if (!name.length) {
                return;
            }

            const arg = form.fields.find((arg) => arg.name === name);
            if (!arg) {
                return;
            }

            res[arg.name] = token.value;
        });

        return res;
    };

    getSuggestionForExecute = (pretext: string): AutocompleteSuggestion => {
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

    getSuggestionsForArguments = async (pretext: string, binding: AppBinding): Promise<AutocompleteSuggestion[]> => {
        const form = getFormFromBinding(binding) as AppForm;
        if (!form) {
            return [];
        }

        let tokens = this.getTokens(pretext);

        tokens = tokens.slice(binding.fullPretext?.split(' ').length);
        const lastToken = tokens.pop();

        const position = tokens.length;
        if (!lastToken) {
            return [{suggestion: 'Could not find last token'}];
        }

        const field = form.fields.find((f) =>  f.position === position + 1);
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
                if (Boolean(arg.position)) {
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

        return [{suggestion: 'Could not find any suggestions'}];
    };

    getSuggestionsForField = async (field: AutocompleteElement, userInput: string, pretext: string): Promise<AutocompleteSuggestion[]> => {
        switch (field.type) {
            case AppFieldTypes.BOOL:
                return this.getBooleanSuggestions(userInput);
            case AppFieldTypes.DYNAMIC_SELECT:
                return this.getDynamicSelectSuggestions(field as AutocompleteDynamicSelect, userInput, pretext)
            case AppFieldTypes.STATIC_SELECT:
                return this.getStaticSelectSuggestions(field as AutocompleteStaticSelect, userInput)
        }

        return [{
            complete: '',
            suggestion: userInput,
            description: field.description,
            hint: field.hint,
        }];
    }

    getStaticSelectSuggestions = (field: AutocompleteStaticSelect, userInput: string): AutocompleteSuggestion[] => {
        const opts = field.options.filter((opt) => opt.label.toLowerCase().startsWith(userInput.toLowerCase()));
        return opts.map((opt) => ({
            complete: opt.label,
            suggestion: opt.label,
            hint: opt.hint,
            description: '',
        }));
    }

    getDynamicSelectSuggestions = async (field: AppField, userInput: string, cmdStr: string): Promise<AutocompleteSuggestion[]> => {
        const values = this.getForm(cmdStr, this.getCommandBindings());

        const cmd = this.matchBinding(cmdStr);

        const payload: AppCall = {
            url: field.source_url || '',
            context: {
                ...this.getAppContext(),
                app_id: cmd.app_id,
            },
            values,
            raw_command: cmdStr,
        };

        let res: AppCallResponse<AppSelectOption[]> | undefined;
        try {
            res = await this.store.dispatch(doAppCall<{}, AppSelectOption[]>(payload));
        } catch (e) {
            console.error(e);
            return [{suggestion: `Error: ${e.message}`}];
        }

        if (!res?.data?.data?.length) {
            return [{suggestion: 'Received no data for dynamic suggestions'}];
        }

        return res.data.data.map(({label, value, icon_data}): AutocompleteSuggestion => ({
            description: label,
            suggestion: value,
            hint: '',
            iconData: icon_data,
        }));
    }

    getBooleanSuggestions = (userInput: string): AutocompleteSuggestion[] => {
        const suggestions: AutocompleteSuggestion[] = [];

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

    getSuggestionsFromFlags = (flags: AutocompleteElement[]): AutocompleteSuggestion[] => {
        return flags.map((flag) => ({
            complete: '--' + flag.name,
            suggestion: '--' + flag.name,
            description: flag.description,
            hint: flag.hint,
        }));
    };

    getSuggestionsForBinding = (cmdStr: string, binding: AppBinding): AutocompleteSuggestionWithComplete[] => {
        if (!binding.bindings || !binding.bindings.length) {
            return [];
        }

        const result: AutocompleteSuggestionWithComplete[] = [];

        cmdStr = cmdStr.substring((binding.fullPretext + ' ').length).toLowerCase().trim();
        for (const sub of binding.bindings) {
            if (sub.label.toLowerCase().startsWith(cmdStr)) {
                result.push({
                    complete: sub.label,
                    suggestion: sub.label,
                    description: sub.description,
                    hint: sub.hint,
                });
            }
        }

        return result;
    }

    matchBinding = (cmdStr: string): AppBinding => {
        const endsInSpace = cmdStr[cmdStr.length - 1] === ' ';
        cmdStr = cmdStr.split(' ').map((t) => t.trim()).filter(Boolean).join(' ');
        if (endsInSpace) {
            cmdStr += ' ';
        }
        cmdStr = cmdStr.substring(1);

        const flattened = this.flattenCommandList(this.getCommandBindings(), '');
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

    flattenCommandList = (bindings: AppBinding[], label = ''): BindingWithFullPretext[] => {
        let result: BindingWithFullPretext[] = [];
        for (const binding of bindings) {
            const newPretext = label + binding.label;
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
