// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import {getAppBindings} from 'mattermost-redux/selectors/entities/apps';

import {AppBindingLocations, AppCallResponseTypes, AppCallTypes, AppFieldTypes} from 'mattermost-redux/constants/apps';

import {
    AppBinding,
    AppField,
    AppSelectOption,
    AppCallResponse,
    AppContext,
    AppForm,
    AutocompleteSuggestion,
    AutocompleteStaticSelect,
    AutocompleteSuggestionWithComplete,
    AppCallValues,
    AppCallRequest,
} from 'mattermost-redux/types/apps';

import {getPost} from 'mattermost-redux/selectors/entities/posts';
import {getChannel, getChannelByName as selectChannelByName, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {Channel} from 'mattermost-redux/types/channels';

import {getCurrentTeam, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {Store} from 'redux';

import {getUserByUsername as selectUserByUsername} from 'mattermost-redux/selectors/entities/users';

import {getUserByUsername} from 'mattermost-redux/actions/users';

import {getChannelByNameAndTeamName} from 'mattermost-redux/actions/channels';

import {Constants} from 'utils/constants';
import {GlobalState} from 'types/store';
import {sendEphemeralPost} from 'actions/global_actions';
import {doAppCall} from 'actions/apps';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';
import {createCallRequest} from 'utils/apps';

const EXECUTE_CURRENT_COMMAND_ITEM_ID = Constants.Integrations.EXECUTE_CURRENT_COMMAND_ITEM_ID;

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
    EndQuotedValue,
    EndTickedValue,
    Error,
}

interface FormsCache {
    getForm: (location: string, binding: AppBinding) => Promise<AppForm | undefined>;
}

export class ParsedCommand {
    state: ParseState = ParseState.Start;
    command: string;
    i = 0;
    incomplete = '';
    incompleteStart = 0;
    binding: AppBinding | undefined;
    form: AppForm | undefined;
    formsCache: FormsCache;
    field: AppField | undefined;
    position = 0;
    values: {[name: string]: string} = {};
    location = '';
    error = '';

    constructor(command: string, formsCache: FormsCache) {
        this.command = command;
        this.formsCache = formsCache || [];
    }

    asError = (message: string): ParsedCommand => {
        this.state = ParseState.Error;
        this.error = message;
        return this;
    };

    errorMessage = (): string => {
        return 'Parsing error: ' + this.error + '.\n```\n' + this.command + '\n' + ' '.repeat(this.i) + '^\n```';
    }

    // matchBinding finds the closest matching command binding.
    matchBinding = async (commandBindings: AppBinding[], autocompleteMode = false): Promise<ParsedCommand> => {
        if (commandBindings.length === 0) {
            return this.asError(Utils.localizeMessage('apps.error.command.no_bindings', 'No command bindings.'));
        }
        let bindings = commandBindings;

        let done = false;
        while (!done) {
            let c = '';
            if (this.i < this.command.length) {
                c = this.command[this.i];
            }

            switch (Number(this.state)) {
            case ParseState.Start: {
                if (c !== '/') {
                    return this.asError(Utils.localizeMessage('apps.error.parser.no_slash_start', 'Command must start with a `/`.'));
                }
                this.i++;
                this.incomplete = '';
                this.incompleteStart = this.i;
                this.state = ParseState.Command;
                break;
            }

            case ParseState.Command: {
                switch (c) {
                case '': {
                    if (autocompleteMode) {
                        // Finish in the Command state, 'incomplete' will have the query string
                        done = true;
                    } else {
                        this.state = ParseState.EndCommand;
                    }
                    break;
                }
                case ' ':
                case '\t': {
                    this.state = ParseState.EndCommand;
                    break;
                }
                default:
                    this.incomplete += c;
                    this.i++;
                    break;
                }
                break;
            }

            case ParseState.EndCommand: {
                const binding = bindings.find((b: AppBinding) => b.label === this.incomplete.toLowerCase());
                if (!binding) {
                    // gone as far as we could, this token doesn't match a sub-command.
                    // return the state from the last matching binding
                    done = true;
                    break;
                }
                this.binding = binding;
                this.location += '/' + binding.label;
                bindings = binding.bindings || [];
                this.state = ParseState.CommandSeparator;
                break;
            }

            case ParseState.CommandSeparator: {
                switch (c) {
                case ' ':
                case '\t': {
                    this.i++;
                    break;
                }

                case '':
                    done = true;
                // eslint-disable-next-line no-fallthrough
                default: {
                    this.incomplete = '';
                    this.incompleteStart = this.i;
                    this.state = ParseState.Command;
                    break;
                }
                }
                break;
            }

            default: {
                return this.asError(Utils.localizeAndFormatMessage(
                    t('apps.error.parser.unexpected_state'),
                    'Unreachable: Unexpected state in matchBinding: `{state}`.',
                    {state: this.state},
                ));
            }
            }
        }

        if (!this.binding) {
            return this.asError(Utils.localizeAndFormatMessage(
                t('apps.error.parser.no_match'),
                '`{command}`: no match.',
                {command: this.command},
            ));
        }

        this.form = this.binding.form;
        if (!this.form) {
            this.form = await this.formsCache.getForm(this.location, this.binding);
        }

        return this;
    }

    // parseForm parses the rest of the command using the previously matched form.
    parseForm = (autocompleteMode = false): ParsedCommand => {
        if (this.state === ParseState.Error || !this.form) {
            return this;
        }

        let fields: AppField[] = [];
        if (this.form.fields) {
            fields = this.form.fields;
        }

        this.state = ParseState.StartParameter;
        this.i = this.incompleteStart || 0;
        let flagEqualsUsed = false;
        let escaped = false;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            let c = '';
            if (this.i < this.command.length) {
                c = this.command[this.i];
            }

            switch (Number(this.state)) {
            case ParseState.StartParameter: {
                switch (c) {
                case '':
                    return this;
                case '-': {
                    // Named parameter (aka Flag). Flag1 consumes the optional second '-'.
                    this.state = ParseState.Flag1;
                    this.i++;
                    break;
                }
                default: {
                    // Positional parameter.
                    this.position++;
                    // eslint-disable-next-line no-loop-func
                    const field = fields.find((f: AppField) => f.position === this.position);
                    if (!field) {
                        return this.asError(Utils.localizeAndFormatMessage(
                            t('apps.error.parser.no_argument_pos_x'),
                            'Command does not accept {positionX} positional arguments.',
                            {positionX: this.position},
                        ));
                    }
                    this.field = field;
                    this.state = ParseState.StartValue;
                    break;
                }
                }
                break;
            }

            case ParseState.ParameterSeparator: {
                this.incompleteStart = this.i;
                switch (c) {
                case '':
                    this.state = ParseState.StartParameter;
                    return this;
                case ' ':
                case '\t': {
                    this.i++;
                    break;
                }
                default:
                    this.state = ParseState.StartParameter;
                    break;
                }
                break;
            }

            case ParseState.Flag1: {
                // consume the optional second '-'
                if (c === '-') {
                    this.i++;
                }
                this.state = ParseState.Flag;
                this.incomplete = '';
                this.incompleteStart = this.i;
                flagEqualsUsed = false;
                break;
            }

            case ParseState.Flag: {
                switch (c) {
                case '': {
                    if (autocompleteMode) {
                        return this;
                    }

                    // for submit fall through to whitespace, to handle an (implicit) BOOl value.
                }
                // eslint-disable-next-line no-fallthrough
                case ' ':
                case '\t':
                case '=': {
                    const field = fields.find((f) => f.label === this.incomplete.toLowerCase());
                    if (!field) {
                        return this.asError(Utils.localizeAndFormatMessage(
                            t('apps.error.parser.unexpected_flag'),
                            'Command does not accept flag `{flagName}`.',
                            {flagName: this.incomplete},
                        ));
                    }
                    this.state = ParseState.FlagValueSeparator;
                    this.field = field;
                    this.incomplete = '';
                    break;
                }
                default: {
                    this.incomplete += c;
                    this.i++;
                    break;
                }
                }
                break;
            }

            case ParseState.FlagValueSeparator: {
                this.incompleteStart = this.i;
                switch (c) {
                case '': {
                    if (autocompleteMode) {
                        return this;
                    }
                    this.state = ParseState.StartValue;
                    break;
                }
                case ' ':
                case '\t': {
                    this.i++;
                    break;
                }
                case '=': {
                    if (flagEqualsUsed) {
                        return this.asError(Utils.localizeMessage('apps.error.parser.multiple_equal', 'Multiple `=` signs are not allowed.'));
                    }
                    flagEqualsUsed = true;
                    this.i++;
                    break;
                }
                default: {
                    this.state = ParseState.StartValue;
                }
                }
                break;
            }

            case ParseState.StartValue: {
                this.incomplete = '';
                this.incompleteStart = this.i;
                switch (c) {
                case '"': {
                    this.state = ParseState.QuotedValue;
                    this.i++;
                    break;
                }
                case '`': {
                    this.state = ParseState.TickValue;
                    this.i++;
                    break;
                }
                case ' ':
                case '\t':
                    return this.asError(Utils.localizeMessage('apps.error.parser.unexpected_whitespace', 'Unreachable: Unexpected whitespace.'));
                default: {
                    this.state = ParseState.NonspaceValue;
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
                    this.state = ParseState.EndValue;
                    break;
                }
                default: {
                    this.incomplete += c;
                    this.i++;
                    break;
                }
                }
                break;
            }

            case ParseState.QuotedValue: {
                switch (c) {
                case '': {
                    if (!autocompleteMode) {
                        return this.asError(Utils.localizeMessage('apps.error.parser.missing_quote', 'Matching double quote expected before end of input.'));
                    }
                    return this;
                }
                case '"': {
                    if (this.incompleteStart === this.i - 1) {
                        return this.asError('empty values are not allowed');
                    }
                    this.i++;
                    this.state = ParseState.EndQuotedValue;
                    break;
                }
                case '\\': {
                    escaped = true;
                    this.i++;
                    break;
                }
                default: {
                    this.incomplete += c;
                    this.i++;
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
                        return this.asError(Utils.localizeMessage('apps.error.parser.missing_tick', 'Matching tick quote expected before end of input.'));
                    }
                    return this;
                }
                case '`': {
                    if (this.incompleteStart === this.i - 1) {
                        return this.asError('empty values are not allowed');
                    }
                    this.i++;
                    this.state = ParseState.EndTickedValue;
                    break;
                }
                default: {
                    this.incomplete += c;
                    this.i++;
                    break;
                }
                }
                break;
            }

            case ParseState.EndTickedValue:
            case ParseState.EndQuotedValue:
            case ParseState.EndValue: {
                if (!this.field) {
                    return this.asError(Utils.localizeMessage('apps.error.parser.missing_field_value', 'Field value Expected.'));
                }

                // special handling for optional BOOL values ('--boolflag true'
                // vs '--boolflag next-positional' vs '--boolflag
                // --next-flag...')
                if (this.field.type === AppFieldTypes.BOOL &&
                    ((autocompleteMode && !'true'.startsWith(this.incomplete) && !'false'.startsWith(this.incomplete)) ||
                    (!autocompleteMode && this.incomplete !== 'true' && this.incomplete !== 'false'))) {
                    // reset back where the value started, and treat as a new parameter
                    this.i = this.incompleteStart;
                    this.values![this.field.name] = 'true';
                    this.state = ParseState.StartParameter;
                } else {
                    if (autocompleteMode && c === '') {
                        return this;
                    }
                    this.values![this.field.name] = this.incomplete;
                    this.incomplete = '';
                    this.incompleteStart = this.i;
                    if (c === '') {
                        return this;
                    }
                    this.state = ParseState.ParameterSeparator;
                }
                break;
            }
            }
        }
    }
}

