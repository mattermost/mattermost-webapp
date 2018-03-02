// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import Permissions from 'mattermost-redux/constants/permissions';

import {postListScrollChange} from 'actions/global_actions.jsx';
import {emitEmojiPosted} from 'actions/post_actions.jsx';
import Constants from 'utils/constants.jsx';
import Reaction from 'components/post_view/reaction';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';

const DEFAULT_EMOJI_PICKER_RIGHT_OFFSET = 15;
const EMOJI_PICKER_WIDTH_OFFSET = 260;

export default class ReactionListView extends React.PureComponent {
    static propTypes = {

        /**
         * The post to render reactions for
         */
        post: PropTypes.object.isRequired,

        /*
         * The id of the team which belongs the post
         */
        teamId: PropTypes.string,

        /**
         * The reactions to render
         */
        reactions: PropTypes.arrayOf(PropTypes.object),

        /**
         * The emojis for the different reactions
         */
        emojis: PropTypes.object.isRequired,

        /**
         * Whether to show the emoji picker.
         */
        enableEmojiPicker: PropTypes.bool.isRequired,

        actions: PropTypes.shape({

            /**
             * Function to get reactions for a post
             */
            getReactionsForPost: PropTypes.func.isRequired,

            /**
             * Function to add a reaction to the post
             */
            addReaction: PropTypes.func.isRequired,
        }),
    }

    constructor(props) {
        super(props);

        this.state = {
            showEmojiPicker: false,
        };
    }

    componentDidMount() {
        if (this.props.post.has_reactions) {
            this.props.actions.getReactionsForPost(this.props.post.id);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.reactions !== prevProps.reactions) {
            postListScrollChange();
        }
    }

    getTarget = () => {
        return this.refs.addReactionButton;
    }

    handleEmojiClick = (emoji) => {
        this.setState({showEmojiPicker: false});
        const emojiName = emoji.name || emoji.aliases[0];
        this.props.actions.addReaction(this.props.post.id, emojiName);
        emitEmojiPosted(emojiName);
    }

    hideEmojiPicker = () => {
        this.setState({showEmojiPicker: false});
    }

    toggleEmojiPicker = () => {
        this.setState({showEmojiPicker: !this.state.showEmojiPicker});
    }

    render() {
        if (!this.props.post.has_reactions || (this.props.reactions && this.props.reactions.length === 0)) {
            return null;
        }

        const reactionsByName = new Map();
        const emojiNames = [];

        if (this.props.reactions) {
            for (const reaction of this.props.reactions) {
                const emojiName = reaction.emoji_name;

                if (reactionsByName.has(emojiName)) {
                    reactionsByName.get(emojiName).push(reaction);
                } else {
                    emojiNames.push(emojiName);
                    reactionsByName.set(emojiName, [reaction]);
                }
            }
        }

        const reactions = emojiNames.map((emojiName) => {
            return (
                <Reaction
                    key={emojiName}
                    post={this.props.post}
                    emojiName={emojiName}
                    reactions={reactionsByName.get(emojiName) || []}
                    emojis={this.props.emojis}
                />
            );
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
        if (this.props.enableEmojiPicker) {
            const addReactionTooltip = (
                <Tooltip id='addReactionTooltip'>
                    <FormattedMessage
                        id='reaction_list.addReactionTooltip'
                        defaultMessage='Add reaction'
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
                    <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement='top'
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        overlay={addReactionTooltip}
                    >
                        <ChannelPermissionGate
                            channelId={this.props.post.channel_id}
                            teamId={this.props.teamId}
                            permissions={[Permissions.ADD_REACTION]}
                        >
                            <div
                                className='post-reaction'
                                onClick={this.toggleEmojiPicker}
                            >
                                <span
                                    className='post-reaction__add'
                                    ref='addReactionButton'
                                >
                                    {'+'}
                                </span>
                            </div>
                        </ChannelPermissionGate>
                    </OverlayTrigger>
                </span>
            );
        }

        let addReactionClassName = 'post-add-reaction';
        if (this.state.showEmojiPicker) {
            addReactionClassName += ' post-add-reaction-emoji-picker-open';
        }

        return (
            <div className='post-reaction-list'>
                {reactions}
                <div className={addReactionClassName}>
                    {emojiPicker}
                </div>
            </div>
        );
    }
}
