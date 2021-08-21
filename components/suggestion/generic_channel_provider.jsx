// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Provider from './provider.tsx';
import Suggestion from './suggestion.tsx';

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
