// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAppsBindings} from 'mattermost-redux/selectors/entities/apps';

import {AppsBindings, AppCallTypes, AppFieldTypes} from 'mattermost-redux/constants/apps';

import {
    AppCall,
    AppBinding,
    AppField,
    AppSelectOption,
    AppCallResponse,
    AppContext,
    AppForm,
    AutocompleteSuggestion,
    AutocompleteElement,
    AutocompleteDynamicSelect,
    AutocompleteStaticSelect,
    AutocompleteUserSelect,
    AutocompleteChannelSelect,
    AutocompleteSuggestionWithComplete,
} from 'mattermost-redux/types/apps';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getChannel, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {Channel} from 'mattermost-redux/types/channels';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {Constants} from 'utils/constants';
import {GlobalState} from 'types/store';
import {sendEphemeralPost} from 'actions/global_actions';
import {doAppCall} from 'actions/apps';
import * as Utils from 'utils/utils.jsx';

const EXECUTE_CURRENT_COMMAND_ITEM_ID = Constants.Integrations.EXECUTE_CURRENT_COMMAND_ITEM_ID;

export type Store = {
    dispatch: DispatchFunc;
    getState: () => GlobalState;
}

export class AppCommandParser {
    private store: Store;
    private rootPostID: string;

    fetchedForms: {[fullPretext: string]: AppForm} = {};

    constructor(store: Store, rootPostID = '') {
        this.store = store;
        this.rootPostID = rootPostID;
    }

    decorateSuggestionComplete = (pretext: string, choice: AutocompleteSuggestion): AutocompleteSuggestionWithComplete => {
        if (choice.complete && choice.complete.endsWith(EXECUTE_CURRENT_COMMAND_ITEM_ID)) {
            return choice as AutocompleteSuggestionWithComplete;
        }

        // AutocompleteSuggestion.complete is required to be all text leading up to the current suggestion
        const words = pretext.split(' ');
        words.pop();
        const before = words.join(' ') + ' ';

        choice.hint = choice.hint || '';

        return {
            ...choice,
            suggestion: '/' + choice.suggestion,
            complete: before + (choice.complete || choice.suggestion),
        };
    }

    getCommandBindings = (): AppBinding[] => {
        const bindings = getAppsBindings(this.store.getState(), AppsBindings.COMMAND);
        const grouped: {[appID: string]: AppBinding} = {};

        for (const b of bindings) {
            grouped[b.app_id] = grouped[b.app_id] || {
                app_id: b.app_id,
                label: b.app_id,
                location: AppsBindings.COMMAND,
                bindings: [],
            };

            const group = grouped[b.app_id];
            group.bindings = group.bindings || [];
            group.bindings.push(b);
        }

        return Object.values(grouped);
    }

    getChannel = (): Channel | null => {
        const state = this.store.getState();
        if (!this.rootPostID) {
            return getCurrentChannel(state);
        }

        const post = getPost(state, this.rootPostID);
        if (!post) {
            return null;
        }

        return getChannel(state, post.channel_id);
    }

    isAppCommand = (pretext: string): boolean => {
        for (const binding of this.getCommandBindings()) {
            let base = binding.app_id;
            if (!base) {
                continue;
            }

            if (base[0] !== '/') {
                base = '/' + base;
            }

            if (pretext.startsWith(base + ' ')) {
                return true;
            }
        }
        return false;
    }

    getAppContext = (): Partial<AppContext> | null => {
        const channel = this.getChannel();
        if (!channel) {
            return null;
        }

        const teamID = channel.team_id || getCurrentTeamId(this.store.getState());

        return {
            channel_id: channel.id,
            team_id: teamID,
            root_id: this.rootPostID,
            location: AppsBindings.COMMAND,
        };
    }

    fetchAppForm = async (binding: AppBinding): Promise<AppForm | null> => {
        if (!binding.call) {
            return null;
        }

        const payload: AppCall = {
            ...binding.call,
            type: AppCallTypes.FORM,
            context: {
                ...this.getAppContext(),
                app_id: binding.app_id,
            },
        };

        let callResponse: AppCallResponse | undefined;
        try {
            const res = await this.store.dispatch(doAppCall(payload)) as {data?: AppCallResponse, error?: Error};
            if (res.error) {
                this.displayError(res.error);
                return null;
            }
            callResponse = res.data;
        } catch (e) {
            this.displayError(e);
            return null;
        }

        if (callResponse && callResponse.form) {
            return callResponse.form;
        }

        return null;
    }

