// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import {Dispatch} from 'redux';

import Permissions from 'mattermost-redux/constants/permissions';

import {Emoji} from 'mattermost-redux/types/emojis';

import {Locations} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';
import store from 'stores/redux_store.jsx';
import {Post} from 'mattermost-redux/types/posts';
import {Reaction as ReactionType} from 'mattermost-redux/types/reactions';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users'
import { makeGetUniqueReactionsToPost } from 'utils/post_utils';


const TOP_OFFSET = -7;

type LocationTypes = 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT';

type Props = {
    channelId?: string;
    postId: string;
    teamId: string;
    getDotMenuRef: () => HTMLDivElement;
    location: LocationTypes;
    showEmojiPicker: boolean;
    toggleEmojiPicker: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    actions: {
        addReaction: (postId: string, emojiName: string) => (dispatch: Dispatch) => void;
        removeReaction: (postId: string, emojiName: string) => (dispatch: Dispatch) => void;
    };
}

type State = {
    location: LocationTypes;
    showEmojiPicker: boolean;
}

export default class PostReaction extends React.PureComponent<Props, State> {
    public static defaultProps: Partial<Props> = {
        location: Locations.CENTER as 'CENTER',
        showEmojiPicker: false,
    };

    handleEmoji = (emoji: Emoji): void => {
        this.setState({showEmojiPicker: false});
        const emojiName = 'short_name' in emoji ? emoji.short_name : emoji.name;
        const state = store.getState()
        const getReactionsForPost = makeGetUniqueReactionsToPost();

        let reactions = getReactionsForPost(state, this.props.postId)
        console.log(reactions)
        let currentUserReacted = false
        for (let key in reactions) {
            let value  = reactions[key];
            if (value.user_id === getCurrentUserId(state) && value.emoji_name === emojiName) {
                currentUserReacted = true
                break
            }
        }

        if (currentUserReacted) {
            this.props.actions.removeReaction(this.props.postId, emojiName)
        } else {
            this.props.actions.addReaction(this.props.postId, emojiName);
        }
        this.props.toggleEmojiPicker();
    };

    render() {
        const {
            channelId,
            location,
            postId,
            showEmojiPicker,
            teamId,
        } = this.props;

        let spaceRequiredAbove;
        let spaceRequiredBelow;
        if (location === Locations.RHS_ROOT || location === Locations.RHS_COMMENT) {
            spaceRequiredAbove = EmojiPickerOverlay.RHS_SPACE_REQUIRED_ABOVE;
            spaceRequiredBelow = EmojiPickerOverlay.RHS_SPACE_REQUIRED_BELOW;
        }

        return (
            <ChannelPermissionGate
                channelId={channelId}
                teamId={teamId}
                permissions={[Permissions.ADD_REACTION]}
            >
                <React.Fragment>
                    <EmojiPickerOverlay
                        show={showEmojiPicker}
                        target={this.props.getDotMenuRef}
                        onHide={this.props.toggleEmojiPicker}
                        onEmojiClose={this.props.toggleEmojiPicker}
                        onEmojiClick={this.handleEmoji}
                        topOffset={TOP_OFFSET}
                        spaceRequiredAbove={spaceRequiredAbove}
                        spaceRequiredBelow={spaceRequiredBelow}
                    />
                    <OverlayTrigger
                        className='hidden-xs'
                        delayShow={500}
                        placement='top'
                        overlay={
                            <Tooltip
                                id='reaction-icon-tooltip'
                                className='hidden-xs'
                            >
                                <FormattedMessage
                                    id='post_info.tooltip.add_reactions'
                                    defaultMessage='Add Reaction'
                                />
                            </Tooltip>
                        }
                    >
                        <button
                            data-testid='post-reaction-emoji-icon'
                            id={`${location}_reaction_${postId}`}
                            aria-label={localizeMessage('post_info.tooltip.add_reactions', 'Add Reaction').toLowerCase()}
                            className={classNames('post-menu__item', 'post-menu__item--reactions', {
                                'post-menu__item--active': showEmojiPicker,
                            })}
                            onClick={this.props.toggleEmojiPicker}
                        >
                            <EmojiIcon className='icon icon--small'/>
                        </button>
                    </OverlayTrigger>
                </React.Fragment>
            </ChannelPermissionGate>
        );
    }
}