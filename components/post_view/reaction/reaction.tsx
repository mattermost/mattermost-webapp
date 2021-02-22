// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {Post} from 'mattermost-redux/types/posts';
import {Reaction as ReactionType} from 'mattermost-redux/types/reactions';
import {UserProfile} from 'mattermost-redux/types/users';

import OverlayTrigger from 'components/overlay_trigger';

import * as Utils from 'utils/utils';

import './reaction.scss';

type State = {
    displayNumber: number;
    reactedClass: 'Reaction--reacted' | 'Reaction--reacting' | 'Reaction--unreacted' | 'Reaction--unreacting';
};

declare module 'react-bootstrap/lib/OverlayTrigger' {
    interface OverlayTriggerProps {
        shouldUpdatePosition?: boolean;
    }
}

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
    profiles: UserProfile[];

    /*
     * The number of users not in the profile list who have reacted with this emoji
     */
    otherUsersCount: number;

    /*
     * Array of reactions by user
     */
    reactions: ReactionType[];

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
    };

    sortedUsers: {
        currentUserReacted: boolean;
        users: string[];
    };
}

export default class Reaction extends React.PureComponent<Props, State> {
    private reactionButtonRef = React.createRef<HTMLButtonElement>();
    private reactionCountRef = React.createRef<HTMLSpanElement>();
    private animating = false;

    constructor(props: Props) {
        super(props);

        const {reactionCount} = this.props;
        const {currentUserReacted} = this.props.sortedUsers;

        if (currentUserReacted) {
            this.state = {
                reactedClass: 'Reaction--reacted',
                displayNumber: reactionCount,
            };
        } else {
            this.state = {
                reactedClass: 'Reaction--unreacted',
                displayNumber: reactionCount,
            };
        }
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.reactionCount !== this.props.reactionCount) {
            const {currentUserReacted} = this.props.sortedUsers;
            const reactedClass = currentUserReacted ? 'Reaction--reacted' : 'Reaction--unreacted';

            this.animating = false;
            /* eslint-disable-next-line react/no-did-update-set-state */
            this.setState({
                displayNumber: this.props.reactionCount,
                reactedClass,
            });
        }
    }

    handleClick = (): void => {
        // only proceed if user has permission to react
        // and we are not animating
        if (
            !(this.props.canAddReaction && this.props.canRemoveReaction) || this.animating
        ) {
            return;
        }

        const {currentUserReacted} = this.props.sortedUsers;

        this.animating = true;
        this.setState((state) => {
            if (currentUserReacted) {
                return {
                    displayNumber: state.displayNumber - 1,
                    reactedClass: 'Reaction--unreacting',
                };
            }

            return {
                displayNumber: state.displayNumber + 1,
                reactedClass: 'Reaction--reacting',
            };
        });
    }

    handleAnimationEnded = (): void => {
        const {actions, post, emojiName} = this.props;
        const {currentUserReacted} = this.props.sortedUsers;

        this.animating = false;
        this.setState<'reactedClass'>((state) => {
            if (state.reactedClass === 'Reaction--reacting') {
                return {
                    reactedClass: 'Reaction--reacted',
                };
            } else if (state.reactedClass === 'Reaction--unreacting') {
                return {
                    reactedClass: 'Reaction--unreacted',
                };
            }
            return state;
        });

        if (currentUserReacted) {
            actions.removeReaction(post.id, emojiName);
        } else {
            actions.addReaction(post.id, emojiName);
        }
    }

    loadMissingProfiles = async (): Promise<void> => {
        const ids = this.props.reactions.map((reaction) => reaction.user_id);
        this.props.actions.getMissingProfilesByIds(ids);
    }

    render(): React.ReactNode {
        if (!this.props.emojiImageUrl) {
            return null;
        }
        const {currentUserReacted, users} = this.props.sortedUsers;
        const {reactionCount, otherUsersCount, canAddReaction, canRemoveReaction} = this.props;
        const {displayNumber} = this.state;
        const reactedNumber = currentUserReacted ? reactionCount : reactionCount + 1;
        const unreactedNumber = currentUserReacted ? reactionCount - 1 : reactionCount;
        const unreacted = (unreactedNumber > 0) ? unreactedNumber : '';
        const reacted = (reactedNumber > 0) ? reactedNumber : '';
        const display = (displayNumber > 0) ? displayNumber : '';
        const readOnlyClass = (canAddReaction && canRemoveReaction) ? '' : 'Reaction--read-only';

        let names: React.ReactNode;
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

        let reactionVerb: React.ReactNode;
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

        let clickTooltip: React.ReactNode;
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
                <button
                    id={`postReaction-${this.props.post.id}-${this.props.emojiName}`}
                    aria-label={ariaLabelEmoji}
                    className={`Reaction ${this.state.reactedClass} ${readOnlyClass}`}
                    onClick={this.handleClick}
                    ref={this.reactionButtonRef}
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
                </button>
            </OverlayTrigger>
        );
    }
}
