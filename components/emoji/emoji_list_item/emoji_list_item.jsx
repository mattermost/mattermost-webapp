// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {Client4} from 'mattermost-redux/client';

import DeleteEmoji from 'components/emoji/delete_emoji_modal.jsx';

export default class EmojiListItem extends React.Component {
    static propTypes = {

        /*
         * Emoji to display.
         */
        emoji: PropTypes.object.isRequired,

        /*
         * Logged in user's ID.
         */
        currentUserId: PropTypes.string.isRequired,

        /*
         * Emoji creator name to display.
         */
        creatorDisplayName: PropTypes.string.isRequired,

        /*
         * Emoji creator username to display if different from creatorDisplayName.
         */
        creatorUsername: PropTypes.string,

        /*
         * Set if logged in user is system admin.
         */
        isSystemAdmin: PropTypes.bool,

        /*
         * Function to call when emoji is deleted.
         */
        onDelete: PropTypes.func,

        actions: PropTypes.shape({

            /**
             * Delete a custom emoji.
             */
            deleteCustomEmoji: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        emoji: {},
        currentUserId: '',
        creatorDisplayName: '',
        isSystemAdmin: false,
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
        if (this.props.isSystemAdmin || emoji.creator_id === this.props.currentUserId) {
            deleteButton = (
                <DeleteEmoji onDelete={this.handleDelete}/>
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
