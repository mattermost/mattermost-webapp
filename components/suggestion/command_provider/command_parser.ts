import {getPluginsLocations} from 'mattermost-redux/selectors/entities/plugins';
import {default as PluginLocationConst} from 'mattermost-redux/constants/plugins';
import {GlobalState} from 'mattermost-redux/types/store';
import {PluginLocation} from 'mattermost-redux/types/plugins';
import {Call, CallExpandLevel, doPluginCall} from 'actions/plugins';

export enum ElementType {
	ElementTypeCommand       = 'command',
	ElementTypeText          = 'text',
	ElementTypeStaticSelect  = 'static_select',
	ElementTypeDynamicSelect = 'dynamic_select',
	// ElementTypeTime          = 'time',
	ElementTypeBool    = 'bool',
	ElementTypeUser    = 'user',
	ElementTypeChannel = 'channel',
}

export type FormElement = ElementProps & {

};

export type ElementProps = {
    type: ElementType;
    name: string;
	description: string;
    is_required?: boolean;
    reset_on_change_to?: string[];
};

export type Form = {
    refresh_on_change_to: string[];
    refresh_url: string;
    elements: FormElement[];
};

export type SelectOption = {
	label: string;
	value: string;
};

export type StaticSelectElementProps = {
	options: SelectOption[];
};

export type DynamicSelectElementProps = {
	refresh_url: string;
};

export type TextElementProps = {
	subtype: string;
	min_length: number;
	max_length: number;
	// options - encoding, regexp, etc.
}

export type AutocompleteElementProps = {
	flag_name: string;

	hint: string;

	role_id: string;
	positional: boolean;
};

export type AutocompleteProps = ElementProps & AutocompleteElementProps;

export type AutocompleteText = AutocompleteProps & TextElementProps;

export type AutocompleteStaticSelect = AutocompleteProps & StaticSelectElementProps;

export type AutocompleteDynamicSelect = AutocompleteProps & DynamicSelectElementProps;

export type AutocompleteBool = AutocompleteProps;
export type AutocompleteUser = AutocompleteProps;
export type AutocompleteChannel = AutocompleteProps;

export type AutocompleteElement = AutocompleteText | AutocompleteStaticSelect | AutocompleteDynamicSelect | AutocompleteBool | AutocompleteUser | AutocompleteChannel;

export type SubCommand = {
    app_id: string;
    form_url?: string;
    pretext: string;
    fullPretext?: string;
    description?: string;
    args?: AutocompleteElement[];
    sub_commands?: SubCommand[];
}

export type SuggestionChoice = {
    suggestion: string;
    complete?: string;
    getComplete?: (pretext: string, value: string) => string;
    description?: string;
    hint?: string;
    iconData?: string;
}
    // {
    //     complete: '/' + sug.Complete,
    //     suggestion: '/' + sug.Suggestion,
    //     hint: sug.Hint,
    //     description: sug.Description,
    //     iconData: sug.IconData,
    // }

