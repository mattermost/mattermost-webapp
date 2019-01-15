// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

export default class ToggleFavoriteChannel extends React.PureComponent {
    static propTypes = {

        /**
         * Object with info about channel
         */
        channel: PropTypes.object.isRequired,

        /**
        * Bool whether current channel is favorite
        */
        isFavorite: PropTypes.bool.isRequired,

        /**
        * Object with action creators
        */
        actions: PropTypes.shape({

            /**
            * Action creator to add current channel to favorites
            */
            favoriteChannel: PropTypes.func.isRequired,

            /**
            * Action creator to remove current channel from favorites
            */
            unfavoriteChannel: PropTypes.func.isRequired,
        }).isRequired,
    };

    toggleFavoriteChannel = (channelId) => {
        const {
            isFavorite,
            actions: {
                favoriteChannel,
                unfavoriteChannel,
            },
        } = this.props;

        return isFavorite ? unfavoriteChannel(channelId) : favoriteChannel(channelId);
    }

    handleClick = (e) => {
        e.preventDefault();
        this.toggleFavoriteChannel(this.props.channel.id);
    }

    render() {
        return (
            <li role='presentation'>
                <button
                    role='menuitem'
                    className='style--none'
                    onClick={this.handleClick}
                >
                    {this.props.isFavorite ? (
                        <FormattedMessage
                            id='channelHeader.removeFromFavorites'
                            defaultMessage='Remove from Favorites'
                        />
                    ) : (
                        <FormattedMessage
                            id='channelHeader.addToFavorites'
                            defaultMessage='Add to Favorites'
                        />
                    )}
                </button>
            </li>
        );
    }
}
