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
    StartParameter,
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

export class ParsedCommand {
    state: ParseState;
    command: string;
    incomplete: string;
    incompleteStart: number;
    binding: AppBinding | undefined;
    form: AppForm | undefined;
    field: AppField | undefined;
    position: number;
    values: {[name: string]: string};
    location: string;
    error: string;

    constructor(command: string) {
        this.state = ParseState.Start;
        this.command = command;
        this.incomplete = '';
        this.incompleteStart = 0;
        this.position = 0;
        this.values = {};
        this.location = '';
        this.error = '';
    }
}

export class AppCommandParser {
    private store: Store;
    private rootPostID: string;

    forms: {[location: string]: AppForm} = {};

    constructor(store: Store, rootPostID = '') {
        this.store = store;
        this.rootPostID = rootPostID;
    }

    // composeCallFromCommand creates the form submission call
    public composeCallFromCommand = async (command: string): Promise<AppCall | null> => {
        const parsed = await this.parseSubmitCommand(command);
        if (parsed.state === ParseState.Error) {
            this.displayError(parsed.error);
            return null;
        }

        const missing = this.getMissingFields(parsed);
        if (missing.length > 0) {
            const missingStr = missing.map((f) => f.label).join(', ');
            this.displayError('Required fields missing: ' + missingStr);
            return null;
        }

        return this.composeCallFromParsed(parsed);
    }

