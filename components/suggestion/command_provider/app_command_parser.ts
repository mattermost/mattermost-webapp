// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

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
    AutocompleteStaticSelect,
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

export enum ParseState {
    Start = 0,
    Command,
    EndCommand,
    CommandSeparator,
    Parameter,
    ParameterSeparator,
    Flag1,
    Flag,
    FlagValueSeparator,
    StartValue,
    NonspaceValue,
    QuotedValue,
    TickValue,
    EndValue,
    Error,
}

export interface ParseData {
    state: ParseState;
    text: string;
    incomplete: string;
    incompleteStart: number;
    binding: AppBinding | null;
    form: AppForm;
    field: AppField | null;
    values: {[name: string]: string};
    location: string;
}

export interface ParseError {
    state: ParseState;
    error: string;
}

export type ParsedCommand = ParseData | ParseError;

const isSpace = (c: string): boolean => {
    return c === ' ' || c === '\t';
};
const parseError = (txt: string): ParseError => {
    return {
        state: ParseState.Error,
        error: txt,
    };
};

export class AppCommandParser {
    private store: Store;
    private rootPostID: string;

    forms: {[location: string]: AppForm} = {};

    constructor(store: Store, rootPostID = '') {
        this.store = store;
        this.rootPostID = rootPostID;
    }

    // composeCallFromCommandString creates the form submission call
    public composeCallFromCommandString = async (command: string): Promise<AppCall | null> => {
        const res = await this.parseCommand(command);
        if (res.state === ParseState.Error) {
            const err = res as ParseError;
            this.displayError(err.error);
            return null;
        }
        const parsed = res as ParseData;

        const missing = this.getMissingFields(parsed);
        if (missing.length > 0) {
            const missingStr = missing.map((f) => f.label).join(', ');
            this.displayError('Required fields missing: ' + missingStr);
            return null;
        }

        return this.composeCallFromParsed(parsed);
    }

