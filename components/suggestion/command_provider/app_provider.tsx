// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Store} from 'redux';

import globalStore from 'stores/redux_store';

import Provider from '../provider';
import {GlobalState} from 'types/store';

import {appsEnabled} from 'mattermost-redux/selectors/entities/apps';

import AtMentionSuggestion from '../at_mention_provider/at_mention_suggestion';

import {ChannelMentionSuggestion} from '../channel_mention_provider';

import {AppCommandParser} from './app_command_parser/app_command_parser';

import {AutocompleteSuggestion, Channel, COMMAND_SUGGESTION_CHANNEL, COMMAND_SUGGESTION_USER, intlShim, UserProfile} from './app_command_parser/app_command_parser_dependencies';
import {CommandSuggestion} from './command_provider';

type Props = {
    teamId: string;
    channelId: string;
    rootId?: string;
};

export type Results = {
    matchedPretext: string;
    terms: string[];
    items: Array<AutocompleteSuggestion | UserProfile | {channel: Channel}>;
    component?: React.ElementType;
    components?: React.ElementType[];
}

type ResultsCallback = (results: Results) => void;

export default class AppCommandProvider extends Provider {
    private store: Store<GlobalState>;
    private triggerCharacter: string;
    private appCommandParser: AppCommandParser;

    constructor(props: Props) {
        super();

        this.store = globalStore;
        this.appCommandParser = new AppCommandParser(this.store as any, intlShim, props.channelId, props.teamId, props.rootId);
        this.triggerCharacter = '/';
    }

    setProps(props: Props) {
        this.appCommandParser.setChannelContext(props.channelId, props.teamId, props.rootId);
    }

    handlePretextChanged(pretext: string, resultCallback: ResultsCallback) {
        if (!pretext.startsWith(this.triggerCharacter)) {
            return false;
        }

        if (!appsEnabled(this.store.getState())) {
            return false;
        }

        if (!this.appCommandParser.isAppCommand(pretext)) {
            return false;
        }

        this.appCommandParser.getSuggestions(pretext).then((suggestions) => {
            const element: React.ElementType[] = [];
            const matches = suggestions.map((suggestion) => {
                switch (suggestion.type) {
                case COMMAND_SUGGESTION_USER:
                    element.push(AtMentionSuggestion);
                    return suggestion.item! as UserProfile;
                case COMMAND_SUGGESTION_CHANNEL:
                    element.push(ChannelMentionSuggestion);
                    return {channel: suggestion.item! as Channel};
                default:
                    element.push(CommandSuggestion);
                    return {
                        ...suggestion,
                        Complete: '/' + suggestion.Complete,
                        Suggestion: '/' + suggestion.Suggestion,
                    };
                }
            });

            const terms = suggestions.map((suggestion) => '/' + suggestion.Complete);
            resultCallback({
                matchedPretext: pretext,
                terms,
                items: matches,
                components: element,
            });
        });
        return true;
    }
}
