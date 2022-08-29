// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {getEmojiMap} from 'selectors/emojis';

import {GlobalState} from 'types/store';

import {get} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'utils/constants';

import PostEmoji from './post_emoji';

type Props = {
    name: string;
};

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const emojiMap = getEmojiMap(state);
    const emoji = emojiMap.get(ownProps.name);

    return {
        imageUrl: emoji ? getEmojiImageUrl(emoji) : '',
        autoplayGifAndEmojis: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.AUTOPLAY_GIF_AND_EMOJI, Preferences.LINK_PREVIEW_DISPLAY_DEFAULT),
    };
}

export default connect(mapStateToProps)(PostEmoji);
