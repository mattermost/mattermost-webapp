// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Dispatch} from 'redux';

import Permissions from 'mattermost-redux/constants/permissions';

import {Emoji} from 'mattermost-redux/types/emojis';

import {Locations} from 'utils/constants';
import {makeGetUniqueReactionsToPost} from 'utils/post_utils';

import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import store from 'stores/redux_store.jsx';

import EmojiItem from './recent_reactions_emoji_item';

type LocationTypes = 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT';

type Props = {
    channelId?: string;
    postId: string;
    teamId: string;
    getDotMenuRef: () => HTMLDivElement | null;
    location: LocationTypes;
    locale: string;
    emojis: Emoji[];
    size: number;
    defaultEmojis: Emoji[];
    actions: {
        addReaction: (postId: string, emojiName: string) => (dispatch: Dispatch) => void;
        removeReaction: (postId: string, emojiName: string) => (dispatch: Dispatch) => void;
    };
}

type State = {
    location: LocationTypes;
}

export default class PostRecentReactions extends React.PureComponent<Props, State> {
    public static defaultProps: Partial<Props> = {
        location: Locations.CENTER as 'CENTER',
        size: 3,
    };

    handleEmoji = (emoji: Emoji): void => {
        const emojiName = 'short_name' in emoji ? emoji.short_name : emoji.name;
        const state = store.getState();
        const getReactionsForPost = makeGetUniqueReactionsToPost();

        const reactions = getReactionsForPost(state, this.props.postId);
        let currentUserReacted = false;
        for (const key in reactions) {
            if ({}.hasOwnProperty.call(reactions, key)) {
                const value = reactions[key];
                if (value.user_id === getCurrentUserId(state) && value.emoji_name === emojiName) {
                    currentUserReacted = true;
                    break;
                }
            }
        }

        if (currentUserReacted) {
            this.props.actions.removeReaction(this.props.postId, emojiName);
        } else {
            this.props.actions.addReaction(this.props.postId, emojiName);
        }
    };

    complementEmojis = (emojis: Emoji[]): (Emoji[]) => {
        const additional = this.props.defaultEmojis.filter((e) => {
            let ignore = false;
            for (const emoji of emojis) {
                if (e.name === emoji.name) {
                    ignore = true;
                    break;
                }
            }
            return !ignore;
        });
        const l = emojis.length;
        for (let i = 0; i < this.props.size - l; i++) {
            emojis.push(additional[i]);
        }

        return emojis;
    };

    emojiName = (emoji: Emoji, locale: string): string => {
        function capitalizeFirstLetter(s: string) {
            return s[0].toLocaleUpperCase(locale) + s.slice(1);
        }
        const name = 'short_name' in emoji ? emoji.short_name : emoji.name;
        return capitalizeFirstLetter(name.replace(/_/g, ' '));
    };

    render() {
        const {
            channelId,
            teamId,
        } = this.props;

        let emojis = [...this.props.emojis].slice(0, this.props.size);
        if (emojis.length < this.props.size) {
            emojis = this.complementEmojis(emojis);
        }

        return emojis.map((emoji, n) => (
            <ChannelPermissionGate
                key={this.emojiName(emoji, this.props.locale)} // emojis will be unique therefore no duplication expected.
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
                            {this.emojiName(emoji, this.props.locale)}
                        </Tooltip>
                    }
                >
                    <div>
                        <React.Fragment>
                            <EmojiItem
                                // eslint-disable-next-line react/no-array-index-key
                                emoji={emoji}
                                onItemClick={this.handleEmoji}
                                order={n}
                            />
                        </React.Fragment>
                    </div>
                </OverlayTrigger>
            </ChannelPermissionGate>
        ),
        );
    }
}
