// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getAppBindings} from 'mattermost-redux/selectors/entities/apps';

import {AppBindingLocations, AppCallTypes, AppFieldTypes} from 'mattermost-redux/constants/apps';

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
    AppLookupCallValues,
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

    // composeCallFromCommandString creates the form submission call
    public composeCallFromCommandString = async (cmdStr: string): Promise<AppCall | null> => {
        const binding = await this.getBindingWithForm(cmdStr);
        if (!binding || !binding.call) {
            return null;
        }

        const missing = this.getMissingFields(cmdStr, binding);
        if (missing.length > 0) {
            const missingStr = missing.map((f) => f.label).join(', ');
            this.displayError('Required fields missing: ' + missingStr);
            return null;
        }

        const values = this.getFormValues(cmdStr, binding);

        const form = this.getFormFromBinding(binding);
        if (!form) {
            return null;
        }
        const call = form.call || binding.call;
        if (!call) {
            return null;
        }

        const payload: AppCall = {
            ...call,
            type: AppCallTypes.SUBMIT,
            context: {
                ...this.getAppContext(),
                app_id: binding.app_id,
            },
            values,
            raw_command: cmdStr,
        };
        return payload;
    }

    // decorateSuggestionComplete applies the necessary modifications for a suggestion to be processed
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

    // getCommandBindings returns the commands in the redux store.
    // They are grouped by app id since each app has one base command
    getCommandBindings = (): AppBinding[] => {
        const bindings = getAppBindings(this.store.getState(), AppBindingLocations.COMMAND);
        const grouped: {[appID: string]: AppBinding} = {};

        for (const b of bindings) {
            grouped[b.app_id] = grouped[b.app_id] || {
                app_id: b.app_id,
                label: b.app_id,
                location: AppBindingLocations.COMMAND,
                bindings: [],
            };

            const group = grouped[b.app_id];
            group.bindings = group.bindings || [];
            group.bindings.push(b);
        }

        return Object.values(grouped);
    }

    // getChannel computes the right channel, based on if this command is running in the center channel or RHS
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

    // isAppCommand determines if subcommand/form suggestions need to be returned
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

    // getAppContext collects post/channel/team info for performing calls
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
            location: AppBindingLocations.COMMAND,
        };
    }

    // fetchAppForm retrieves the form for the given subcommand
    fetchAppForm = async (subCommand: AppBinding): Promise<AppForm | null> => {
        if (!subCommand.call) {
            return null;
        }

        const payload: AppCall = {
            ...subCommand.call,
            type: AppCallTypes.FORM,
            context: {
                ...this.getAppContext(),
                app_id: subCommand.app_id,
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

    // displayError shows an error that was caught by the parser
    displayError = (err: any): void => {
        let errStr = err as string;
        if (err.message) {
            errStr = err.message;
        }
        sendEphemeralPost(errStr, '');

        // TODO display error under the command line
    }

    // getSuggestionsForSubCommandsAndArguments returns suggestions for subcommands and/or form arguments
    public getSuggestionsForSubCommandsAndArguments = async (pretext: string): Promise<AutocompleteSuggestionWithComplete[]> => {
        const suggestions = await this.getSuggestionsForCursorPosition(pretext);
        return suggestions.map((suggestion) => this.decorateSuggestionComplete(pretext, suggestion));
    }

    // getSuggestionsForBaseCommands is a synchronous function that returns results for base commands
    public getSuggestionsForBaseCommands = (pretext: string): AutocompleteSuggestionWithComplete[] => {
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
                result.push({
                    suggestion: base,
                    complete: base,
                    description: binding.description,
                    hint: binding.hint || '',
                });
            }
        }

        return result;
    }

    // getSuggestionsForCursorPosition computes subcommand/form suggestions
    getSuggestionsForCursorPosition = async (pretext: string): Promise<AutocompleteSuggestion[]> => {
        const binding = await this.getBindingWithForm(pretext);
        if (!binding) {
            return [];
        }

        let suggestions: AutocompleteSuggestion[] = [];
        if (binding.bindings && binding.bindings.length) {
            return this.getSuggestionsForSubCommands(pretext, binding);
        }

        const form = this.getFormFromBinding(binding);
        if (form) {
            const argSuggestions = await this.getSuggestionsForArguments(pretext, binding);
            suggestions = suggestions.concat(argSuggestions);

            // Add "Execute Current Command" suggestion
            // TODO get full text from SuggestionBox
            const fullText = pretext;
            const missing = this.getMissingFields(fullText, binding);
            if (missing.length === 0) {
                const execute = this.getSuggestionForExecute(pretext);
                suggestions = [execute, ...suggestions];
            }
        }

        return suggestions;
    }

    // getMissingFields collects the required fields that were not supplied in a submission
    getMissingFields = (fullText: string, binding: AppBinding): AppField[] => {
        const form = this.getFormFromBinding(binding);
        if (!form) {
            return [];
        }

        const missing: AppField[] = [];

        const values = this.getFormValues(fullText, binding);
        for (const field of form.fields) {
            if (field.is_required && !values[field.name]) {
                missing.push(field);
            }
        }

        return missing;
    }

    // getFormValues parses the typed command and
    getFormValues = (text: string, binding: AppBinding): {[name: string]: string} => {
        if (!binding) {
            this.displayError(new Error('No binding found'));
        }

        const form = this.getFormFromBinding(binding);
        if (!form) {
            return {};
        }

        let cmdStr = text.substring(1);

        const fullPretext = this.getFullPretextForSubCommand(binding);
        cmdStr = cmdStr.substring(fullPretext.length).trim();

        const tokens = this.getTokens(cmdStr);

        const resolvedTokens = this.resolveNamedArguments(tokens);

        const values: {[name: string]: any} = {};
        resolvedTokens.forEach((token, i) => {
            let name = token.name || '';
            const positionalArg = form.fields.find((field) => field.position === i + 1);
            if (name.length === 0 && token.type === 'positional' && positionalArg) {
                name = positionalArg.name;
            }

            if (name.length === 0) {
                return;
            }

            const arg = form.fields.find((a) => a.name === name);
            if (!arg) {
                return;
            }

            values[arg.name] = token.value;
        });

        return {
            ...binding?.call?.values,
            ...values,
        };
    }

    // getSuggestionForExecute returns the "Execute Current Command" suggestion
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

    // getSuggestionsForArguments computes suggestions for positional argument values, flag names, and flag argument values
    getSuggestionsForArguments = async (pretext: string, binding: AppBinding): Promise<AutocompleteSuggestion[]> => {
        const form = this.getFormFromBinding(binding) as AppForm;
        if (!form) {
            return [];
        }

        let tokens = this.getTokens(pretext);

        const fullPretext = this.getFullPretextForSubCommand(binding);
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
    }

    // getSuggestionsForField gets suggestions for a positional or flag field value
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
            complete: userInput,
            suggestion: '',
            description: field.description,
            hint: field.hint,
        }];
    }

    // getStaticSelectSuggestions returns suggestions specified in the field's options property
    getStaticSelectSuggestions = (field: AutocompleteStaticSelect, userInput: string): AutocompleteSuggestion[] => {
        const opts = field.options.filter((opt) => opt.label.toLowerCase().startsWith(userInput.toLowerCase()));
        return opts.map((opt) => ({
            complete: opt.label,
            suggestion: opt.label,
            hint: '',
            description: '',
        }));
    }

    // getDynamicSelectSuggestions fetches and returns suggestions from the server
    getDynamicSelectSuggestions = async (field: AppField, userInput: string, cmdStr: string): Promise<AutocompleteSuggestion[]> => {
        const binding = await this.getBindingWithForm(cmdStr);
        if (!binding) {
            return [];
        }

        const form = this.getFormFromBinding(binding);
        if (!form) {
            return [];
        }

        const call = form.call || binding.call;
        if (!call) {
            return [];
        }

        const formValues = this.getFormValues(cmdStr, binding);

        const values: AppLookupCallValues = {
            name: field.name,
            user_input: userInput,
            values: formValues,
        };

        const fullCall: AppCall = {
            ...call,
            type: 'lookup',
            context: {
                ...this.getAppContext(),
                app_id: binding.app_id,
            },
            values,
            raw_command: cmdStr,
        };

        type ResponseType = {items: AppSelectOption[]};
        let res: {data?: AppCallResponse<ResponseType>, error?: any};
        try {
            res = await this.store.dispatch(doAppCall<ResponseType>(fullCall));
        } catch (e) {
            return [{suggestion: `Error: ${e.message}`}];
        }

        const items = res?.data?.data?.items;
        if (!items) {
            return [{suggestion: 'Received no data for dynamic suggestions'}];
        }

        return items.map((s): AutocompleteSuggestion => ({
            description: s.label,
            suggestion: s.value,
            hint: '',
            iconData: s.icon_data,
        }));
    }

    // getUserSuggestions returns a suggestion with `@` if the user has not started typing
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

    // getChannelSuggestions returns a suggestion with `~` if the user has not started typing
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

    // getBooleanSuggestions returns true/false suggestions
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

    // getSuggestionsFromFlags returns suggestions for a flag name.
    // If it is a user or channel field, the `@` or `~` will be placed after the flag is chosen, so the user/channel suggestions show immediately.
    getSuggestionsFromFlags = (flags: AutocompleteElement[]): AutocompleteSuggestion[] => {
        return flags.map((flag) => {
            let suffix = '';
            if (flag.type === AppFieldTypes.USER) {
                suffix = ' @';
            } else if (flag.type === AppFieldTypes.CHANNEL) {
                suffix = ' ~';
            }
            return {
                complete: '--' + (flag.label || flag.name) + suffix,
                suggestion: '--' + (flag.label || flag.name),
                description: flag.description,
                hint: flag.hint,
            };
        });
    }

    // getSuggestionsForSubCommands returns suggestions for a subcommand's name
    getSuggestionsForSubCommands = (cmdStr: string, binding: AppBinding): AutocompleteSuggestion[] => {
        if (!binding.bindings || !binding.bindings.length) {
            return [];
        }

        const result: AutocompleteSuggestion[] = [];

        const fullPretext = this.getFullPretextForSubCommand(binding);
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

    // getBindingWithForm returns a subcommand with its corresponding form, if the command is a leaf node
    getBindingWithForm = async (pretext: string): Promise<AppBinding | null> => {
        const binding = this.matchSubCommand(pretext);
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
            this.saveForm(binding, form);
        }
        return binding;
    }

    // saveForm saves the command's form to be used as the user continues typing
    saveForm = (binding: AppBinding, form: AppForm) => {
        const fullPretext = this.getFullPretextForSubCommand(binding);
        this.fetchedForms[fullPretext] = form;
    }

    // getFormFromBinding returns a subcommand's form if it has been fetched already
    getFormFromBinding = (binding: AppBinding): AppForm | null => {
        if (binding.form) {
            return binding.form;
        }

        const fullPretext = this.getFullPretextForSubCommand(binding);
        if (this.fetchedForms[fullPretext]) {
            // TODO make sure the form is correct for the given channel id
            return this.fetchedForms[fullPretext];
        }

        return null;
    }

    // matchSubCommand finds the appropriate nested subcommand
    matchSubCommand = (text: string): AppBinding| null => {
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
            if (!binding.bindings || binding.bindings.length === 0) {
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
    }

    // getFullPretextForSubCommand computes the pretext for a given subcommand
    // For instance, `/jira issue view` would be the full pretext for the view command
    getFullPretextForSubCommand = (binding: AppBinding): string => {
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

    // resolveNamedArguments pairs named flags with values, to help with form parsing
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

    // getTokens parses the command string into discrete tokens to be processed
    getTokens = (cmdString: string): Token[] => {
        const tokens: Token[] = [];
        const words = cmdString.split(' ');

        let quotedArg = '';

        words.forEach((word, index) => {
            if (word.trim().length === 0) {
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
                if (word.endsWith('"')) {
                    const trimmed = quotedArg.substring(1, quotedArg.length - 1);
                    tokens.push(makePositionalArgumentToken('', trimmed));
                    quotedArg = '';
                } else if (index === words.length - 1) {
                    tokens.push(makePositionalArgumentToken('', quotedArg));
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
