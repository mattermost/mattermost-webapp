// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import React from 'react';
import {appsEnabled} from 'mattermost-redux/selectors/entities/apps';

import {SuggestionOptions} from '@tiptap/suggestion';
import {PluginKey} from 'prosemirror-state';

import {WysiwygPluginNames} from 'utils/constants';

import {AppCommandParser} from 'components/suggestion/command_provider/app_command_parser/app_command_parser';
import {
    AutocompleteSuggestion,
    intlShim,
} from 'components/suggestion/command_provider/app_command_parser/app_command_parser_dependencies';

import store from 'stores/redux_store.jsx';

import {SuggestionItem} from '../suggestion.component';
import {render} from '../suggestion.renderer';

import {CommandItem} from './components';

export const CommandSuggestionKey = new PluginKey(WysiwygPluginNames.SLASH_COMMAND);

export type CommandSuggestionOptions = {
    teamId: string;
    channelId: string;
    rootId?: string;
}

export const makeCommandSuggestion: (options: CommandSuggestionOptions) => Omit<SuggestionOptions<SuggestionItem>, 'editor'> = ({teamId, channelId, rootId}) => {
    const appCommandParser = new AppCommandParser(store as never, intlShim, channelId, teamId, rootId);
    const state = store.getState();

    return {
        char: '/',

        startOfLine: true,

        pluginKey: CommandSuggestionKey,

        items: async ({query}: {query: string}) => {
            if (!appCommandParser) {
                return [];
            }

            const command = query.toLowerCase();
            const results: AutocompleteSuggestion[] = [];

            await Client4.getCommandsList(teamId).then(
                (data) => {
                    if (appsEnabled(state)) {
                        const appCommandSuggestions = appCommandParser.getSuggestionsBase(command);
                        results.push(...appCommandSuggestions);
                    }

                    data.forEach((cmd) => {
                        if (!cmd.auto_complete) {
                            return;
                        }

                        if (cmd.trigger === 'shortcuts') {
                            return;
                        }

                        if ((cmd.trigger).indexOf(command) === 0) {
                            results.push({
                                Suggestion: cmd.trigger,
                                Complete: '',
                                Hint: cmd.auto_complete_hint ?? '',
                                Description: cmd.auto_complete_desc,
                                IconData: '',
                            });
                        }
                    });

                    results.sort((a, b) => a.Suggestion.localeCompare(b.Suggestion));
                },
            );

            return results.map((result) => ({
                id: result.Suggestion,
                label: `${result.Suggestion} ${result.Hint}`,
                type: 'command',
                content: <CommandItem {...result}/>,
            }));
        },

        command: ({editor, range, props}) => {
            editor.commands.insertContentAt(range, `/${props.id} `);
        },

        render,
    };
};
