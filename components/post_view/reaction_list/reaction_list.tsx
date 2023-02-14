// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Permissions from 'mattermost-redux/constants/permissions';
import {Post} from '@mattermost/types/posts';
import {Reaction as ReactionType} from '@mattermost/types/reactions';
import {Emoji} from '@mattermost/types/emojis';
import {isSystemEmoji} from 'mattermost-redux/utils/emoji_utils';

import Constants from 'utils/constants';
import Reaction from 'components/post_view/reaction';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay';
import AddReactionIcon from 'components/widgets/icons/add_reaction_icon';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import {localizeMessage} from 'utils/utils';

const DEFAULT_EMOJI_PICKER_RIGHT_OFFSET = 15;
const EMOJI_PICKER_WIDTH_OFFSET = 260;

type Props = {

    /**
     * The post to render reactions for
     */
    post: Post;

    /*
     * The id of the team which belongs the post
     */
    teamId: string;

    /**
     * The reactions to render
     */
    reactions: { [x: string]: ReactionType } | undefined | null;

    /**
     * Whether or not the user can add reactions to this post.
     */
    canAddReactions: boolean;

    actions: {

        /**
         * Function to add a reaction to the post
         */
        addReaction: (postId: string, emojiName: string) => void;
    };
};

type State = {
    emojiNames: string[];
    showEmojiPicker: boolean;
};

export default class ReactionList extends React.PureComponent<Props, State> {
    private addReactionButtonRef = React.createRef<HTMLButtonElement>();

    constructor(props: Props) {
        super(props);

        this.state = {
            emojiNames: [],
            showEmojiPicker: false,
        };
    }

    static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
        let emojiNames = state.emojiNames;

        for (const {emoji_name: emojiName} of Object.values(props.reactions ?? {})) {
            if (!emojiNames.includes(emojiName)) {
                emojiNames = [...emojiNames, emojiName];
            }
        }

        return (emojiNames === state.emojiNames) ? null : {emojiNames};
    }

    getTarget = (): HTMLButtonElement | null => {
        return this.addReactionButtonRef.current;
    }

    handleEmojiClick = (emoji: Emoji): void => {
        this.setState({showEmojiPicker: false});
        const emojiName = isSystemEmoji(emoji) ? emoji.short_names[0] : emoji.name;
        this.props.actions.addReaction(this.props.post.id, emojiName);
    }

    hideEmojiPicker = (): void => {
        this.setState({showEmojiPicker: false});
    }

    toggleEmojiPicker = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        e?.stopPropagation();
        this.setState({showEmojiPicker: !this.state.showEmojiPicker});
    }

    render(): React.ReactNode {
        const reactionsByName = new Map();

        if (this.props.reactions) {
            for (const reaction of Object.values(this.props.reactions)) {
                const emojiName = reaction.emoji_name;

                if (reactionsByName.has(emojiName)) {
                    reactionsByName.get(emojiName).push(reaction);
                } else {
                    reactionsByName.set(emojiName, [reaction]);
                }
            }
        }

        if (reactionsByName.size === 0) {
            return null;
        }

        const reactions = this.state.emojiNames.map((emojiName) => {
            if (reactionsByName.has(emojiName)) {
                return (
                    <Reaction
                        key={emojiName}
                        post={this.props.post}
                        emojiName={emojiName}
                        reactions={reactionsByName.get(emojiName) || []}
                    />
                );
            }
            return null;
        });

        const addReactionButton = this.getTarget();
        let rightOffset = DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;
        if (addReactionButton) {
            rightOffset = window.innerWidth - addReactionButton.getBoundingClientRect().right - EMOJI_PICKER_WIDTH_OFFSET;

            if (rightOffset < 0) {
                rightOffset = DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;
            }
        }

        let emojiPicker = null;
        if (this.props.canAddReactions) {
            const addReactionTooltip = (
                <Tooltip id='addReactionTooltip'>
                    <FormattedMessage
                        id='reaction_list.addReactionTooltip'
                        defaultMessage='Add a reaction'
                    />
                </Tooltip>
            );

            emojiPicker = (
                <span className='emoji-picker__container'>
                    <EmojiPickerOverlay
                        show={this.state.showEmojiPicker}
                        target={this.getTarget}
                        onHide={this.hideEmojiPicker}
                        onEmojiClick={this.handleEmojiClick}
                        rightOffset={rightOffset}
                        topOffset={-5}
                    />
                    <ChannelPermissionGate
                        channelId={this.props.post.channel_id}
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_REACTION]}
                    >
                        <OverlayTrigger
                            placement='top'
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            overlay={addReactionTooltip}
                        >
                            <button
                                aria-label={localizeMessage('reaction.add.ariaLabel', 'Add a reaction')}
                                className='Reaction'
                                onClick={this.toggleEmojiPicker}
                            >
                                <span
                                    id={`addReaction-${this.props.post.id}`}
                                    className='Reaction__add'
                                    ref={this.addReactionButtonRef}
                                >
                                    <AddReactionIcon/>
                                </span>
                            </button>
                        </OverlayTrigger>
                    </ChannelPermissionGate>
                </span>
            );
        }

        let addReactionClassName = 'post-add-reaction';
        if (this.state.showEmojiPicker) {
            addReactionClassName += ' post-add-reaction-emoji-picker-open';
        }

        return (
            <div
                aria-label={localizeMessage('reaction.container.ariaLabel', 'reactions')}
                className='post-reaction-list'
            >
                {reactions}
                <div className={addReactionClassName}>
                    {emojiPicker}
                </div>
            </div>
        );
    }
}