    // getSuggestionsBase is a synchronous function that returns results for base commands
    public getSuggestionsBase = (pretext: string): AutocompleteSuggestionWithComplete[] => {
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

    // getSuggestions returns suggestions for subcommands and/or form arguments
    public getSuggestions = async (pretext: string): Promise<AutocompleteSuggestionWithComplete[]> => {
        const commandBindings = this.getCommandBindings();
        if (!commandBindings) {
            return [];
        }

        let parsed = await this.matchBinding(pretext, commandBindings, true);
        let suggestions: AutocompleteSuggestion[] = [];
        if (parsed.state === ParseState.Command || parsed.state === ParseState.CommandSeparator) {
            suggestions = this.getCommandSuggestions(parsed);
        }

        if (parsed.form || parsed.incomplete) {
            parsed = this.parseForm(parsed, true);
            const argSuggestions = await this.getParameterSuggestions(parsed);
            suggestions = suggestions.concat(argSuggestions);
        }

        // Add "Execute Current Command" suggestion
        // TODO get full text from SuggestionBox
        const executableStates = [
            ParseState.EndCommand,
            ParseState.CommandSeparator,
            ParseState.StartParameter,
            ParseState.ParameterSeparator,
            ParseState.EndValue,
        ];
        const call = parsed.form?.call || parsed.binding?.call || parsed.binding?.form?.call;
        const hasRequired = this.getMissingFields(parsed).length === 0;
        const hasValue = (parsed.state !== ParseState.EndValue || (parsed.field && parsed.values[parsed.field.name] !== undefined));

        if (executableStates.includes(parsed.state) && call && hasRequired && hasValue) {
            const execute = this.getExecuteSuggestion(parsed);
            suggestions = [execute, ...suggestions];
        }

        return suggestions.map((suggestion) => this.decorateSuggestionComplete(parsed, suggestion));
    }

    parseSubmitCommand = async (command: string): Promise<ParsedCommand> => {
        const commandBindings = this.getCommandBindings();
        if (!commandBindings) {
            return this.parseError('no command bindings');
        }

        const matched = await this.matchBinding(command, commandBindings, false);
        return this.parseForm(matched, false);
    }

    // composeCallFromParsed creates the form submission call
    composeCallFromParsed = (parsed: ParsedCommand): AppCall | null => {
        if (!parsed.binding) {
            return null;
        }

        const call = parsed.form?.call || parsed.binding.call;
        if (!call) {
            return null;
        }

        return {
            ...call,
            type: AppCallTypes.SUBMIT,
            context: {
                ...this.getAppContext(),
                app_id: parsed.binding.app_id,
            },
            values: parsed.values,
            raw_command: parsed.command,
        };
    }

    // matchBinding finds the closest matching command binding.
    matchBinding = async (command: string, commandBindings: AppBinding[], autocompleteMode = false): Promise<ParsedCommand> => {
        const parsed = new ParsedCommand(command);
        let bindings = commandBindings;
        let i = 0;

        let done = false;
        while (!done) {
            let c = '';
            if (i < command.length) {
                c = command[i];
            }

            switch (Number(parsed.state)) {
            case ParseState.Start: {
                if (c !== '/') {
                    return this.parseError('command must start with a /: ' + i);
                }
                if (bindings.length === 0) {
                    return this.parseError('no command bindings: ' + i);
                }
                i++;
                parsed.incomplete = '';
                parsed.incompleteStart = i;
                parsed.state = ParseState.Command;
                break;
            }

            case ParseState.Command: {
                switch (c) {
                case '': {
                    if (autocompleteMode) {
                        // Finish in the Command state, 'incomplete' will have the query string
                        done = true;
                    } else {
                        parsed.state = ParseState.EndCommand;
                    }
                    break;
                }
                case ' ':
                case '\t': {
                    parsed.state = ParseState.EndCommand;
                    break;
                }
                default:
                    parsed.incomplete += c;
                    i++;
                    break;
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

            default: {
                return this.parseError('unreachable: unexpected state in matchBinding: ' + parsed.state);
            }
            }
        }

        if (!parsed.binding) {
            return this.parseError('"' + command + '": no match');
        }

        let form: AppForm | undefined = parsed.binding.form || this.forms[parsed.location];
        if (!form) {
            form = await this.fetchForm(parsed.binding);
        }
        if (form) {
            this.forms[parsed.location] = form;
            parsed.form = form;
        }

        return parsed;
    }

    // parseForm parses the rest of the command using the specified form.
    parseForm = (parsed: ParsedCommand, autocompleteMode = false): ParsedCommand => {
        if (parsed.state === ParseState.Error || !parsed.form) {
            return parsed;
        }

        let fields: AppField[] = [];
        if (parsed.form.fields) {
            fields = parsed.form.fields;
        }

        parsed.state = ParseState.StartParameter;
        let i = parsed.incompleteStart || 0;
        let flagEqualsUsed = false;
        let escaped = false;
        const command = parsed.command || '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
            let c = '';
            if (i < command.length) {
                c = command[i];
            }

            switch (Number(parsed.state)) {
            case ParseState.StartParameter: {
                switch (c) {
                case '':
                    return parsed;
                case '-': {
                    // Named parameter (aka Flag). Flag1 consumes the optional second '-'.
                    parsed.state = ParseState.Flag1;
                    i++;
                    break;
                }
                default: {
                    // Positional parameter.
                    parsed.position++;
                    // eslint-disable-next-line no-loop-func
                    const field = fields.find((f: AppField) => f.position === parsed.position);
                    if (!field) {
                        return this.parseError('command does not accept ' + parsed.position + ' positional arguments: ' + i);
                    }
                    parsed.field = field;
                    parsed.state = ParseState.StartValue;
                    break;
                }
                }
                break;
            }

            case ParseState.ParameterSeparator: {
                switch (c) {
                case '':
                    return parsed;
                case ' ':
                case '\t': {
                    i++;
                    break;
                }
                default:
                    parsed.state = ParseState.StartParameter;
                    break;
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
                switch (c) {
                case '': {
                    if (autocompleteMode) {
                        return parsed;
                    }

                    // for submit fall through to whitespace, to handle an (implicit) BOOl value.
                }
                // eslint-disable-next-line no-fallthrough
                case ' ':
                case '\t':
                case '=': {
                    const field = fields.find((f) => f.label === parsed.incomplete);
                    if (!field) {
                        return this.parseError('command does not accept flag ' + parsed.incomplete + ': ' + i);
                    }
                    parsed.state = ParseState.FlagValueSeparator;
                    parsed.field = field;
                    parsed.incomplete = '';
                    break;
                }
                default: {
                    parsed.incomplete += c;
                    i++;
                    break;
                }
                }
                break;
            }

            case ParseState.FlagValueSeparator: {
                parsed.incompleteStart = i;
                switch (c) {
                case '': {
                    if (autocompleteMode) {
                        return parsed;
                    }
                    parsed.state = ParseState.StartValue;
                    break;
                }
                case ' ':
                case '\t': {
                    i++;
                    break;
                }
                case '=': {
                    if (flagEqualsUsed) {
                        return this.parseError('multiple = signs are not allowed: ' + i);
                    }
                    flagEqualsUsed = true;
                    i++;
                    break;
                }
                default: {
                    parsed.state = ParseState.StartValue;
                }
                }
                break;
            }

            case ParseState.StartValue: {
                parsed.incomplete = '';
                parsed.incompleteStart = i;
                switch (c) {
                case '"': {
                    parsed.state = ParseState.QuotedValue;
                    i++;
                    break;
                }
                case '`': {
                    parsed.state = ParseState.TickValue;
                    i++;
                    break;
                }
                case ' ':
                case '\t':
                    return this.parseError('unreachable: unexpected whitespace: ' + i);
                default: {
                    parsed.state = ParseState.NonspaceValue;
                    break;
                }
                }
                break;
            }

            case ParseState.NonspaceValue: {
                switch (c) {
                case '':
                case ' ':
                case '\t': {
                    parsed.state = ParseState.EndValue;
                    break;
                }
                default: {
                    parsed.incomplete += c;
                    i++;
                    break;
                }
                }
                break;
            }

            case ParseState.QuotedValue: {
                switch (c) {
                case '': {
                    if (!autocompleteMode) {
                        return this.parseError('matching double quote expected before end of input: ' + i);
                    }
                    parsed.state = ParseState.EndValue;
                    break;
                }
                case '"': {
                    i++;
                    parsed.state = ParseState.EndValue;
                    break;
                }
                case '\\': {
                    escaped = true;
                    i++;
                    break;
                }
                default: {
                    parsed.incomplete += c;
                    i++;
                    if (escaped) {
                        //TODO: handle \n, \t, other escaped chars
                        escaped = false;
                    }
                    break;
                }
                }
                break;
            }

            case ParseState.TickValue: {
                switch (c) {
                case '': {
                    if (!autocompleteMode) {
                        return this.parseError('matching tick quote expected before end of input: ' + i);
                    }
                    parsed.state = ParseState.EndValue;
                    break;
                }
                case '`': {
                    i++;
                    parsed.state = ParseState.EndValue;
                    break;
                }
                default: {
                    parsed.incomplete += c;
                    i++;
                    break;
                }
                }
                break;
            }

            case ParseState.EndValue: {
                if (!parsed.field) {
                    return this.parseError('field value expected: ' + i);
                }

                // special handling for optional BOOL values ('--boolflag true'
                // vs '--boolflag next-positional' vs '--boolflag
                // --next-flag...')
                if (parsed.field.type === AppFieldTypes.BOOL &&
                    ((autocompleteMode && !'true'.startsWith(parsed.incomplete) && !'false'.startsWith(parsed.incomplete)) ||
                    (!autocompleteMode && parsed.incomplete !== 'true' && parsed.incomplete !== 'false'))) {
                    // reset back where the value started, and treat as a new parameter
                    i = parsed.incompleteStart;
                    parsed.values![parsed.field.name] = 'true';
                    parsed.state = ParseState.StartParameter;
                } else {
                    if (autocompleteMode && c === '') {
                        return parsed;
                    }
                    parsed.values![parsed.field.name] = parsed.incomplete;
                    parsed.incomplete = '';
                    parsed.incompleteStart = i;
                    if (c === '') {
                        return parsed;
                    }
                    parsed.state = ParseState.ParameterSeparator;
                }
                break;
            }
            }
        }
    }

    // decorateSuggestionComplete applies the necessary modifications for a suggestion to be processed
    decorateSuggestionComplete = (parsed: ParsedCommand, choice: AutocompleteSuggestion): AutocompleteSuggestionWithComplete => {
        if (choice.complete && choice.complete.endsWith(EXECUTE_CURRENT_COMMAND_ITEM_ID)) {
            return choice as AutocompleteSuggestionWithComplete;
        }

        let complete = parsed.command.substring(0, parsed.incompleteStart);
        complete += choice.complete || choice.suggestion;
        if (!complete.endsWith(' ')) {
            complete += ' ';
        }
        choice.hint = choice.hint || '';
        choice.suggestion = '/' + choice.suggestion;

        return {
            ...choice,
            complete,
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
    fetchForm = async (binding: AppBinding): Promise<AppForm | undefined> => {
        if (!binding.call) {
            return undefined;
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
                return undefined;
            }
            callResponse = res.data;
        } catch (e) {
            this.displayError(e);
            return undefined;
        }

        return callResponse?.form;
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

    // getSuggestionsForSubCommands returns suggestions for a subcommand's name
    getCommandSuggestions = (parsed: ParsedCommand): AutocompleteSuggestion[] => {
        if (!parsed.binding?.bindings?.length) {
            return [];
        }
        const bindings = parsed.binding.bindings;
        const result: AutocompleteSuggestion[] = [];

        bindings.forEach((b) => {
            if (b.label.toLowerCase().startsWith(parsed.incomplete)) {
                result.push({
                    complete: b.label,
                    suggestion: b.label,
                    description: b.description,
                    hint: b.hint || '',
                });
            }
        });

        return result;
    }

    // getParameterSuggestions computes suggestions for positional argument values, flag names, and flag argument values
    getParameterSuggestions = async (parsed: ParsedCommand): Promise<AutocompleteSuggestion[]> => {
        switch (Number(parsed.state)) {
        case ParseState.StartParameter: {
            // see if there's a matching positional field
            const positional = parsed.form?.fields?.find((f: AppField) => f.position === parsed.position + 1);
            if (positional) {
                parsed.field = positional;
                return this.getValueSuggestions(parsed);
            }
            return this.getFlagNameSuggestions(parsed);
        }

        case ParseState.Flag:
            return this.getFlagNameSuggestions(parsed);

        case ParseState.EndValue:
        case ParseState.FlagValueSeparator:
        case ParseState.NonspaceValue:
        case ParseState.QuotedValue:
        case ParseState.TickValue:
            return this.getValueSuggestions(parsed);
        }
        return [];
    }

    // getExecuteSuggestion returns the "Execute Current Command" suggestion
    getExecuteSuggestion = (parsed: ParsedCommand): AutocompleteSuggestion => {
        let key = 'Ctrl';
        if (Utils.isMac()) {
            key = '⌘';
        }

        return {
            complete: parsed.command + EXECUTE_CURRENT_COMMAND_ITEM_ID,
            suggestion: '/Execute Current Command',
            hint: '',
            description: 'Select this option or use ' + key + '+Enter to execute the current command.',
            iconData: EXECUTE_CURRENT_COMMAND_ITEM_ID,
        };
    }

    // getMissingFields collects the required fields that were not supplied in a submission
    getMissingFields = (parsed: ParsedCommand): AppField[] => {
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

    // getFlagNameSuggestions returns suggestions for flag names
    getFlagNameSuggestions = (parsed: ParsedCommand): AutocompleteSuggestion[] => {
        if (!parsed.form || !parsed.form.fields || !parsed.form.fields.length) {
            return [];
        }

        // There have been 0 to 2 dashes in the command prior to this call, adjust.
        let prefix = '--';
        for (let i = parsed.incompleteStart - 1; i > 0 && i >= parsed.incompleteStart - 2 && parsed.command[i] === '-'; i--) {
            prefix = prefix.substring(1);
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
                    complete: prefix + (f.label || f.name) + suffix,
                    suggestion: '--' + (f.label || f.name),
                    description: f.description,
                    hint: f.hint,
                };
            });
        }

        return [{suggestion: 'Could not find any suggestions'}];
    }

    // getSuggestionsForField gets suggestions for a positional or flag field value
    getValueSuggestions = async (parsed: ParsedCommand): Promise<AutocompleteSuggestion[]> => {
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
            complete: '',
            suggestion: '',
            description: f.description,
            hint: f.hint,
        }];
    }

    // getStaticSelectSuggestions returns suggestions specified in the field's options property
    getStaticSelectSuggestions = (parsed: ParsedCommand): AutocompleteSuggestion[] => {
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
    getDynamicSelectSuggestions = async (parsed: ParsedCommand): Promise<AutocompleteSuggestion[]> => {
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
    getUserSuggestions = (parsed: ParsedCommand): AutocompleteSuggestion[] => {
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
    getChannelSuggestions = (parsed: ParsedCommand): AutocompleteSuggestion[] => {
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
    getBooleanSuggestions = (parsed: ParsedCommand): AutocompleteSuggestion[] => {
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

    parseError = (error: string): ParsedCommand => {
        const parsed = new ParsedCommand('');
        parsed.state = ParseState.Error;
        parsed.error = error;
        return parsed;
    };
}
