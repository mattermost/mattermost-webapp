// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import Constants from 'utils/constants';
import SelectIcon from 'components/widgets/icons/fa_select_icon';
import BotBadge from 'components/widgets/badges/bot_badge';

import Suggestion from '../suggestion.jsx';

function itemToName(item) {
    if (item.type === Constants.DM_CHANNEL) {
        return '@' + item.display_name;
    }
    if (item.type === Constants.GM_CHANNEL) {
        return '@' + item.display_name.replace(/ /g, '');
    }
    if (item.type === Constants.OPEN_CHANNEL || item.type === Constants.PRIVATE_CHANNEL) {
        return item.display_name + ' (~' + item.name + ')';
    }
    return item.name;
}

export default class SearchChannelSuggestion extends Suggestion {
    render() {
        const {item, isSelection, teammate} = this.props;

        let className = 'search-autocomplete__item';
        if (isSelection) {
            className += ' selected a11y--focused';
        }

        const name = itemToName(item);

        let tag = null;
        if (item.type === Constants.DM_CHANNEL) {
            tag = (
                <BotBadge
                    show={Boolean(teammate && teammate.is_bot)}
                    className='badge-popoverlist'
                />
            );
        }

        return (
            <div
                onClick={this.handleClick}
                onMouseMove={this.handleMouseMove}
                className={className}
                ref={(node) => {
                    this.node = node;
                }}
                {...Suggestion.baseProps}
            >
                <SelectIcon/>
                <span
                    data-testid='listItem'
                    className='search-autocomplete__name'
                >
                    {name}
                </span>
                {tag}
            </div>
        );
    }
}