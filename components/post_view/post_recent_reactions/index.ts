// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getEmojiMap} from 'selectors/emojis';
import {getCurrentLocale} from 'selectors/i18n';
import {GlobalState} from 'types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import {addReaction} from 'actions/post_actions';
import {Emoji} from '@mattermost/types/emojis';

import PostReaction from './post_recent_reactions';
import { get } from 'mattermost-redux/selectors/entities/preferences';
import { Preferences } from 'utils/constants';

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            addReaction,
        }, dispatch),
    };
}

function mapStateToProps(state: GlobalState) {
    const locale = getCurrentLocale(state);
    const emojiMap = getEmojiMap(state);
    const defaultEmojis = [emojiMap.get('thumbsup'), emojiMap.get('grinning'), emojiMap.get('white_check_mark')] as Emoji[];

    return {
        defaultEmojis,
        locale,
        autoplayGifAndEmojis: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.AUTOPLAY_GIF_AND_EMOJI, Preferences.LINK_PREVIEW_DISPLAY_DEFAULT),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostReaction);