export class AppCommandParser {
    private store: Store<GlobalState>;
    private rootPostID: string;
    private channelID: string;

    forms: {[location: string]: AppForm} = {};

    constructor(store: Store, channelID: string, rootPostID = '') {
        this.store = store;
        this.rootPostID = rootPostID;
        this.channelID = channelID;
    }

    // composeCallFromCommand creates the form submission call
    public composeCallFromCommand = async (command: string): Promise<AppCallRequest | null> => {
        let parsed = new ParsedCommand(command, this);

        const commandBindings = this.getCommandBindings();
        if (!commandBindings) {
            this.displayError(Utils.localizeMessage('apps.error.command.no_bindings', 'No command bindings.'));
            return null;
        }

        parsed = await parsed.matchBinding(commandBindings, false);
        parsed = parsed.parseForm(false);
        if (parsed.state === ParseState.Error) {
            this.displayError(parsed.errorMessage());
            return null;
        }

        const missing = this.getMissingFields(parsed);
        if (missing.length > 0) {
            const missingStr = missing.map((f) => f.label).join(', ');
            this.displayError(Utils.localizeAndFormatMessage(
                t('apps.error.command.field_missing'),
                'Required fields missing: `{fieldName}`.',
                {fieldName: missingStr}));
            return null;
        }

        return this.composeCallFromParsed(parsed);
    }

