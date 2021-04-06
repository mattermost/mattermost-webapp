// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Store} from 'redux';

import {Client4} from 'mattermost-redux/client';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getChannel, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {CommandAutocompleteSuggestion} from 'mattermost-redux/types/integrations';
import {Post} from 'mattermost-redux/types/posts';

import globalStore from 'stores/redux_store';

import {GlobalState} from 'types/store';

import {getSelectedPost} from 'selectors/rhs';

import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils';
import {Constants} from 'utils/constants';

import Suggestion from '../suggestion';
import Provider from '../provider';

const EXECUTE_CURRENT_COMMAND_ITEM_ID = Constants.Integrations.EXECUTE_CURRENT_COMMAND_ITEM_ID;

export type CommandSuggestionItem = {
    complete: string;
    suggestion: string;
    hint: string;
    description: string;
    iconData: string;
};

export class CommandSuggestion extends Suggestion {
    render() {
        const {isSelection} = this.props;
        const item = this.props.item as CommandSuggestionItem;

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
};

export type Results = {
    matchedPretext: string;
    terms: string[];
    items: CommandSuggestionItem[];
    component: React.ElementType;
};

type ResultsCallback = (results: Results) => void;

export default class CommandProvider extends Provider {
    private isInRHS: boolean;
    private store: Store<GlobalState>;
    private triggerCharacter: string;

    constructor(props: Props) {
        super();

        this.store = globalStore;
        this.isInRHS = props.isInRHS;
        this.triggerCharacter = '/';
    }

    handlePretextChanged(pretext: string, resultCallback: ResultsCallback) {
        if (!pretext.startsWith(this.triggerCharacter)) {
            return false;
        }

        if (UserAgent.isMobile()) {
            this.handleMobile(pretext, resultCallback);
        } else {
            this.handleWebapp(pretext, resultCallback);
        }
        return true;
    }

    handleCompleteWord(term: string, pretext: string, callback: (s: string) => void) {
        callback(term + ' ');
    }

    handleMobile(pretext: string, resultCallback: ResultsCallback) {
        const command = pretext.toLowerCase();
        Client4.getCommandsList(getCurrentTeamId(this.store.getState())).then(
            (data) => {
                let matches: CommandSuggestionItem[] = [];

                data.forEach((cmd) => {
                    if (!cmd.auto_complete) {
                        return;
                    }

                    if (cmd.trigger !== 'shortcuts') {
                        if ((this.triggerCharacter + cmd.trigger).indexOf(command) === 0) {
                            const s = this.triggerCharacter + cmd.trigger;
                            let hint = '';
                            if (cmd.auto_complete_hint && cmd.auto_complete_hint.length !== 0) {
                                hint = cmd.auto_complete_hint;
                            }
                            matches.push({
                                suggestion: s,
                                complete: '',
                                hint,
                                description: cmd.auto_complete_desc,
                                iconData: '',
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
        const selectedPost = getSelectedPost(this.store.getState()) as Post | undefined;
        let rootId;
        if (this.isInRHS && selectedPost) {
            rootId = selectedPost.root_id ? selectedPost.root_id : selectedPost.id;
        }
        const channel = this.isInRHS && selectedPost?.channel_id ? getChannel(this.store.getState(), selectedPost.channel_id) : getCurrentChannel(this.store.getState());

        const args = {
            channel_id: channel?.id,
            ...(rootId && {root_id: rootId, parent_id: rootId}),
        };

        Client4.getCommandAutocompleteSuggestionsList(command, teamId, args).then(
            ((data: CommandAutocompleteSuggestion[]) => {
                const matches: CommandSuggestionItem[] = [];

                let cmd = 'Ctrl';
                if (Utils.isMac()) {
                    cmd = '⌘';
                }

                data.forEach((s) => {
                    if (!this.contains(matches, this.triggerCharacter + s.Complete)) {
                        matches.push({
                            complete: this.triggerCharacter + s.Complete,
                            suggestion: this.triggerCharacter + s.Suggestion,
                            hint: s.Hint,
                            description: s.Description,
                            iconData: s.IconData,
                        });
                    }
                });

                // sort only if we are looking at base commands
                if (!pretext.includes(' ')) {
                    matches.sort((a, b) => {
                        if (a.suggestion.toLowerCase() > b.suggestion.toLowerCase()) {
                            return 1;
                        } else if (a.suggestion.toLowerCase() < b.suggestion.toLowerCase()) {
                            return -1;
                        }
                        return 0;
                    });
                }

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
            }),
        );
    }

    shouldAddExecuteItem(data: CommandAutocompleteSuggestion[], pretext: string) {
        if (data.length === 0) {
            return false;
        }
        if (pretext[pretext.length - 1] === ' ') {
            return true;
        }

        // If suggestion is empty it means that user can input any text so we allow them to execute.
        return data.findIndex((item) => item.Suggestion === '') !== -1;
    }

    contains(matches: CommandSuggestionItem[], complete: string) {
        return matches.findIndex((match) => match.complete === complete) !== -1;
    }
}
