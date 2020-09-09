// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Client4} from 'mattermost-redux/client';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getChannel, getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';

import store from 'stores/redux_store.jsx';

import * as UserAgent from 'utils/user_agent';
import * as Utils from 'utils/utils.jsx';
import {getSelectedPost} from 'selectors/rhs';

import Suggestion from './suggestion.jsx';
import Provider from './provider.jsx';

export const EXECUTE_CURRENT_COMMAND_ITEM_ID = '_execute_current_command';

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
        if (item.iconData !== '' && item.iconData !== EXECUTE_CURRENT_COMMAND_ITEM_ID) {
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

export default class CommandProvider extends Provider {
    constructor({isInRHS}) {
        super();

        this.isInRHS = isInRHS;
    }

    handlePretextChanged(pretext, resultCallback) {
        if (!pretext.startsWith('/')) {
            return false;
        }
        if (UserAgent.isMobile()) {
            return this.handleMobile(pretext, resultCallback);
        }
        return this.handleWebapp(pretext, resultCallback);
    }

    handleCompleteWord(term, pretext, callback) {
        callback(term + ' ');
    }

    handleMobile(pretext, resultCallback) {
        const command = pretext.toLowerCase();
        Client4.getCommandsList(getCurrentTeamId(store.getState())).then(
            (data) => {
                let matches = [];
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

        return true;
    }

    handleWebapp(pretext, resultCallback) {
        const command = pretext.toLowerCase();
        const teamId = getCurrentTeamId(store.getState());
        const selectedPost = getSelectedPost(store.getState());
        let rootId;
        if (this.isInRHS) {
            rootId = selectedPost.root_id ? selectedPost.root_id : selectedPost.id;
        }
        const channel = this.isInRHS && selectedPost.channel_id ? getChannel(store.getState(), selectedPost.channel_id) : getCurrentChannel(store.getState());

        const args = {
            channel_id: channel?.id,
            ...(rootId && {root_id: rootId, parent_id: rootId}),
        };

        Client4.getCommandAutocompleteSuggestionsList(command, teamId, args).then(
            (data) => {
                const matches = [];
                let cmd = 'Ctrl';
                if (Utils.isMac()) {
                    cmd = '⌘';
                }
                if (this.shouldAddExecuteItem(data, pretext)) {
                    matches.push({
                        complete: pretext + EXECUTE_CURRENT_COMMAND_ITEM_ID,
                        suggestion: '/Execute Current Command',
                        hint: '',
                        description: 'Select this option or use ' + cmd + '+Enter to execute the current command.',
                        iconData: EXECUTE_CURRENT_COMMAND_ITEM_ID,
                    });
                }
                data.forEach((sug) => {
                    if (!this.contains(matches, '/' + sug.Complete)) {
                        matches.push({
                            complete: '/' + sug.Complete,
                            suggestion: '/' + sug.Suggestion,
                            hint: sug.Hint,
                            description: sug.Description,
                            iconData: sug.IconData,
                        });
                    }
                });

                // pull out the suggested commands from the returned data
                const terms = matches.map((suggestion) => suggestion.complete);

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

        return true;
    }

    shouldAddExecuteItem(data, pretext) {
        if (data.length === 0) {
            return false;
        }
        if (pretext[pretext.length - 1] === ' ') {
            return true;
        }

        // If suggestion is empty it means that user can input any text so we allow them to execute.
        return data.findIndex((item) => item.Suggestion === '') !== -1;
    }

    contains(matches, complete) {
        return matches.findIndex((match) => match.complete === complete) !== -1;
    }
}