    // composeCallFromParsed creates the form submission call
    composeCallFromParsed = (parsed: ParseData): AppCall | null => {
        if (!parsed.binding) {
            return null;
        }

        let call = parsed.binding.call;
        if (parsed.form && parsed.form.call) {
            call = parsed.form.call;
        }
        if (!call) {
            return null;
        }

        const payload: AppCall = {
            ...call,
            type: AppCallTypes.SUBMIT,
            context: {
                ...this.getAppContext(),
                app_id: parsed.binding.app_id,
            },
            values: parsed.values,
            raw_command: parsed.text,
        };
        return payload;
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

    parseCommand = async (text: string, autocompleteMode = false): Promise<ParsedCommand> => {
        const commandBindings = this.getCommandBindings();
        if (!commandBindings) {
            return parseError('no command bindings');
        }

        const res = this.matchBinding(text, commandBindings, autocompleteMode);
        if (res.state === ParseState.Error) {
            return res;
        }
        const parsed = res as ParseData;
        parsed.form = await this.getFormForBinding(parsed);
        if (!parsed.incomplete) {
            return parsed;
        }

        return this.parseForm(parsed);
    }

    // matchBinding finds the closest matching command binding.
    matchBinding = (text: string, commandBindings: AppBinding[], autocompleteMode = false): ParsedCommand => {
        const parsed = {
            text,
            state: ParseState.Start,
            values: {},
            location: '',
        } as ParseData;
        let bindings = commandBindings;
        let i = 0;
        let done = false;

        while (!done) {
            let c = '';
            if (i < text.length) {
                c = text[i];
            }

            switch (Number(parsed.state)) {
            case ParseState.Start: {
                if (c !== '/') {
                    return parseError('command must start with a /: ' + i);
                }
                if (bindings.length === 0) {
                    return parseError('no command bindings: ' + i);
                }
                i++;
                parsed.incomplete = '';
                parsed.incompleteStart = i;
                parsed.state = ParseState.Command;
                break;
            }
            case ParseState.Command: {
                if (isSpace(c)) {
                    parsed.state = ParseState.EndCommand;
                } else if (c === '') {
                    if (autocompleteMode) {
                        // Finish in the command state, 'incomplete' will have the query string
                        done = true;
                    } else {
                        parsed.state = ParseState.EndCommand;
                    }
                } else {
                    parsed.incomplete += c;
                    i++;
                }
                break;
            }
            case ParseState.EndCommand: {
                const binding = bindings.find((b: AppBinding) => b.label === parsed.incomplete);
                if (!binding) {
                    // gone as far as we could, this token doesn't match a sub-command.
                    // return the state from the last matching binding
                    done = true;
                    break;
                }
                parsed.binding = binding;
                parsed.location += '/' + binding.label;
                if (binding.bindings) {
                    bindings = binding.bindings;
                } else {
                    bindings = [];
                }
                parsed.state = ParseState.CommandSeparator;
                break;
            }
            case ParseState.CommandSeparator: {
                switch (c) {
                case '': {
                    // Reached the end of input.
                    parsed.incomplete = '';
                    parsed.incompleteStart = i;
                    done = true;
                    break;
                }
                case ' ':
                case '\t': {
                    i++;
                    break;
                }
                default: {
                    parsed.incomplete = '';
                    parsed.incompleteStart = i;
                    parsed.state = ParseState.Command;
                    break;
                }
                }
                break;
            }
            }
        }

        if (!parsed.binding) {
            return parseError('"' + text + '" is not a valid command');
        }
        return parsed;
    }

    /* eslint-disable no-loop-func */
    // parseForm parses the rest of the command using the specified form.
    parseForm = (parsed: ParseData, autompleteMode = false): ParsedCommand => {
        let fields: AppField[] = [];
        if (parsed.form && parsed.form.fields) {
            fields = parsed.form.fields;
        }

        parsed.state = ParseState.Parameter;
        let i = parsed.incompleteStart || 0;
        let flagEqualsUsed = false;
        let positional = 0;
        let escaped = false;
        const text = parsed.text || '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
            let c = '';
            if (i < text.length) {
                c = text[i];
            } else if (autompleteMode) {
                return parsed;
            }

            switch (Number(parsed.state)) {
            case ParseState.Parameter: {
                if (c === '-') {
                    // Named parameter.
                    parsed.state = ParseState.Flag1;
                    i++;
                    break;
                }

                // Positional parameter.
                positional++;
                const field = fields.find((f: AppField) => f.position === positional);
                if (!field) {
                    return parseError('command does not accept ' + positional + ' positional arguments: ' + i);
                }
                parsed.field = field;
                parsed.state = ParseState.StartValue;
                break;
            }
            case ParseState.ParameterSeparator: {
                if (c === '') {
                    // Reached the end of input.
                    return parsed;
                } else if (isSpace(c)) {
                    i++;
                } else {
                    parsed.state = ParseState.Parameter;
                }
                break;
            }
            case ParseState.Flag1: {
                // consume the optional second '-'
                if (c === '-') {
                    i++;
                }
                parsed.state = ParseState.Flag;
                parsed.incomplete = '';
                parsed.incompleteStart = i;
                flagEqualsUsed = false;
                break;
            }
            case ParseState.Flag: {
                if (isSpace(c) || c === '=' || (c === '' && !autompleteMode)) {
                    const field = fields.find((f) => f.label === parsed.incomplete);
                    if (!field) {
                        return parseError('command does not accept flag ' + parsed.incomplete + ': ' + i);
                    }
                    parsed.state = ParseState.FlagValueSeparator;
                    parsed.field = field;
                    break;
                } else if (c === '') {
                    return parsed;
                }
                parsed.incomplete += c;
                i++;
                break;
            }
            case ParseState.FlagValueSeparator: {
                if (isSpace(c)) {
                    i++;
                    break;
                } else if (c === '=') {
                    if (flagEqualsUsed) {
                        return parseError('multiple = signs are not allowed: ' + i);
                    }
                    flagEqualsUsed = true;
                    i++;
                    break;
                }
                parsed.state = ParseState.StartValue;
                break;
            }
            case ParseState.StartValue: {
                parsed.incomplete = '';
                parsed.incompleteStart = i;
                if (c === '"') {
                    parsed.state = ParseState.QuotedValue;
                    i++;
                } else if (c === '`') {
                    parsed.state = ParseState.TickValue;
                    i++;
                } else if (isSpace(c) || !c) {
                    return parseError('internal error: unexpected whitespace or end of input: ' + i);
                } else {
                    parsed.state = ParseState.NonspaceValue;
                }
                break;
            }
            case ParseState.NonspaceValue: {
                if (isSpace(c) || (!c && !autompleteMode)) {
                    parsed.state = ParseState.EndValue;
                } else if (!c && autompleteMode) {
                    return parsed;
                } else {
                    parsed.incomplete += c;
                    i++;
                }
                break;
            }
            case ParseState.QuotedValue: {
                if (c === '') {
                    if (autompleteMode) {
                        return parsed;
                    }
                    return parseError('matching double quote expected before end of input: ' + i);
                } else if (escaped) {
                    //TODO: handle \n, \t, other escaped chars
                    parsed.incomplete += c;
                    escaped = false;
                    i++;
                } else if (c === '"') {
                    parsed.state = ParseState.EndValue;
                    i++;
                } else if (c === '\\') {
                    escaped = true;
                    i++;
                } else {
                    parsed.incomplete += c;
                    i++;
                }
                break;
            }
            case ParseState.TickValue: {
                if (c === '') {
                    if (autompleteMode) {
                        return parsed;
                    }
                    return parseError('matching tick quote expected before end of input: ' + i);
                } else if (c === '`') {
                    parsed.state = ParseState.EndValue;
                    i++;
                } else {
                    parsed.incomplete += c;
                    i++;
                }
                break;
            }
            case ParseState.EndValue: {
                if (!parsed.field) {
                    return parseError('field value expected: ' + i);
                }

                if (parsed.field.type === AppFieldTypes.BOOL && parsed.incomplete !== 'true' && parsed.incomplete !== 'false') {
                    // in case of a boolean flag followed by not-a-boolean
                    // value, treat the value as a new parameter.
                    i = parsed.incompleteStart || 0;
                    parsed.values![parsed.field.name] = 'true';
                    parsed.state = ParseState.Parameter;
                } else {
                    parsed.values![parsed.field.name] = parsed.incomplete || '';
                    parsed.state = ParseState.ParameterSeparator;
                }
                parsed.incomplete = '';
                break;
            }
            }
        }

        return parsed;
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

    // fetchForm unconditionaly retrieves the form for the given binding (subcommand)
    fetchForm = async (binding: AppBinding): Promise<AppForm | null> => {
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
            const res = await this.store.dispatch(doAppCall(payload)) as {data?: AppCallResponse; error?: Error};
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

    getFormForBinding = async (parsed: ParseData): Promise<AppForm> => {
        if (parsed.binding?.form) {
            return parsed.binding.form;
        }
        const defaultForm = {
            fields: [],
        };
        if (this.forms[parsed.location]) {
            return this.forms[parsed.location];
        }
        if (!parsed.binding) {
            return defaultForm;
        }
        const form = await this.fetchForm(parsed.binding);
        if (!form) {
            return defaultForm;
        }
        this.forms[parsed.location] = form;
        return form;
    }

    // displayError shows an error that was caught by the parser
    displayError = (err: any): void => {
        let errStr = err as string;
        if (err.message) {
            errStr = err.message;
        }
        sendEphemeralPost(errStr, '', '');

        // TODO display error under the command line
    }

    // getSuggestionsForCursorPosition computes subcommand/form suggestions
    // TODO we need the full text here, not just the pretext. Rework.
    getSuggestionsForCursorPosition = async (text: string): Promise<AutocompleteSuggestion[]> => {
        const res = await this.parseCommand(text);
        if (res.state === ParseState.Error) {
            return [];
        }
        const parsed = res as ParseData;

        let suggestions: AutocompleteSuggestion[] = [];
        if (parsed.state === ParseState.Command) {
            suggestions = this.getCommandSuggestions(parsed);
        }

        if (!parsed.form) {
            return suggestions;
        }

        const argSuggestions = await this.getParameterSuggestions(parsed);
        suggestions = suggestions.concat(argSuggestions);

        // Add "Execute Current Command" suggestion
        // eslint-disable-next-line no-warning-comments
        // TODO get full text from SuggestionBox
        if (this.getMissingFields(parsed).length === 0) {
            const execute = this.getExecuteSuggestion(parsed);
            suggestions = [execute, ...suggestions];
        }

        return suggestions;
    }

    // getParameterSuggestions computes suggestions for positional argument values, flag names, and flag argument values
    getParameterSuggestions = async (parsed: ParseData): Promise<AutocompleteSuggestion[]> => {
        switch (Number(parsed.state)) {
        case ParseState.Flag:
            return this.getFlagNameSuggestions(parsed);

        case ParseState.NonspaceValue:
        case ParseState.QuotedValue:
        case ParseState.TickValue:
            return this.getValueSuggestions(parsed);
        }
        return [];
    }

    // getExecuteSuggestion returns the "Execute Current Command" suggestion
    getExecuteSuggestion = (parsed: ParseData): AutocompleteSuggestion => {
        let key = 'Ctrl';
        if (Utils.isMac()) {
            key = '⌘';
        }

        return {
            complete: parsed.text + EXECUTE_CURRENT_COMMAND_ITEM_ID,
            suggestion: '/Execute Current Command',
            hint: '',
            description: 'Select this option or use ' + key + '+Enter to execute the current command.',
            iconData: EXECUTE_CURRENT_COMMAND_ITEM_ID,
        };
    }

    // getMissingFields collects the required fields that were not supplied in a submission
    getMissingFields = (parsed: ParseData): AppField[] => {
        const form = parsed.form;
        if (!form) {
            return [];
        }

        const missing: AppField[] = [];

        const values = parsed.values || [];
        const fields = form.fields || [];
        for (const field of fields) {
            if (field.is_required && !values[field.name]) {
                missing.push(field);
            }
        }

        return missing;
    }

    // getParameterSuggestions computes suggestions for positional argument values, flag names, and flag argument values
    getFlagNameSuggestions = (parsed: ParseData): AutocompleteSuggestion[] => {
        if (!parsed.form || !parsed.form.fields || !parsed.form.fields.length) {
            return [];
        }

        const applicable = parsed.form.fields.filter((field) => field.label && field.label.startsWith(parsed.incomplete));
        if (applicable) {
            return applicable.map((f) => {
                let suffix = '';
                if (f.type === AppFieldTypes.USER) {
                    suffix = ' @';
                } else if (f.type === AppFieldTypes.CHANNEL) {
                    suffix = ' ~';
                }
                return {
                    complete: '--' + (f.label || f.name) + suffix,
                    suggestion: '--' + (f.label || f.name),
                    description: f.description,
                    hint: f.hint,
                };
            });
        }

        return [{suggestion: 'Could not find any suggestions'}];
    }

    // getSuggestionsForField gets suggestions for a positional or flag field value
    getValueSuggestions = async (parsed: ParseData): Promise<AutocompleteSuggestion[]> => {
        if (!parsed || !parsed.field) {
            return [];
        }
        const f = parsed.field;

        switch (f.type) {
        case AppFieldTypes.USER:
            return this.getUserSuggestions(parsed);
        case AppFieldTypes.CHANNEL:
            return this.getChannelSuggestions(parsed);
        case AppFieldTypes.BOOL:
            return this.getBooleanSuggestions(parsed);
        case AppFieldTypes.DYNAMIC_SELECT:
            return this.getDynamicSelectSuggestions(parsed);
        case AppFieldTypes.STATIC_SELECT:
            return this.getStaticSelectSuggestions(parsed);
        }

        return [{
            complete: parsed.text,
            suggestion: '',
            description: f.description,
            hint: f.hint,
        }];
    }

    // getStaticSelectSuggestions returns suggestions specified in the field's options property
    getStaticSelectSuggestions = (parsed: ParseData): AutocompleteSuggestion[] => {
        const f = parsed.field as AutocompleteStaticSelect;
        const opts = f.options.filter((opt) => opt.label.toLowerCase().startsWith(parsed.incomplete.toLowerCase()));
        return opts.map((opt) => ({
            complete: opt.label,
            suggestion: opt.label,
            hint: '',
            description: '',
        }));
    }

    // getDynamicSelectSuggestions fetches and returns suggestions from the server
    getDynamicSelectSuggestions = async (parsed: ParseData): Promise<AutocompleteSuggestion[]> => {
        const f = parsed.field;
        if (!f) {
            return [];
        }

        const values: AppLookupCallValues = {
            name: f.name,
            user_input: parsed.incomplete,
            values: parsed.values,
        };

        const payload = this.composeCallFromParsed(parsed);
        if (!payload) {
            return [];
        }
        payload.type = AppCallTypes.LOOKUP;
        payload.values = values;

        type ResponseType = {items: AppSelectOption[]};
        let res: {data?: AppCallResponse<ResponseType>; error?: any};
        try {
            res = await this.store.dispatch(doAppCall<ResponseType>(payload));
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
    getUserSuggestions = (parsed: ParseData): AutocompleteSuggestion[] => {
        if (parsed.incomplete.trim().length === 0) {
            return [{
                suggestion: '@',
                description: parsed.field?.description || '',
                hint: parsed.field?.hint || '',
            }];
        }

        return [];
    }

    // getChannelSuggestions returns a suggestion with `~` if the user has not started typing
    getChannelSuggestions = (parsed: ParseData): AutocompleteSuggestion[] => {
        if (parsed.incomplete.trim().length === 0) {
            return [{
                suggestion: '~',
                description: parsed.field?.description || '',
                hint: parsed.field?.hint || '',
            }];
        }

        return [];
    }

    // getBooleanSuggestions returns true/false suggestions
    getBooleanSuggestions = (parsed: ParseData): AutocompleteSuggestion[] => {
        const suggestions: AutocompleteSuggestion[] = [];

        if ('true'.startsWith(parsed.incomplete)) {
            suggestions.push({
                complete: 'true',
                suggestion: 'true',
            });
        }
        if ('false'.startsWith(parsed.incomplete)) {
            suggestions.push({
                complete: 'false',
                suggestion: 'false',
            });
        }
        return suggestions;
    }

    // getSuggestionsForSubCommands returns suggestions for a subcommand's name
    getCommandSuggestions = (parsed: ParseData): AutocompleteSuggestion[] => {
        if (!parsed.binding || !parsed.binding.bindings || !parsed.binding.bindings.length) {
            return [];
        }
        const bindings = parsed.binding.bindings;
        const result: AutocompleteSuggestion[] = [];

        for (const sub of bindings) {
            if (sub.label.toLowerCase().startsWith(parsed.incomplete)) {
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
}
