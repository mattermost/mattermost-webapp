// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';

import Provider, {ResultCallbackParams} from './provider';
import Suggestion, {SuggestionProps} from './suggestion';

class ChannelSuggestion extends Suggestion<SuggestionProps> {
    render() {
        const isSelection = this.props.isSelection;
        const item = this.props.item;

        const channelName = item.display_name;
        const purpose = item.purpose;

        const icon = (
            <span className='suggestion-list__icon suggestion-list__icon--large'>
                <i className='icon icon--standard icon--no-spacing icon-globe'/>
            </span>
        );
        let className = 'suggestion-list__item';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        const description = '(~' + item.name + ')';

        return (
            <div
                className={className}
                onClick={this.handleClick}
                onMouseMove={this.handleMouseMove}
                {...Suggestion.baseProps}
            >
                {icon}
                <div className='suggestion-list__ellipsis'>
                    <span className='suggestion-list__main'>
                        {channelName}
                    </span>
                    <span className='ml-2'>
                        {' '}
                        {description}
                    </span>
                    <span className='ml-2'>
                        {' '}
                        {purpose}
                    </span>
                </div>
            </div>
        );
    }
}

type CallbackParams = Omit<ResultCallbackParams, 'items'> & {items: Channel[]};

export default class ChannelProvider extends Provider {
    autocompleteChannels: (term: string, success: (channels: Channel[]) => void, error: () => void) => (dispatch: any, getState: any) => Promise<void>;

    constructor(channelSearchFunc: (term: string, success: (channels: Channel[]) => void, error: () => void) => (dispatch: any, getState: any) => Promise<void>) {
        super();

        this.autocompleteChannels = channelSearchFunc;
    }

    handlePretextChanged(pretext: string, resultsCallback: (params: CallbackParams) => void): boolean {
        const normalizedPretext = pretext.toLowerCase();
        this.startNewRequest(normalizedPretext);

        this.autocompleteChannels(
            normalizedPretext,
            (channels: Channel[]) => {
                if (this.shouldCancelDispatch(normalizedPretext)) {
                    return;
                }

                resultsCallback({
                    matchedPretext: normalizedPretext,
                    terms: channels.map((channel) => channel.display_name),
                    items: channels,
                    component: ChannelSuggestion,
                });
            },
            () => {},
        );

        return true;
    }
}
