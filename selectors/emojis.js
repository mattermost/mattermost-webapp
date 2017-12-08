import {createSelector} from 'reselect';
import {getCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';

import {EmojiMap} from 'stores/emoji_store.jsx';

export const getEmojis = createSelector(
    getCustomEmojisByName,
    (newCustomEmoji) => new EmojiMap(newCustomEmoji)
);
