// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {Post} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';
import {Reaction} from 'mattermost-redux/types/reactions';

import OverlayTrigger from 'components/overlay_trigger';

import * as Utils from 'utils/utils.jsx';

import './reaction.scss';

type Props = {

    /*
    * The post to render the reaction for
    */
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
    profiles: UserProfile[],

    /*
    * The number of users not in the profile list who have reacted with this emoji
    */
    otherUsersCount: number;

    /*
    * Array of reactions by user
    */
    reactions: Reaction[],

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
        addReaction: (postId: string, emojiName: string) => void;

        /*
        * Function to get non-loaded profiles by id
        */
        getMissingProfilesByIds: (ids: string[]) => void;

        /*
        * Function to remove a reaction from a post
        */
        removeReaction: (postId: string, emojiName: string) => void;

    }

    sortedUsers: {currentUserReacted: boolean, users: UserProfile[]};
}

type State = {
    userReacted: boolean;
    reactedClass: string;
    displayNumber: number;
    reactedNumber: number;
    unreactedNumber: number;
}

export default class ReactionComponent extends React.Component<Props, State> {
    private reactionButtonRef: React.RefObject<HTMLButtonElement>;
    private reactionCountRef: React.RefObject<HTMLSpanElement>;

    constructor(props: Props) {
        super(props);

        const {reactionCount} = this.props;
        const {currentUserReacted} = this.props.sortedUsers;

        if (currentUserReacted) {
            this.state = {
                userReacted: currentUserReacted,
                reactedClass: 'Reaction--reacted',
                displayNumber: reactionCount,
                reactedNumber: reactionCount,
                unreactedNumber: reactionCount - 1,
            };
        } else {
            this.state = {
                userReacted: currentUserReacted,
                reactedClass: 'Reaction--unreacted',
                displayNumber: reactionCount,
                reactedNumber: reactionCount + 1,
                unreactedNumber: reactionCount,
            };
        }

        this.reactionButtonRef = React.createRef();
        this.reactionCountRef = React.createRef();
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        // reaction count has changed, but not by current user
        if (nextProps.reactionCount !== prevState.displayNumber && nextProps.sortedUsers.currentUserReacted === prevState.userReacted) {
            // set counts relative to current user having reacted
            if (prevState.userReacted) {
                return {
                    displayNumber: nextProps.reactionCount,
                    reactedNumber: nextProps.reactionCount,
                    unreactedNumber: nextProps.reactionCount - 1,
                };
            }

            // set counts relative to current user having NOT reacted
            return {
                displayNumber: nextProps.reactionCount,
                reactedNumber: nextProps.reactionCount + 1,
                unreactedNumber: nextProps.reactionCount,
            };
        }
        return null;
    }

    handleClick = () => {
        // only proceed if user has permission to react
        if (!(this.props.canAddReaction && this.props.canRemoveReaction)) {
            return;
        }
        this.setState((state) => {
            if (state.userReacted) {
                return {
                    userReacted: false,
                    reactedClass: 'Reaction--unreacting',
                };
            }
            return {
                userReacted: true,
                reactedClass: 'Reaction--reacting',
            };
        });
    }

    handleAnimationEnded = () => {
        const {reactedNumber, unreactedNumber} = this.state;
        const {actions, post, emojiName} = this.props;
        this.setState((state) => {
            if (state.userReacted) {
                return {
                    reactedClass: 'Reaction--reacted',
                    displayNumber: reactedNumber,
                };
            }
            return {
                reactedClass: 'Reaction--unreacted',
                displayNumber: unreactedNumber,
            };
        });
        if (this.state.userReacted) {
            actions.addReaction(post.id, emojiName);
        } else {
            actions.removeReaction(post.id, emojiName);
        }
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
        const {otherUsersCount, canAddReaction, canRemoveReaction} = this.props;
        const {unreactedNumber, reactedNumber, displayNumber} = this.state;
        const unreacted = (unreactedNumber > 0) ? unreactedNumber : '';
        const reacted = (reactedNumber > 0) ? reactedNumber : '';
        const display = (displayNumber > 0) ? displayNumber : '';
        const readOnlyClass = (canAddReaction && canRemoveReaction) ? '' : 'Reaction--read-only';

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

        let clickTooltip;
        const emojiNameWithSpaces = this.props.emojiName.replace(/_/g, ' ');
        let ariaLabelEmoji = `${Utils.localizeMessage('reaction.reactWidth.ariaLabel', 'react with')} ${emojiNameWithSpaces}`;
        if (currentUserReacted && canRemoveReaction) {
            ariaLabelEmoji = `${Utils.localizeMessage('reaction.removeReact.ariaLabel', 'remove reaction')} ${emojiNameWithSpaces}`;
            clickTooltip = (
                <FormattedMessage
                    id='reaction.clickToRemove'
                    defaultMessage='(click to remove)'
                />
            );
        } else if (!currentUserReacted && canAddReaction) {
            clickTooltip = (
                <FormattedMessage
                    id='reaction.clickToAdd'
                    defaultMessage='(click to add)'
                />
            );
        }

        return (
            <button
                id={`postReaction-${this.props.post.id}-${this.props.emojiName}`}
                aria-label={ariaLabelEmoji}
                className={`Reaction ${this.state.reactedClass} ${readOnlyClass}`}
                onClick={this.handleClick}
                ref={this.reactionButtonRef}
            >
                <OverlayTrigger
                    delayShow={500}
                    placement='top'
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
                            className='Reaction__emoji emoticon'
                            style={{backgroundImage: 'url(' + this.props.emojiImageUrl + ')'}}
                        />
                        <span
                            ref={this.reactionCountRef}
                            className='Reaction__count'
                        >
                            <span className='Reaction__number'>
                                <span className='Reaction__number--display'>{display}</span>
                                <span
                                    className='Reaction__number--unreacted'
                                    onAnimationEnd={this.handleAnimationEnded}
                                >
                                    {unreacted}
                                </span>
                                <span className='Reaction__number--reacted'>{reacted}</span>
                            </span>
                        </span>
                    </span>
                </OverlayTrigger>
            </button>
        );
    }
}
