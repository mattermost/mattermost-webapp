// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {localizeMessage} from 'utils/utils';

import Menu from 'components/widgets/menu/menu';

import {Channel} from '@mattermost/types/channels';

type Action = {
    favoriteChannel: (channelId: string) => void;
    unfavoriteChannel: (channelId: string) => void;
};

type Props = {
    id?: string;
    show: boolean;
    channel: Channel;
    isFavorite: boolean;
    actions: Action;
};

export default class ToggleFavoriteChannel extends React.PureComponent<Props> {
    static defaultProps = {
        show: true,
    }

    toggleFavoriteChannel = (channelId: string) => {
        const {
            isFavorite,
            actions: {
                favoriteChannel,
                unfavoriteChannel,
            },
        } = this.props;

        return isFavorite ? unfavoriteChannel(channelId) : favoriteChannel(channelId);
    };

    handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
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
                id={this.props.id}
                show={this.props.show}
                onClick={this.handleClick}
                text={text}
            />
        );
    }
}