    displayError = (err: Error): void => {
        sendEphemeralPost(err + ' displayError', '');

        // TODO display error under the command line
    }

    getAppCommand = (name: string): AppBinding | void => {
        return this.getCommandBindings().find((b) => b.label === name);
    }

    getAppCommandSuggestions = async (pretext: string): Promise<AutocompleteSuggestionWithComplete[]> => {
        const channel = this.getChannel();
        if (!channel) {
            return [];
        }

        const binding = await this.getBindingWithForm(pretext);
        if (!binding) {
            return [this.decorateSuggestionComplete(pretext, {suggestion: 'Error finding binding'})];
        }

        const suggestions = await this.getSuggestionsForCursorPosition(pretext);
        return suggestions.map((suggestion) => this.decorateSuggestionComplete(pretext, suggestion));
    }

    getAppSuggestionsForBindings = (pretext: string): AutocompleteSuggestionWithComplete[] => {
        const result: AutocompleteSuggestionWithComplete[] = [];

        const bindings = this.getCommandBindings();
        for (const binding of bindings) {
            let base = binding.app_id;
            if (!base) {
                continue;
            }

            if (base[0] !== '/') {
                base = '/' + base;
            }
            if (base.startsWith(pretext)) {
                result.push(this.decorateSuggestionComplete(pretext, {
                    complete: base,
                    suggestion: base,
                    description: binding.description,
                    hint: binding.hint || '',
                }));
            }
        }

        return result;
    }

    getSuggestionsForCursorPosition = async (pretext: string): Promise<AutocompleteSuggestion[]> => {
        const binding = await this.getBindingWithForm(pretext);
        if (!binding) {
            return [];
        }

        let suggestions: AutocompleteSuggestion[] = [];
        if (binding.bindings && binding.bindings.length) {
            return this.getSuggestionsForBinding(pretext, binding);
        }

        const form = this.getFormFromBinding(binding);
        if (form) {
            const argSuggestions = await this.getSuggestionsForArguments(pretext, binding);
            suggestions = suggestions.concat(argSuggestions);

            // Add "Execute Current Command" suggestion
            // TODO get full text from SuggestionBox
            const fullText = pretext;
            const formIsComplete = this.checkIfRequiredFieldsAreSatisfied(fullText, binding);
            if (formIsComplete) {
                const execute = this.getSuggestionForExecute(pretext);
                suggestions = [execute, ...suggestions];
            }
        }

        return suggestions;
    };

    checkIfRequiredFieldsAreSatisfied = (fullText: string, binding: AppBinding): boolean => {
        const form = this.getFormFromBinding(binding);
        if (!form) {
            return true;
        }

        const values = this.getFormValues(fullText, binding);
        for (const field of form.fields) {
            if (field.is_required && !values[field.name]) {
                return false;
            }
        }

        return true;
    };

    composeCallFromCommandStr = async (cmdStr: string): Promise<AppCall | null> => {
        const binding = await this.getBindingWithForm(cmdStr);
        if (!binding || !binding.call) {
            return null;
        }

        const formValues = this.getFormValues(cmdStr, binding);
        const values = {
            ...binding.call.values,
            ...formValues,
        };

        const payload: AppCall = {
            ...binding.call,
            context: {
                ...this.getAppContext(),
                app_id: binding.app_id,
            },
            values,
            raw_command: cmdStr,
        };
        return payload;
    };