    // getSuggestionsBase is a synchronous function that returns results for base commands
    public getSuggestionsBase = (pretext: string): AutocompleteSuggestionWithComplete[] => {
        const command = pretext.toLowerCase();
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
            if (base.startsWith(command)) {
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
        let parsed = new ParsedCommand(pretext, this);

        const commandBindings = this.getCommandBindings();
        if (!commandBindings) {
            return [];
        }

        parsed = await parsed.matchBinding(commandBindings, true);
        let suggestions: AutocompleteSuggestion[] = [];
        if (parsed.state === ParseState.Command) {
            suggestions = this.getCommandSuggestions(parsed);
        }

        if (parsed.form || parsed.incomplete) {
            parsed = parsed.parseForm(true);
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

    // composeCallFromParsed creates the form submission call
    composeCallFromParsed = async (parsed: ParsedCommand): Promise<AppCallRequest | null> => {
        if (!parsed.binding) {
            return null;
        }

        const call = parsed.form?.call || parsed.binding.call;
        if (!call) {
            return null;
        }

        const values: AppCallValues = parsed.values;
        const ok = await this.expandOptions(parsed, values);

        if (!ok) {
            return null;
        }

        const context = this.getAppContext(parsed.binding.app_id);
        return createCallRequest(call, context, {}, values, parsed.command);
    }

    expandOptions = async (parsed: ParsedCommand, values: AppCallValues) => {
        if (!parsed.form) {
            return true;
        }

        let ok = true;
        await Promise.all(parsed.form.fields.map(async (f) => {
            if (!values[f.name]) {
                return;
            }
            switch (f.type) {
            case AppFieldTypes.DYNAMIC_SELECT:
                values[f.name] = {label: '', value: values[f.name]};
                break;
            case AppFieldTypes.STATIC_SELECT: {
                const option = f.options?.find((o) => (o.value === values[f.name]));
                if (!option) {
                    ok = false;
                    this.displayError(Utils.localizeAndFormatMessage(
                        t('apps.error.command.unknown_option'),
                        'Unknown option for field `{fieldName}`: `{option}`.',
                        {
                            fieldName: f.name,
                            option: values[f.name],
                        }));
                    return;
                }
                values[f.name] = option;
                break;
            }
            case AppFieldTypes.USER: {
                let userName = values[f.name] as string;
                if (userName[0] === '@') {
                    userName = userName.substr(1);
                }
                let user = selectUserByUsername(this.store.getState(), userName);
                if (!user) {
                    const dispatchResult = await this.store.dispatch(getUserByUsername(userName) as any);
                    if ('error' in dispatchResult) {
                        ok = false;
                        this.displayError(Utils.localizeAndFormatMessage(
                            t('apps.error.command.unknown_user'),
                            'Unknown user for field `{fieldName}`: `{option}`.',
                            {
                                fieldName: f.name,
                                option: values[f.name],
                            }));
                        return;
                    }
                    user = dispatchResult.data;
                }
                values[f.name] = {label: user.username, value: user.id};
                break;
            }
            case AppFieldTypes.CHANNEL: {
                let channelName = values[f.name] as string;
                if (channelName[0] === '~') {
                    channelName = channelName.substr(1);
                }
                let channel = selectChannelByName(this.store.getState(), channelName);
                if (!channel) {
                    const dispatchResult = await this.store.dispatch(getChannelByNameAndTeamName(getCurrentTeam(this.store.getState()).name, channelName) as any);
                    if ('error' in dispatchResult) {
                        ok = false;
                        this.displayError(Utils.localizeAndFormatMessage(
                            t('apps.error.command.unknown_channel'),
                            'Unknown channel for field `{fieldName}`: `{option}`.',
                            {
                                fieldName: f.name,
                                option: values[f.name],
                            }));
                        return;
                    }
                    channel = dispatchResult.data;
                }
                values[f.name] = {label: channel?.display_name, value: channel?.id};
                break;
            }
            }
        }));

        return ok;
    }

    // decorateSuggestionComplete applies the necessary modifications for a suggestion to be processed
    decorateSuggestionComplete = (parsed: ParsedCommand, choice: AutocompleteSuggestion): AutocompleteSuggestionWithComplete => {
        if (choice.complete && choice.complete.endsWith(EXECUTE_CURRENT_COMMAND_ITEM_ID)) {
            return choice as AutocompleteSuggestionWithComplete;
        }

        let goBackSpace = 0;
        if (choice.complete === '') {
            goBackSpace = 1;
        }
        let complete = parsed.command.substring(0, parsed.incompleteStart - goBackSpace);
        complete += choice.complete || choice.suggestion;
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
        const command = pretext.toLowerCase();
        for (const binding of this.getCommandBindings()) {
            let base = binding.app_id;
            if (!base) {
                continue;
            }

            if (base[0] !== '/') {
                base = '/' + base;
            }

            if (command.startsWith(base + ' ')) {
                return true;
            }
        }
        return false;
    }

    // getAppContext collects post/channel/team info for performing calls
    getAppContext = (appID: string): AppContext => {
        const context: AppContext = {
            app_id: appID,
            location: AppBindingLocations.COMMAND,
            root_id: this.rootPostID,
        };

        const channel = this.getChannel();
        if (!channel) {
            return context;
        }

        context.channel_id = channel.id;
        context.team_id = channel.team_id || getCurrentTeamId(this.store.getState());

        return context;
    }

    // fetchForm unconditionaly retrieves the form for the given binding (subcommand)
    fetchForm = async (binding: AppBinding): Promise<AppForm | undefined> => {
        if (!binding.call) {
            return undefined;
        }

        const payload = createCallRequest(
            binding.call,
            this.getAppContext(binding.app_id),
        );

        const res = await this.store.dispatch(doAppCall(payload, AppCallTypes.FORM) as any) as {data: AppCallResponse};
        const callResponse = res.data;
        switch (callResponse.type) {
        case AppCallResponseTypes.FORM:
            break;
        case AppCallResponseTypes.ERROR:
            this.displayError(callResponse.error || Utils.localizeMessage('apps.error.unknown', 'Unknown error.'));
            return undefined;
        case AppCallResponseTypes.NAVIGATE:
        case AppCallResponseTypes.OK:
            this.displayError(Utils.localizeAndFormatMessage(
                t('apps.error.responses.unexpected_type'),
                'App response type was not expected. Response type: {type}',
                {type: callResponse.type},
            ));
            return undefined;
        default:
            this.displayError(Utils.localizeAndFormatMessage(
                t('apps.error.responses.unknown_type'),
                'App response type not supported. Response type: {type}.',
                {type: callResponse.type},
            ));
            return undefined;
        }

        return callResponse.form;
    }

    getForm = async (location: string, binding: AppBinding): Promise<AppForm | undefined> => {
        const form = this.forms[location];
        if (form) {
            return form;
        }

        const fetched = await this.fetchForm(binding);
        if (fetched) {
            this.forms[location] = fetched;
        }
        return fetched;
    }

    // displayError shows an error that was caught by the parser
    displayError = (err: any): void => {
        let errStr = err as string;
        if (err.message) {
            errStr = err.message;
        }
        sendEphemeralPost(errStr, this.channelID, this.rootPostID);

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
            if (b.label.toLowerCase().startsWith(parsed.incomplete.toLowerCase())) {
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
            return this.getValueSuggestions(parsed);
        case ParseState.EndQuotedValue:
        case ParseState.QuotedValue:
            return this.getValueSuggestions(parsed, '"');
        case ParseState.EndTickedValue:
        case ParseState.TickValue:
            return this.getValueSuggestions(parsed, '`');
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

        const applicable = parsed.form.fields.filter((field) => field.label && field.label.startsWith(parsed.incomplete.toLowerCase()) && !parsed.values[field.name]);
        if (applicable) {
            return applicable.map((f) => {
                return {
                    complete: prefix + (f.label || f.name),
                    suggestion: '--' + (f.label || f.name),
                    description: f.description,
                    hint: f.hint,
                };
            });
        }

        return [{suggestion: 'Could not find any suggestions'}];
    }

    // getSuggestionsForField gets suggestions for a positional or flag field value
    getValueSuggestions = async (parsed: ParsedCommand, delimiter?: string): Promise<AutocompleteSuggestion[]> => {
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
            return this.getDynamicSelectSuggestions(parsed, delimiter);
        case AppFieldTypes.STATIC_SELECT:
            return this.getStaticSelectSuggestions(parsed, delimiter);
        }

        let complete = parsed.incomplete;
        if (complete && delimiter) {
            complete = delimiter + complete + delimiter;
        }

        return [{
            complete,
            suggestion: parsed.incomplete,
            description: f.description,
            hint: f.hint,
        }];
    }

    // getStaticSelectSuggestions returns suggestions specified in the field's options property
    getStaticSelectSuggestions = (parsed: ParsedCommand, delimiter?: string): AutocompleteSuggestion[] => {
        const f = parsed.field as AutocompleteStaticSelect;
        const opts = f.options.filter((opt) => opt.label.toLowerCase().startsWith(parsed.incomplete.toLowerCase()));
        return opts.map((opt) => {
            let complete = opt.value;
            if (delimiter) {
                complete = delimiter + complete + delimiter;
            } else if (isMultiword(opt.value)) {
                complete = '`' + complete + '`';
            }
            return {
                complete,
                suggestion: opt.label,
                hint: '',
                description: '',
            };
        });
    }

    // getDynamicSelectSuggestions fetches and returns suggestions from the server
    getDynamicSelectSuggestions = async (parsed: ParsedCommand, delimiter?: string): Promise<AutocompleteSuggestion[]> => {
        const f = parsed.field;
        if (!f) {
            return [];
        }

        const payload = await this.composeCallFromParsed(parsed);
        if (!payload) {
            return [];
        }
        payload.selected_field = f.name;
        payload.query = parsed.incomplete;

        type ResponseType = {items: AppSelectOption[]};
        const res = await this.store.dispatch(doAppCall(payload, AppCallTypes.LOOKUP) as any) as {data: AppCallResponse<ResponseType>};
        const callResponse = res.data;
        switch (callResponse.type) {
        case AppCallResponseTypes.OK:
            break;
        case AppCallResponseTypes.ERROR:
            return makeSuggestionError(callResponse.error || Utils.localizeMessage('apps.error.unknown', 'Unknown error.'));
        case AppCallResponseTypes.NAVIGATE:
        case AppCallResponseTypes.FORM:
            return makeSuggestionError(Utils.localizeAndFormatMessage(
                t('apps.error.responses.unexpected_type'),
                'App response type was not expected. Response type: {type}',
                {type: callResponse.type},
            ));
        default:
            return makeSuggestionError(Utils.localizeAndFormatMessage(
                t('apps.error.responses.unknown_type'),
                'App response type not supported. Response type: {type}.',
                {type: callResponse.type},
            ));
        }

        const items = res?.data?.data?.items;
        if (!items) {
            return [{suggestion: Utils.localizeMessage('apps.suggestion.no_dynamic', 'Received no data for dynamic suggestions')}];
        }

        return items.map((s): AutocompleteSuggestion => {
            let complete = s.value;
            if (delimiter) {
                complete = delimiter + complete + delimiter;
            } else if (isMultiword(s.value)) {
                complete = '`' + complete + '`';
            }
            return ({
                complete,
                suggestion: s.label,
                hint: '',
                description: '',
                iconData: s.icon_data,
            });
        });
    }

    // getUserSuggestions returns a suggestion with `@` if the user has not started typing
    getUserSuggestions = (parsed: ParsedCommand): AutocompleteSuggestion[] => {
        if (parsed.incomplete.trim().length === 0) {
            return [{
                complete: '',
                suggestion: '',
                description: parsed.field?.description || '',
                hint: parsed.field?.hint || '@username',
            }];
        }

        return [];
    }

    // getChannelSuggestions returns a suggestion with `~` if the user has not started typing
    getChannelSuggestions = (parsed: ParsedCommand): AutocompleteSuggestion[] => {
        if (parsed.incomplete.trim().length === 0) {
            return [{
                complete: '',
                suggestion: '',
                description: parsed.field?.description || '',
                hint: parsed.field?.hint || '~channelname',
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
}

function makeSuggestionError(message: string) {
    const errMsg = Utils.localizeAndFormatMessage(
        t('apps.error'),
        'Error: {error}',
        {error: message},
    );
    return [{suggestion: errMsg}];
}

function isMultiword(value: string) {
    if (value.indexOf(' ') !== -1) {
        return true;
    }

    if (value.indexOf('\t') !== -1) {
        return true;
    }

    return false;
}
