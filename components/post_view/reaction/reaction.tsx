// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import OverlayTrigger from 'components/overlay_trigger';

import * as Utils from 'utils/utils.jsx';
import {Post} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';
import {Reaction} from 'mattermost-redux/types/reactions';

type ReactionProps = {
   
    post: Post;

    /*
    * The user id of the logged in user
    */
    currentUserId: string;

    /*
    * The name of the emoji for the reaction
    */
    emojiName: string;
    
   /*
    * The number of reactions to this post for this emoji
    */
    reactionCount: number;

   /*
    * Array of users who reacted to this post
    */
    profiles: UserProfile[];


   /*
    * The number of users not in the profile list who have reacted with this emoji
    */
    otherUsersCount: number;

   /*
    * Array of reactions by user
    */
    reactions: Reaction[];

   /*
    * True if the user has the permission to add a reaction in this channel
    */
    canAddReaction: boolean;

   /*
    * True if user has the permission to remove his own reactions in this channel
    */
    canRemoveReaction: boolean;

   /*
    * The URL of the emoji image
    */
    emojiImageUrl: string;

    actions: {

        /*
            * Function to add a reaction to a post
            */
        addReaction: (id: string, emojiName: string) => void,

        /*
            * Function to get non-loaded profiles by id
            */
        getMissingProfilesByIds: (ids: string[]) => void,

        /*
            * Function to remove a reaction from a post
            */
        removeReaction: (id: string, emojiName: string) => void
    },

    sortedUsers: any;
}

export default class ReactionComponent extends React.PureComponent<ReactionProps> {
    

    handleAddReaction = (e: React.MouseEvent) => {
        e.preventDefault();
        const {actions, post, emojiName} = this.props;
        actions.addReaction(post.id, emojiName);
    }

    handleRemoveReaction = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.actions.removeReaction(this.props.post.id, this.props.emojiName);
    }

    loadMissingProfiles = async () => {
        const ids = this.props.reactions.map((reaction) => reaction.user_id);
        this.props.actions.getMissingProfilesByIds(ids);
    }

    render() {
        if (!this.props.emojiImageUrl) {
            return null;
        }

        const {currentUserReacted, users} = this.props.sortedUsers;

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
                    // shouldUpdatePosition={true} no longer in the prop
                    overlay={
                        <Tooltip id={`${this.props.post.id}-${this.props.emojiName}-reaction`}>
                            {tooltip}
                            <br/>
                            {clickTooltip}
                        </Tooltip>
                    }
                    onEnter={this.loadMissingProfiles}
                >
                    <span className='d-flex align-items-center'>
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