export const decorateSuggestionChoiceComplete = (pretext: string, choice: SuggestionChoice): SuggestionChoice => {
    const words = pretext.split(' ');
    words.pop();
    const before = words.join(' ') + ' ';

    let complete = choice.complete;
    if (choice.getComplete) {
        complete = choice.getComplete(pretext, choice.suggestion);
    }

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

export const shouldHandleCommand = (pretext: string, locations: PluginLocation[]): boolean => {
    const base = extractBaseCommand(pretext);

    return Boolean(locations.find((loc) => loc.trigger === base));
}

let ARGS = {};
let COMMANDS: SubCommand[] = [];
export const setCommands = ((cmds: SubCommand[]) => COMMANDS = cmds);

export const fetchCloudAppCommand = async (location: PluginLocation): Promise<SubCommand> => {
    const payload: Call = {
        form_url: location.form_url,
        context: {
            app_id: location.app_id,
            ...ARGS,
        },
        from: [location],
    };

    const res = await doPluginCall(payload) as {data: SubCommand};

    COMMANDS.push(res.data);
    return res.data
}

export const getCloudAppCommandLocations = (state: GlobalState): PluginLocation[] => {
    return getPluginsLocations(state, PluginLocationConst.PLUGIN_LOCATION_SLASH_COMMAND);
}

export const getCloudAppCommand = (name: string): SubCommand | null => {
    return COMMANDS.find((c) => c.app_id === name) || null;
}

export const getCloudAppCommands = (): SubCommand[] => {
    return COMMANDS;
}

export const handleCommand = async (pretext: string, locations: PluginLocation[], args: {channel_id: string; root_id?: string;}): Promise<SuggestionChoice[]> => {
    ARGS = args;

    const base = extractBaseCommand(pretext);
    let cmd = getCloudAppCommand(base);
    if (!cmd) {
        const loc = locations.find((loc) => loc.trigger === base);
        if (!loc) {
            return [];
        }
        cmd = await fetchCloudAppCommand(loc);
    }

    const res = await getCurrentlyEditingToken(pretext, [cmd]);
    return res.map((sug) => decorateSuggestionChoiceComplete(pretext, sug));
}

export const getSynchronousResults = (pretext: string, definitions: PluginLocation[]): SuggestionChoice[] => {
    const result: SuggestionChoice[] = [];
    for (const cmd of definitions) {
        let trigger = cmd.trigger;
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

export const getCurrentlyEditingToken = async (pretext: string, definitions: SubCommand[]): Promise<SuggestionChoice[]> => {
    if (!pretext.length) {
        return [];
    }

    let cmd = getMatchedCommand(pretext, definitions);

    if (!cmd) {
        return [];
    }

    let suggestions: SuggestionChoice[] = [];
    if (cmd.sub_commands && cmd.sub_commands.length) {
        const subSuggestions = getSuggestionsForSubCommands(pretext, cmd);
        suggestions = suggestions.concat(subSuggestions);
    }

    if (cmd.args && cmd.args.length) {
        const argSuggestions = await getSuggestionsForArguments(pretext, cmd);
        suggestions = suggestions.concat(argSuggestions);
    }

    return suggestions;
};

const getSuggestionsForArguments = async (pretext: string, cmd: SubCommand): Promise<SuggestionChoice[]> => {
    if (!cmd.args) {
        return [];
    }

    const positionalDefinitions = cmd.args.filter((d) => d.positional);

    let tokens = getTokens(pretext);

    tokens = tokens.slice(cmd.fullPretext?.split(' ').length);
    const lastToken = tokens.pop();

    const position = tokens.length;

    const field = positionalDefinitions[position];
    if (field) {
        return getSuggestionsForField(field, lastToken.value, pretext);
    }

    const previousToken = tokens[position-1];
    if (previousToken && previousToken.type === 'flag') {
        const field = cmd.args.find((arg) => arg.flag_name === previousToken.name);
        if (field) {
            return getSuggestionsForField(field, lastToken.value, pretext);
        }
        return [];
    }

    // '', '-', or '--' (show named args)
    if ('--'.startsWith(lastToken.value.trim())) {
        const available = cmd.args.filter((arg) => {
            if (arg.positional) {
                return false;
            }
            if (tokens.find((t) => t.type === 'flag' && t.name === arg.flag_name)) {
                return false;
            }
            if (arg.flag_name.startsWith(lastToken.name)) {
                return true;
            }

            return false;
        });
        return getSuggestionsFromFlags(available);
    }

    return [{suggestion: 'whoops'}];
};

export const getSuggestionsForField = async (field: AutocompleteElement, userInput: string, pretext: string): Promise<SuggestionChoice[]> => {
    switch (field.type) {
        case ElementType.ElementTypeBool:
            return getBooleanSuggestions(userInput);
        case ElementType.ElementTypeDynamicSelect:
            return getDynamicSelectSuggestions(field as AutocompleteDynamicSelect, userInput, pretext)
        case ElementType.ElementTypeStaticSelect:
            return getStaticSelectSuggestions(field as AutocompleteStaticSelect, userInput)
    }

    return [{
        complete: userInput,
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
        hint: opt.label,
        description: '',
    }));
}

export const getDynamicSelectSuggestions = async (field: AutocompleteDynamicSelect, userInput: string, cmdStr: string): Promise<SuggestionChoice[]> => {
    const values = getForm(cmdStr, COMMANDS);

    const cmd = getMatchedCommand(cmdStr, COMMANDS);

    const payload: Call = {
        form_url: field.refresh_url,
        context: {
            app_id: cmd.app_id,
            ...ARGS,
        },
        from: [],
        values: {
            data: values,
            // data: form,
            raw: cmdStr,
        },
    };

    const res = await doPluginCall(payload);
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
        complete: '--' + flag.flag_name,
        suggestion: '--' + flag.flag_name,
        description: flag.description,
        hint: flag.hint,
    }));
};

