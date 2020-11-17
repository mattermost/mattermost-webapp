// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {localizeMessage} from 'utils/utils';

import Menu from 'components/widgets/menu/menu';

export default class ToggleFavoriteChannel extends React.PureComponent {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        channel: PropTypes.object.isRequired,
        isFavorite: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            favoriteChannel: PropTypes.func.isRequired,
            unfavoriteChannel: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        show: true,
    }

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
        let text;
        if (this.props.isFavorite) {
            text = localizeMessage('channelHeader.removeFromFavorites', 'Remove from Favorites');
        } else {
            text = localizeMessage('channelHeader.addToFavorites', 'Add to Favorites');
        }
        return (
            <Menu.ItemAction
                show={this.props.show}
                onClick={this.handleClick}
                text={text}
            />
        );
    }
}
