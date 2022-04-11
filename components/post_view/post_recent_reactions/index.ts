// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getEmojiMap} from 'selectors/emojis';
import {getCurrentLocale} from 'selectors/i18n';
import {GlobalState} from 'types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

import {addReaction} from 'actions/post_actions.jsx';
import {removeReaction} from 'mattermost-redux/actions/posts';
import {Emoji} from 'mattermost-redux/types/emojis';

import PostReaction from './post_recent_reactions';
import { Post } from 'mattermost-redux/types/posts';

type Props = {
    post: Post;
};

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            addReaction,
            removeReaction
        }, dispatch),
    };
}

function mapStateToProps(state: GlobalState) {
    const locale = getCurrentLocale(state);
    const emojiMap = getEmojiMap(state);
    const defaultEmojis = [emojiMap.get('thumbsup'), emojiMap.get('grinning'), emojiMap.get('white_check_mark')] as Emoji[];

    return function mapStateToProps(state: GlobalState, ownProps: Props) {
        return {
            defaultEmojis,
            locale,
        };
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostReaction);
