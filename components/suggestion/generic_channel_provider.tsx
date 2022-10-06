// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Channel} from '@mattermost/types/channels';
import {ServerError} from '@mattermost/types/errors';
import {ActionFunc} from 'mattermost-redux/types/actions';
import React from 'react';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

export type Results = {
    matchedPretext: string;
    terms: string[];
    items: Channel[];
    component: React.ElementType;
}

type ResultsCallback = (results: Results) => void;

class ChannelSuggestion extends Suggestion {
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

export default class ChannelProvider extends Provider {
    autocompleteChannels: any;
    constructor(channelSearchFunc: (term: string, success: (channels: Channel[]) => void, error: (err: ServerError) => void) => ActionFunc) {
        super();

        this.autocompleteChannels = channelSearchFunc;
    }

    handlePretextChanged(pretext: string, resultsCallback: ResultsCallback) {
        const normalizedPretext = pretext.toLowerCase();
        this.startNewRequest(normalizedPretext);

        this.autocompleteChannels(
            normalizedPretext,
            (data: Channel[]) => {
                if (this.shouldCancelDispatch(normalizedPretext)) {
                    return;
                }

                const channels: Channel[] = Object.assign([], data);

                resultsCallback({
                    matchedPretext: normalizedPretext,
                    terms: channels.map((channel) => channel.display_name),
                    items: channels,
                    component: ChannelSuggestion,
                });
            },
        );

        return true;
    }
}
