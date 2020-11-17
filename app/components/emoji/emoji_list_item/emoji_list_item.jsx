// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import Permissions from 'mattermost-redux/constants/permissions';
import {Client4} from 'mattermost-redux/client';

import DeleteEmoji from 'components/emoji/delete_emoji_modal';
import AnyTeamPermissionGate from 'components/permissions_gates/any_team_permission_gate';

export default class EmojiListItem extends React.PureComponent {
    static propTypes = {
        emoji: PropTypes.object.isRequired,
        currentUserId: PropTypes.string.isRequired,
        creatorDisplayName: PropTypes.string.isRequired,
        creatorUsername: PropTypes.string,
        currentTeam: PropTypes.object,
        onDelete: PropTypes.func,
        actions: PropTypes.shape({
            deleteCustomEmoji: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        emoji: {},
        currentUserId: '',
        currentTeam: {},
        creatorDisplayName: '',
    }

    handleDelete = () => {
        if (this.props.onDelete) {
            this.props.onDelete(this.props.emoji.id);
        }

        this.props.actions.deleteCustomEmoji(this.props.emoji.id);
    }

    render() {
        const emoji = this.props.emoji;
        const creatorUsername = this.props.creatorUsername;
        let creatorDisplayName = this.props.creatorDisplayName;

        if (creatorUsername && creatorUsername !== creatorDisplayName) {
            creatorDisplayName += ' (@' + creatorUsername + ')';
        }

        let deleteButton = null;
        if (emoji.creator_id === this.props.currentUserId) {
            deleteButton = (
                <AnyTeamPermissionGate permissions={[Permissions.DELETE_EMOJIS]}>
                    <DeleteEmoji onDelete={this.handleDelete}/>
                </AnyTeamPermissionGate>
            );
        } else {
            deleteButton = (
                <AnyTeamPermissionGate permissions={[Permissions.DELETE_EMOJIS]}>
                    <AnyTeamPermissionGate permissions={[Permissions.DELETE_OTHERS_EMOJIS]}>
                        <DeleteEmoji onDelete={this.handleDelete}/>
                    </AnyTeamPermissionGate>
                </AnyTeamPermissionGate>
            );
        }

        return (
            <tr className='backstage-list__item'>
                <td className='emoji-list__name'>
                    {':' + emoji.name + ':'}
                </td>
                <td className='emoji-list__image'>
                    <span
                        className='emoticon'
                        style={{backgroundImage: 'url(' + Client4.getCustomEmojiImageUrl(emoji.id) + ')'}}
                    />
                </td>
                <td className='emoji-list__creator'>
                    {creatorDisplayName}
                </td>
                <td className='emoji-list-item_actions'>
                    {deleteButton}
                </td>
            </tr>
        );
    }
}