    getFormValues = (text: string, binding: AppBinding): {[name: string]: string} => {
        if (!binding) {
            return {error: 'no command'};
        }

        const form = this.getFormFromBinding(binding);
        if (!form) {
            return {};
        }

        let cmdStr = text.substring(1);

        const fullPretext = this.getFullPretextForBinding(binding);
        cmdStr = cmdStr.substring(fullPretext.length).trim();

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

            const arg = form.fields.find((a) => a.name === name);
            if (!arg) {
                return;
            }

            res[arg.name] = token.value;
        });

        return res;
    };

    getSuggestionForExecute = (pretext: string): AutocompleteSuggestion => {
        let key = 'Ctrl';
        if (Utils.isMac()) {
            key = '⌘';
        }

        return {
            complete: pretext + EXECUTE_CURRENT_COMMAND_ITEM_ID,
            suggestion: '/Execute Current Command',
            hint: '',
            description: 'Select this option or use ' + key + '+Enter to execute the current command.',
            iconData: EXECUTE_CURRENT_COMMAND_ITEM_ID,
        };
    }

    getSuggestionsForArguments = async (pretext: string, binding: AppBinding): Promise<AutocompleteSuggestion[]> => {
        const form = this.getFormFromBinding(binding) as AppForm;
        if (!form) {
            return [];
        }

        let tokens = this.getTokens(pretext);

        const fullPretext = this.getFullPretextForBinding(binding);
        tokens = tokens.slice(fullPretext.split(' ').length);
        const lastToken = tokens.pop();

        const position = tokens.length;
        if (!lastToken) {
            return [{suggestion: 'Could not find last token'}];
        }

        const positionalField = form.fields.find((f) => f.position === position + 1);
        if (positionalField) {
            return this.getSuggestionsForField(positionalField, lastToken.value, pretext);
        }

        const previousToken = tokens[position - 1];
        if (previousToken && previousToken.type === 'flag') {
            const flagField = form.fields.find((a) => a.name === previousToken.name);
            if (flagField) {
                return this.getSuggestionsForField(flagField, lastToken.value, pretext);
            }
            return [];
        }

        // '', '-', or '--' (show named args)
        if ('--'.startsWith(lastToken.value.trim())) {
            const available = form.fields.filter((arg) => {
                if (arg.position) {
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
        case AppFieldTypes.USER:
            return this.getUserSuggestions(field as AutocompleteUserSelect, userInput);
        case AppFieldTypes.CHANNEL:
            return this.getChannelSuggestions(field as AutocompleteChannelSelect, userInput);
        case AppFieldTypes.BOOL:
            return this.getBooleanSuggestions(userInput);
        case AppFieldTypes.DYNAMIC_SELECT:
            return this.getDynamicSelectSuggestions(field as AutocompleteDynamicSelect, userInput, pretext);
        case AppFieldTypes.STATIC_SELECT:
            return this.getStaticSelectSuggestions(field as AutocompleteStaticSelect, userInput);
        }

        return [{
            complete: '',
            suggestion: '',
            description: field.description,
            hint: field.hint,
        }];
    }

    getStaticSelectSuggestions = (field: AutocompleteStaticSelect, userInput: string): AutocompleteSuggestion[] => {
        const opts = field.options.filter((opt) => opt.label.toLowerCase().startsWith(userInput.toLowerCase()));
        return opts.map((opt) => ({
            complete: opt.label,
            suggestion: opt.label,
            hint: '',
            description: '',
        }));
    }

    getDynamicSelectSuggestions = async (field: AppField, userInput: string, cmdStr: string): Promise<AutocompleteSuggestion[]> => {
        const binding = await this.getBindingWithForm(cmdStr);
        if (!binding) {
            return [];
        }

        const values = this.getFormValues(cmdStr, binding);

        const payload: AppCall = {
            url: field.source_url || '',
            context: {
                ...this.getAppContext(),
                app_id: binding.app_id,
            },
            values,
            raw_command: cmdStr,
        };

        let res: {data?: AppCallResponse<AppSelectOption[]>, error?: any};
        try {
            res = await this.store.dispatch(doAppCall<AppSelectOption[]>(payload));
        } catch (e) {
            return [{suggestion: `Error: ${e.message}`}];
        }

        if (!res?.data?.data?.length) {
            return [{suggestion: 'Received no data for dynamic suggestions'}];
        }

        return res.data.data.map((s): AutocompleteSuggestion => ({
            description: s.label,
            suggestion: s.value,
            hint: '',
            iconData: s.icon_data,
        }));
    }

    getUserSuggestions = (field: AutocompleteUserSelect, userInput: string): AutocompleteSuggestion[] => {
        if (userInput.trim().length === 0) {
            return [{
                suggestion: '@',
                description: field.description || '',
                hint: field.hint || '',
            }];
        }

        return [];
    }

    getChannelSuggestions = (field: AutocompleteChannelSelect, userInput: string): AutocompleteSuggestion[] => {
        if (userInput.trim().length === 0) {
            return [{
                suggestion: '~',
                description: field.description || '',
                hint: field.hint || '',
            }];
        }

        return [];
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
        return flags.map((flag) => {
            let suffix = '';
            if (flag.type === AppFieldTypes.USER) {
                suffix = ' @';
            } else if (flag.type === AppFieldTypes.CHANNEL) {
                suffix = ' ~';
            }
            return {
                complete: '--' + flag.name + suffix,
                suggestion: '--' + flag.name,
                description: flag.description,
                hint: flag.hint,
            };
        });
    };

    getSuggestionsForBinding = (cmdStr: string, binding: AppBinding): AutocompleteSuggestion[] => {
        if (!binding.bindings || !binding.bindings.length) {
            return [];
        }

        const result: AutocompleteSuggestion[] = [];

        const fullPretext = this.getFullPretextForBinding(binding);
        const rest = cmdStr.substring((fullPretext + ' ').length).toLowerCase().trim();
        for (const sub of binding.bindings) {
            if (sub.label.toLowerCase().startsWith(rest)) {
                result.push({
                    complete: sub.label,
                    suggestion: sub.label,
                    description: sub.description,
                    hint: sub.hint || '',
                });
            }
        }

        return result;
    }

    getBindingWithForm = async (pretext: string): Promise<AppBinding | null> => {
        const binding = this.matchBinding(pretext);
        if (!binding) {
            return null;
        }

        if (this.getFormFromBinding(binding)) {
            return binding;
        }
        if (!binding.call) {
            return binding;
        }

        const form = await this.fetchAppForm(binding);

        if (form) {
            this.storeForm(binding, form);
        }
        return binding;
    }

    storeForm = (binding: AppBinding, form: AppForm) => {
        const fullPretext = this.getFullPretextForBinding(binding);
        this.fetchedForms[fullPretext] = form;
    }

    getFormFromBinding = (binding: AppBinding): AppForm | null => {
        if (binding.form) {
            return binding.form;
        }

        const fullPretext = this.getFullPretextForBinding(binding);
        if (this.fetchedForms[fullPretext]) {
            // TODO make sure the form is correct for the given channel id
            return this.fetchedForms[fullPretext];
        }

        return null;
    }

    // matchBinding finds the appropriate nested subcommand
    matchBinding = (text: string): AppBinding| null => {
        const endsInSpace = text[text.length - 1] === ' ';

        // Get rid of all whitespace between subcommand words
        let cmdStr = text.split(' ').map((t) => t.trim()).filter(Boolean).join(' ');
        if (endsInSpace) {
            cmdStr += ' ';
        }
        cmdStr = cmdStr.substring(1);

        const words = cmdStr.split(' ');
        const base = words[0];
        const bindings = this.getCommandBindings();
        const baseCommand = bindings.find((b) => b.app_id === base);
        if (!baseCommand || words.length < 2) {
            return null;
        }

        const searchThroughBindings = (binding: AppBinding, pretext: string): AppBinding => {
            if (!binding.bindings || !binding.bindings.length) {
                return binding;
            }

            const remaining = pretext.split(' ').slice(1);
            const next = remaining[0];
            if (!next) {
                return binding;
            }

            for (const b of binding.bindings) {
                if (b.label === next && remaining.length > 1) {
                    const b2 = searchThroughBindings(b, remaining.join(' '));
                    if (b2) {
                        return b2;
                    }
                }
            }

            return binding;
        };

        return searchThroughBindings(baseCommand, cmdStr);
    };

    // getFullPretextForBinding computes the pretext for a given subcommand
    // For instance, `/jira issue view` would be the full pretext for the view command
    getFullPretextForBinding = (binding: AppBinding): string => {
        let result = '';

        const search = (bindings: AppBinding[], pretext: string) => {
            for (const b of bindings) {
                if (b.app_id === binding.app_id && b.label === binding.label) {
                    result = pretext + b.label;
                }

                if (b.bindings) {
                    search(b.bindings, pretext + b.label + ' ');
                }
            }
        };

        const bindings = this.getCommandBindings();
        search(bindings, '');

        return result;
    }

    // resolveNamedArguments takes a list of tokens and
    resolveNamedArguments = (tokens: Token[]): Token[] => {
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

const makeNamedFlagToken = (name: string, value: string): Token => {
    return {
        type: 'flag',
        name,
        value,
    };
};

const makeNamedArgumentToken = (name: string, value: string): Token => {
    return {
        type: 'named',
        name,
        value,
    };
};

const makePositionalArgumentToken = (name: string, value: string): Token => {
    return {
        type: 'positional',
        name,
        value,
    };
};
