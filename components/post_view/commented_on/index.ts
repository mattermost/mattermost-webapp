// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {showSearchResults, updateSearchTerms} from 'actions/views/rhs';

import {getDisplayNameByUser} from 'utils/utils.jsx';

import CommentedOn from './commented_on';
import { GlobalState } from 'mattermost-redux/types/store';
import { Post } from 'mattermost-redux/types/posts';
import { Dispatch } from 'react';
import { ActionFunc, GenericAction } from 'mattermost-redux/types/actions';
import { ActionTypes } from 'react-select';

type Props = {
    post: Post;
}

type Actions = {
    showSearchResults: (isMentionSearch: boolean) => ActionFunc;
    updateSearchTerms: (terms: any) => { type: ActionTypes, terms: any };
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    let displayName = '';
    if (ownProps.post) {
        const user = getUser(state, ownProps.post.user_id);
        displayName = getDisplayNameByUser(state, user);
    }

    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';

    return {
        displayName,
        enablePostUsernameOverride,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            showSearchResults,
            updateSearchTerms,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentedOn);
