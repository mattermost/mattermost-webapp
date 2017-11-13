import {createSelector} from 'reselect';

import {getPost} from 'mattermost-redux/selectors/entities/posts';

export const getEditingPost = createSelector(
    (state) => state,
    (state) => state.views.posts.editingPost,
    (state, editingPost) => {
        return {
            ...editingPost,
            post: getPost(state, editingPost.postId)
        };
    }
);
