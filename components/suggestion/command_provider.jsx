// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {getSuggestedCommands} from 'actions/integration_actions.jsx';

import Suggestion from './suggestion.jsx';

class CommandSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'command';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        return (
            <div
                className={className}
                onClick={this.handleClick}
                {...Suggestion.baseProps}
            >
                <div className='command__title'>
                    <span>{item.suggestion} {item.hint}</span>
                </div>
                <div className='command__desc'>
                    <span>{item.description}</span>
                </div>
            </div>
        );
    }
}

export default class CommandProvider {
    handlePretextChanged(suggestionId, pretext) {
        if (pretext.startsWith('/')) {
            getSuggestedCommands(pretext.toLowerCase(), suggestionId, CommandSuggestion, pretext.toLowerCase());

            return true;
        }
        return false;
    }
}