export const getSuggestionsForSubCommands = (cmdStr: string, cmd: SubCommand): SuggestionChoice[] => {
    if (!cmd.sub_commands || !cmd.sub_commands.length) {
        return [];
    }

    const result: SuggestionChoice[] = [];

    cmdStr = cmdStr.substring((cmd.fullPretext + ' ').length).toLowerCase();
    for (const sub of cmd.sub_commands) {
        if (sub.pretext.toLowerCase().startsWith(cmdStr)) {
            result.push({
                complete: sub.pretext,
                suggestion: sub.pretext,
                description: sub.description,
                hint: sub.pretext,
            });
        }
    }

    return result;
}

export const getMatchedCommand = (cmdStr: string, definitions: SubCommand[]) => {
    const endsInSpace = cmdStr[cmdStr.length-1] === ' ';
    cmdStr = cmdStr.split(' ').map((t) => t.trim()).filter(Boolean).join(' ');
    if (endsInSpace) {
        cmdStr += ' ';
    }

    const flattened = flattenCommandList(definitions, '');
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

export const flattenCommandList = (definitions: SubCommand[], trigger=''): SubCommand[] => {
    let result: SubCommand[] = [];
    for (const cmd of definitions) {
        const newPretext = trigger + cmd.pretext;
        result.push({
            ...cmd,
            fullPretext: newPretext,
        });
        if (cmd.sub_commands && cmd.sub_commands.length) {
            const cmds = flattenCommandList(cmd.sub_commands, newPretext + ' ');
            result = result.concat(cmds);
        }
    }

    return result;
}

export const getSubmissionPayload = (cmdStr: string, definitions: SubCommand[], args: {channel_id: string; root_id?: string;}): Call => {
    const values = getForm(cmdStr, definitions);

    const cmd = getMatchedCommand(cmdStr, definitions);

    const payload: Call = {
        form_url: cmd.form_url,
        context: {
            app_id: cmd.app_id,
            ...args,
        },
        from: [],
        values: {
            data: values,
            raw: cmdStr,
        },
        expand: {
            acting_user: CallExpandLevel.ExpandSummary,
        },
    };
    return payload;
};

export const getForm = (cmdStr: string, definitions: SubCommand[]): {[name: string]: AutocompleteElement} => {
    const cmd = getMatchedCommand(cmdStr, definitions);
    if (!cmd) {
        return {error: 'no command'};
    }

    if (!cmd.args || !cmd.args.length) {
        return {};
    }

    cmdStr = cmdStr.substring(cmd.fullPretext.length).trim();

    const tokens = getTokens(cmdStr);
    const positionalDefinitions = cmd.args.filter((d) => d.positional);

    const resolvedTokens = resolveNamedArguments(tokens);

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

        const arg = cmd.args.find((arg) => arg.flag_name === name || arg.name === name);
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

export const resolveNamedArguments = (tokens) => {
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

export const getTokens = (cmdString) => {
    const tokens = [];
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

const makeNamedFlagToken = (name, value) => {
    return {
        type: 'flag',
        name,
        value,
    };
}

const makeNamedArgumentToken = (name, value) => {
    return {
        type: 'named',
        name,
        value,
    };
}

const makePositionalArgumentToken = (name, value) => {
    return {
        type: 'positional',
        name,
        value,
    };
}
