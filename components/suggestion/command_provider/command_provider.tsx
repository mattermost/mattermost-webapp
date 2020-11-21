// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Client4} from 'mattermost-redux/client';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getChannel, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {AutocompleteSuggestion, AutocompleteSuggestionWithComplete} from 'mattermost-redux/types/apps';
import {ServerAutocompleteSuggestion} from 'mattermost-redux/types/integrations';
import {Post} from 'mattermost-redux/types/posts';

import globalStore from 'stores/redux_store.jsx';

import {getSelectedPost} from 'selectors/rhs';

import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';

import {Constants} from 'utils/constants';
const EXECUTE_CURRENT_COMMAND_ITEM_ID = Constants.Integrations.EXECUTE_CURRENT_COMMAND_ITEM_ID;

import Suggestion from '../suggestion.jsx';
import Provider from '../provider.jsx';

import {AppCommandParser, Store} from './app_command_parser';

export class CommandSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'slash-command';
        if (isSelection) {
            className += ' suggestion--selected';
        }
        let symbolSpan = <span>{'/'}</span>;
        if (item.iconData === EXECUTE_CURRENT_COMMAND_ITEM_ID) {
            symbolSpan = <span className='block mt-1'>{'↵'}</span>;
        }
        let icon = <div className='slash-command__icon'>{symbolSpan}</div>;
        if (item.iconData && item.iconData !== EXECUTE_CURRENT_COMMAND_ITEM_ID) {
            icon = (
                <div
                    className='slash-command__icon'
                    style={{backgroundColor: 'transparent'}}
                >
                    <img src={item.iconData}/>
                </div>);
        }

        return (
            <div
                className={className}
                onClick={this.handleClick}
                onMouseMove={this.handleMouseMove}
                {...Suggestion.baseProps}
            >
                {icon}
                <div className='slash-command__info'>
                    <div className='slash-command__title'>
                        {item.suggestion.substring(1) + ' ' + item.hint}
                    </div>
                    <div className='slash-command__desc'>
                        {item.description}
                    </div>
                </div>
            </div>
        );
    }
}

type Props = {
    isInRHS: boolean;
}

export type Results = {
    matchedPretext: string;
    terms: string[];
    items: AutocompleteSuggestion[];
    component: React.ElementType;
}

type ResultsCallback = (results: Results) => void;

export default class CommandProvider extends Provider {
    private isInRHS: boolean;

    private parser: AppCommandParser;
    store: Store;

    constructor(props: Props, store?: Store) {
        super();

        this.store = globalStore;
        if (store && store.getState && store.dispatch) {
            this.store = store;
        }

        this.isInRHS = props.isInRHS;
        let rootId;
        if (this.isInRHS) {
            const selectedPost = getSelectedPost(this.store.getState()) as Post;
            if (selectedPost) {
                rootId = selectedPost.root_id ? selectedPost.root_id : selectedPost.id;
            }
        }

        this.parser = new AppCommandParser(this.store, rootId);
    }

    handlePretextChanged(pretext: string, resultCallback: ResultsCallback) {
        if (!pretext.startsWith('/')) {
            return false;
        }

        console.log('handlePretextChanged');

        const command = pretext.toLowerCase();
        if (this.parser.isAppCommand(command)) {
            this.parser.getAppCommandSuggestions(command).then((matches) => {
                const terms = matches.map((suggestion) => suggestion.complete);
                resultCallback({
                    matchedPretext: command,
                    terms,
                    items: matches,
                    component: CommandSuggestion,
                });
            });
            return true;
        }

        if (UserAgent.isMobile()) {
            this.handleMobile(pretext, resultCallback);
        } else {
            this.handleWebapp(pretext, resultCallback);
        }
        return true;
    }

    handleCompleteWord(term: string, pretext: string, callback: (s: string)=>void) {
        console.log('handleCompleteWord');
        callback(term + ' ');
    }

