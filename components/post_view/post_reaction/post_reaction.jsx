// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import Permissions from 'mattermost-redux/constants/permissions';

import {Locations} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';

import OverlayTrigger from 'components/overlay_trigger';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import EmojiPickerOverlay from 'components/emoji_picker/emoji_picker_overlay.jsx';

const TOP_OFFSET = -7;

export default class PostReaction extends React.PureComponent {
    static propTypes = {
        channelId: PropTypes.string,
        postId: PropTypes.string.isRequired,
        teamId: PropTypes.string.isRequired,
        getDotMenuRef: PropTypes.func.isRequired,
        location: PropTypes.oneOf([Locations.CENTER, Locations.RHS_ROOT, Locations.RHS_COMMENT]).isRequired,
        showEmojiPicker: PropTypes.bool.isRequired,
        toggleEmojiPicker: PropTypes.func.isRequired,
        actions: PropTypes.shape({
            addReaction: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        location: Locations.CENTER,
        showEmojiPicker: false,
    };

    handleAddEmoji = (emoji) => {
        this.setState({showEmojiPicker: false});
        const emojiName = emoji.name || emoji.aliases[0];
        this.props.actions.addReaction(this.props.postId, emojiName);
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
                <div>
                    <EmojiPickerOverlay
                        show={showEmojiPicker}
                        target={this.props.getDotMenuRef}
                        onHide={this.props.toggleEmojiPicker}
                        onEmojiClose={this.props.toggleEmojiPicker}
                        onEmojiClick={this.handleAddEmoji}
                        topOffset={TOP_OFFSET}
                        spaceRequiredAbove={spaceRequiredAbove}
                        n={true}
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
                            className='reacticon__container color--link style--none'
                            onClick={this.props.toggleEmojiPicker}
                        >
                            <EmojiIcon className='icon icon--emoji'/>
                        </button>
                    </OverlayTrigger>
                </div>
            </ChannelPermissionGate>
        );
    }
}
