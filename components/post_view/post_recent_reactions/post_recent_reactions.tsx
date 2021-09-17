// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {Dispatch} from 'redux';

import store from 'stores/redux_store.jsx';
import {getCurrentLocale} from 'selectors/i18n';
import {getEmojiMap} from 'selectors/emojis';
import Permissions from 'mattermost-redux/constants/permissions';
import {Emoji} from 'mattermost-redux/types/emojis';
import {Locations} from 'utils/constants';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import OverlayTrigger from 'components/overlay_trigger';

import EmojiItem from './recent_reactions_emoji_item';

type LocationTypes = 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT';

type Props = {
    channelId?: string;
    postId: string;
    teamId: string;
    getDotMenuRef: () => HTMLDivElement;
    location: LocationTypes;
    emojis: Emoji[];
    actions: {
        addReaction: (postId: string, emojiName: string) => (dispatch: Dispatch) => void;
    };
}

type State = {
    location: LocationTypes;
    showEmojiPicker: boolean;
}

const state = store.getState();
const emojiMap = getEmojiMap(state);
const defaultEmojis = [emojiMap.get('thumbsup'), emojiMap.get('grinning'), emojiMap.get('white_check_mark')] as Emoji[];

export default class PostRecentReactions extends React.PureComponent<Props, State> {
    public static defaultProps: Partial<Props> = {
        location: Locations.CENTER as 'CENTER',
    };

    handleAddEmoji = (emoji: Emoji): void => {
        const emojiName = 'short_name' in emoji ? emoji.short_name : emoji.name;
        this.props.actions.addReaction(this.props.postId, emojiName);
    };

    complementEmojis(): void {
        const additional = defaultEmojis.filter((e) => {
            let ignore = false;
            for (const emoji of this.props.emojis) {
                if (e.name === emoji.name) {
                    ignore = true;
                    break;
                }
            }
            return !ignore;
        });
        const l = this.props.emojis.length;
        for (let i = 0; i < 3 - l; i++) {
            this.props.emojis.push(additional[i]);
        }
    }

    emojiName = (emoji: Emoji): string => {
        const locale = getCurrentLocale(state);
        function capitalizeFirstLetter(s: string) {
            return s[0].toLocaleUpperCase(locale) + s.slice(1);
        }
        const name = 'short_name' in emoji ? emoji.short_name : emoji.name;
        return capitalizeFirstLetter(name.replace(/_/g, ' '));
    };

    render() {
        if (this.props.emojis.length < 3) {
            this.complementEmojis();
        }

        const {
            channelId,
            teamId,
            emojis,
        } = this.props;

        return emojis.map((emoji) => (
            <ChannelPermissionGate
                key={this.emojiName(emoji)} // emojis will be unique therefore no duplication expected.
                channelId={channelId}
                teamId={teamId}
                permissions={[Permissions.ADD_REACTION]}
            >
                <OverlayTrigger
                    className='hidden-xs'
                    delayShow={500}
                    placement='top'
                    overlay={
                        <Tooltip
                            id='post_info.emoji.tooltip'
                            className='hidden-xs'
                        >
                            {this.emojiName(emoji)}
                        </Tooltip>
                    }
                >
                    <div>
                        <React.Fragment>
                            <EmojiItem
                                // eslint-disable-next-line react/no-array-index-key
                                emoji={emoji}
                                onItemClick={this.handleAddEmoji}
                                category={emoji.category}
                            />
                        </React.Fragment>
                    </div>
                </OverlayTrigger>
            </ChannelPermissionGate>
        ),
        );
    }
}

