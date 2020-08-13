// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';

import {imageURLForUser} from 'utils/utils.jsx';
import Constants from 'utils/constants';
import Avatar from 'components/widgets/users/avatar';
import BotBadge from 'components/widgets/badges/bot_badge';

import Suggestion from '../suggestion.jsx';

function itemToName(item, currentUser) {
    let itemMarkup = (item);

    if (item.type === Constants.DM_CHANNEL) {
        const profilePicture = (
            <Avatar
                username={item.username}
                url={imageURLForUser(getUserIdFromChannelName(currentUser, item.name), item.last_picture_update)}
                size='sm'
            />
        );

        itemMarkup = (
            <React.Fragment>
                {profilePicture}
                <span className='ml-3'>{'@'}{item.display_name}</span>
            </React.Fragment>
        );
    }

    if (item.type === Constants.GM_CHANNEL) {
        itemMarkup = (
            <React.Fragment>
                <div className='search-autocomplete__icon'>
                    <div className='status status--group'>{'G'}</div>
                </div>
                <span className='ml-3'>{'@'}{item.display_name.replace(/ /g, '')}</span>
            </React.Fragment>
        );
    }

    if (item.type === Constants.OPEN_CHANNEL) {
        itemMarkup = (
            <React.Fragment>
                <div className='search-autocomplete__icon'>
                    <i className='icon light icon--standard icon--no-spacing icon-globe'/>
                </div>
                <span className='ml-3'>{item.display_name}</span>
                <span className='ml-2 light'>{'~'}{item.name}</span>
            </React.Fragment>
        );
    }

    if (item.type === Constants.PRIVATE_CHANNEL) {
        itemMarkup = (
            <React.Fragment>
                <div className='search-autocomplete__icon'>
                    <i className='icon light icon--standard icon--no-spacing icon-lock-outline'/>
                </div>
                <span className='ml-3'>{item.display_name}</span>
                <span className='ml-2 light'>{'~'}{item.name}</span>
            </React.Fragment>
        );
    }

    return itemMarkup;
}

export default class SearchChannelSuggestion extends Suggestion {
    render() {
        const {item, isSelection, teammate, currentUser} = this.props;

        let className = 'search-autocomplete__item';
        if (isSelection) {
            className += ' selected a11y--focused';
        }

        const name = itemToName(item, currentUser);

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
