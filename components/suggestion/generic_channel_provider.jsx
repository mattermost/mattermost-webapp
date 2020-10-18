// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class ChannelSuggestion extends Suggestion {
    render() {
        const isSelection = this.props.isSelection;
        const item = this.props.item;

        const channelName = item.display_name;
        const purpose = item.purpose;

        let className = 'mentions__name no-flex';
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
                <div className='mention__align'>
                    <span>
                        {channelName}
                    </span>
                    <span className='mention__channelname'>
                        {' '}
                        {description}
                    </span>
                </div>
                <div className='mention__purpose'>
                    {purpose}
                </div>
            </div>
        );
    }
}

export default class ChannelProvider extends Provider {
    constructor(channelSearchFunc) {
        super();

        this.autocompleteChannels = channelSearchFunc;
    }

    handlePretextChanged(pretext, resultsCallback) {
        const normalizedPretext = pretext.toLowerCase();
        this.startNewRequest(normalizedPretext);

        this.autocompleteChannels(
            normalizedPretext,
            (data) => {
                if (this.shouldCancelDispatch(normalizedPretext)) {
                    return;
                }

                const channels = Object.assign([], data);

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