    handleMobile(pretext: string, resultCallback: ResultsCallback) {
        const command = pretext.toLowerCase();
        Client4.getCommandsList(getCurrentTeamId(this.store.getState())).then(
            (data) => {
                let matches: AutocompleteSuggestion[] = [];
                const appCommandSuggestions = this.parser.getAppSuggestionsForBindings(pretext);
                matches = matches.concat(appCommandSuggestions);

                data.forEach((cmd) => {
                    if (!cmd.auto_complete) {
                        return;
                    }

                    if (cmd.trigger !== 'shortcuts') {
                        if (('/' + cmd.trigger).indexOf(command) === 0) {
                            const s = '/' + cmd.trigger;
                            let hint = '';
                            if (cmd.auto_complete_hint && cmd.auto_complete_hint.length !== 0) {
                                hint = cmd.auto_complete_hint;
                            }
                            matches.push({
                                suggestion: s,
                                hint,
                                description: cmd.auto_complete_desc,
                            });
                        }
                    }
                });

                matches = matches.sort((a, b) => a.suggestion.localeCompare(b.suggestion));

                // pull out the suggested commands from the returned data
                const terms = matches.map((suggestion) => suggestion.suggestion);

                resultCallback({
                    matchedPretext: command,
                    terms,
                    items: matches,
                    component: CommandSuggestion,
                });
            },
        ).catch(
            () => {}, //eslint-disable-line no-empty-function
        );
    }

    handleWebapp(pretext: string, resultCallback: ResultsCallback) {
        const command = pretext.toLowerCase();
        const teamId = getCurrentTeamId(this.store.getState());
        const selectedPost = getSelectedPost(this.store.getState());
        let rootId;
        if (this.isInRHS && selectedPost) {
            rootId = selectedPost.root_id ? selectedPost.root_id : selectedPost.id;
        }
        const channel = this.isInRHS && selectedPost.channel_id ? getChannel(this.store.getState(), selectedPost.channel_id) : getCurrentChannel(this.store.getState());

        const args = {
            channel_id: channel?.id,
            ...(rootId && {root_id: rootId, parent_id: rootId}),
        };

        Client4.getCommandAutocompleteSuggestionsList(command, teamId, args).then(
            (data => {
                let matches: AutocompleteSuggestionWithComplete[] = [];

                let cmd = 'Ctrl';
                if (Utils.isMac()) {
                    cmd = '⌘';
                }

                const appCommandSuggestions = this.parser.getAppSuggestionsForBindings(pretext);
                matches = matches.concat(appCommandSuggestions);

                data.forEach((s) => {
                    if (!this.contains(matches, '/' + s.Complete)) {
                        matches.push({
                            complete: '/' + s.Complete,
                            suggestion: '/' + s.Suggestion,
                            hint: s.Hint,
                            description: s.Description,
                            iconData: s.IconData,
                        });
                    }
                });

                matches.sort((a, b) => {
                    if (a.suggestion.toLowerCase() > b.suggestion.toLowerCase()) {
                        return 1;
                    } else if (a.suggestion.toLowerCase() < b.suggestion.toLowerCase()) {
                        return -1;
                    }
                    return 0;
                });

                if (this.shouldAddExecuteItem(data, pretext)) {
                    matches.unshift({
                        complete: pretext + EXECUTE_CURRENT_COMMAND_ITEM_ID,
                        suggestion: '/Execute Current Command',
                        hint: '',
                        description: 'Select this option or use ' + cmd + '+Enter to execute the current command.',
                        iconData: EXECUTE_CURRENT_COMMAND_ITEM_ID,
                    });
                }

                // pull out the suggested commands from the returned data
                const terms = matches.map((suggestion) => suggestion.complete);

                resultCallback({
                    matchedPretext: command,
                    terms,
                    items: matches,
                    component: CommandSuggestion,
                });
            })
        );
    }

    shouldAddExecuteItem(data: ServerAutocompleteSuggestion[], pretext: string) {
        if (data.length === 0) {
            return false;
        }
        if (pretext[pretext.length - 1] === ' ') {
            return true;
        }

        // If suggestion is empty it means that user can input any text so we allow them to execute.
        return data.findIndex((item) => item.Suggestion === '') !== -1;
    }

    contains(matches: AutocompleteSuggestionWithComplete[], complete: string) {
        return matches.findIndex((match) => match.complete === complete) !== -1;
    }
}
