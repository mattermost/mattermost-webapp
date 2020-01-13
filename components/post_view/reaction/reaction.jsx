// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import OverlayTrigger from 'components/overlay_trigger';

import * as Utils from 'utils/utils.jsx';

export default class Reaction extends React.PureComponent {
    static propTypes = {

        /*
         * The post to render the reaction for
         */
        post: PropTypes.object.isRequired,

        /*
         * The user id of the logged in user
         */
        currentUserId: PropTypes.string.isRequired,

        /*
         * The name of the emoji for the reaction
         */
        emojiName: PropTypes.string.isRequired,

        /*
         * The number of reactions to this post for this emoji
         */
        reactionCount: PropTypes.number.isRequired,

        /*
         * Array of users who reacted to this post
         */
        profiles: PropTypes.array.isRequired,

        /*
         * The number of users not in the profile list who have reacted with this emoji
         */
        otherUsersCount: PropTypes.number.isRequired,

        /*
         * Array of reactions by user
         */
        reactions: PropTypes.arrayOf(PropTypes.object).isRequired,

        /*
         * True if the user has the permission to add a reaction in this channel
         */
        canAddReaction: PropTypes.bool.isRequired,

        /*
         * True if user has the permission to remove his own reactions in this channel
         */
        canRemoveReaction: PropTypes.bool.isRequired,

        /*
         * The URL of the emoji image
         */
        emojiImageUrl: PropTypes.string.isRequired,

        actions: PropTypes.shape({

            /*
             * Function to add a reaction to a post
             */
            addReaction: PropTypes.func.isRequired,

            /*
             * Function to get non-loaded profiles by id
             */
            getMissingProfilesByIds: PropTypes.func.isRequired,

            /*
             * Function to remove a reaction from a post
             */
            removeReaction: PropTypes.func.isRequired,
        }),
    }

    handleAddReaction = (e) => {
        e.preventDefault();
        const {actions, post, emojiName} = this.props;
        actions.addReaction(post.id, emojiName);
    }

    handleRemoveReaction = (e) => {
        e.preventDefault();
        this.props.actions.removeReaction(this.props.post.id, this.props.emojiName);
    }

    loadMissingProfiles = async () => {
        const ids = this.props.reactions.map((reaction) => reaction.user_id);
        this.props.actions.getMissingProfilesByIds(ids);
    }

    getSortedUsers = (getDisplayName) => {
        // Sort users by who reacted first with "you" being first if the current user reacted
        let currentUserReacted = false;
        const sortedReactions = this.props.reactions.sort((a, b) => a.create_at - b.create_at);
        const users = sortedReactions.reduce((accumulator, current) => {
            if (current.user_id === this.props.currentUserId) {
                currentUserReacted = true;
            } else {
                const user = this.props.profiles.find((u) => u.id === current.user_id);
                if (user) {
                    accumulator.push(getDisplayName(user));
                }
            }
            return accumulator;
        }, []);

        if (currentUserReacted) {
            users.unshift(Utils.localizeMessage('reaction.you', 'You'));
        }

        return {currentUserReacted, users};
    }

    render() {
        if (!this.props.emojiImageUrl) {
            return null;
        }

        const {currentUserReacted, users} = this.getSortedUsers(Utils.getDisplayNameByUser);

        const otherUsersCount = this.props.otherUsersCount;
        let names;
        if (otherUsersCount > 0) {
            if (users.length > 0) {
                names = (
                    <FormattedMessage
                        id='reaction.usersAndOthersReacted'
                        defaultMessage='{users} and {otherUsers, number} other {otherUsers, plural, one {user} other {users}}'
                        values={{
                            users: users.join(', '),
                            otherUsers: otherUsersCount,
                        }}
                    />
                );
            } else {
                names = (
                    <FormattedMessage
                        id='reaction.othersReacted'
                        defaultMessage='{otherUsers, number} {otherUsers, plural, one {user} other {users}}'
                        values={{
                            otherUsers: otherUsersCount,
                        }}
                    />
                );
            }
        } else if (users.length > 1) {
            names = (
                <FormattedMessage
                    id='reaction.usersReacted'
                    defaultMessage='{users} and {lastUser}'
                    values={{
                        users: users.slice(0, -1).join(', '),
                        lastUser: users[users.length - 1],
                    }}
                />
            );
        } else {
            names = users[0];
        }

        let reactionVerb;
        if (users.length + otherUsersCount > 1) {
            if (currentUserReacted) {
                reactionVerb = (
                    <FormattedMessage
                        id='reaction.reactionVerb.youAndUsers'
                        defaultMessage='reacted'
                    />
                );
            } else {
                reactionVerb = (
                    <FormattedMessage
                        id='reaction.reactionVerb.users'
                        defaultMessage='reacted'
                    />
                );
            }
        } else if (currentUserReacted) {
            reactionVerb = (
                <FormattedMessage
                    id='reaction.reactionVerb.you'
                    defaultMessage='reacted'
                />
            );
        } else {
            reactionVerb = (
                <FormattedMessage
                    id='reaction.reactionVerb.user'
                    defaultMessage='reacted'
                />
            );
        }

        const tooltip = (
            <FormattedMessage
                id='reaction.reacted'
                defaultMessage='{users} {reactionVerb} with {emoji}'
                values={{
                    users: <b>{names}</b>,
                    reactionVerb,
                    emoji: <b>{':' + this.props.emojiName + ':'}</b>,
                }}
            />
        );

        let handleClick;
        let clickTooltip;
        let className = 'post-reaction';
        const emojiNameWithSpaces = this.props.emojiName.replace(/_/g, ' ');
        let ariaLabelEmoji = `${Utils.localizeMessage('reaction.reactWidth.ariaLabel', 'react with')} ${emojiNameWithSpaces}`;
        if (currentUserReacted) {
            if (this.props.canRemoveReaction) {
                handleClick = this.handleRemoveReaction;
                ariaLabelEmoji = `${Utils.localizeMessage('reaction.removeReact.ariaLabel', 'remove reaction')} ${emojiNameWithSpaces}`;
                clickTooltip = (
                    <FormattedMessage
                        id='reaction.clickToRemove'
                        defaultMessage='(click to remove)'
                    />
                );
            } else {
                className += ' post-reaction--read-only';
            }

            className += ' post-reaction--current-user';
        } else if (!currentUserReacted && this.props.canAddReaction) {
            handleClick = this.handleAddReaction;
            clickTooltip = (
                <FormattedMessage
                    id='reaction.clickToAdd'
                    defaultMessage='(click to add)'
                />
            );
        } else {
            className += ' post-reaction--read-only';
        }

        return (
            <button
                id={`postReaction-${this.props.post.id}-${this.props.emojiName}`}
                aria-label={ariaLabelEmoji}
                className={`style--none ${className}`}
                onClick={handleClick}
            >
                <OverlayTrigger
                    delayShow={500}
                    placement='top'
                    shouldUpdatePosition={true}
                    overlay={
                        <Tooltip id={`${this.props.post.id}-${this.props.emojiName}-reaction`}>
                            {tooltip}
                            <br/>
                            {clickTooltip}
                        </Tooltip>
                    }
                    onEnter={this.loadMissingProfiles}
                >
                    <span>
                        <span
                            className='post-reaction__emoji emoticon'
                            style={{backgroundImage: 'url(' + this.props.emojiImageUrl + ')'}}
                        />
                        <span
                            className='post-reaction__count'
                        >
                            {this.props.reactionCount}
                        </span>
                    </span>
                </OverlayTrigger>
            </button>
        );
    }
}
