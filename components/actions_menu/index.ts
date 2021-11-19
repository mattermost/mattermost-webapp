// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentProps} from 'react';
import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {appsEnabled, makeGetPostOptionBinding} from 'mattermost-redux/selectors/entities/apps';

import {AppBindingLocations} from 'mattermost-redux/constants/apps';

import {isSystemAdmin} from 'mattermost-redux/utils/user_utils';
import {isSystemMessage} from 'mattermost-redux/utils/post_utils';
import {isCombinedUserActivityPost} from 'mattermost-redux/utils/post_list';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';
import {AppBinding} from 'mattermost-redux/types/apps';
import {Post} from 'mattermost-redux/types/posts';
import {DoAppCall, PostEphemeralCallResponseForPost} from 'types/apps';
import {GlobalState} from 'types/store';

import {openModal} from 'actions/views/modals';
import {doAppCall, makeFetchBindings, postEphemeralCallResponseForPost} from 'actions/apps';

import ActionsMenu from './actions_menu';

type Props = {
    post: Post;
    handleCardClick?: (post: Post) => void;
    handleDropdownOpened: (open: boolean) => void;
    isMenuOpen: boolean;
    location?: ComponentProps<typeof ActionsMenu>['location'];
};

const emptyBindings: AppBinding[] = [];

const getPostOptionBinding = makeGetPostOptionBinding();

const fetchBindings = makeFetchBindings(AppBindingLocations.POST_MENU_ITEM);

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const {post} = ownProps;

    const userId = getCurrentUserId(state);
    const systemMessage = isSystemMessage(post);

    const apps = appsEnabled(state);
    const showBindings = apps && !systemMessage && !isCombinedUserActivityPost(post.id);
    let appBindings: AppBinding[] | null = emptyBindings;
    if (showBindings) {
        appBindings = getPostOptionBinding(state, ownProps.location);
    }
    const currentUser = getCurrentUser(state);
    const isSysAdmin = isSystemAdmin(currentUser.roles);

    return {
        appBindings,
        appsEnabled: apps,
        components: state.plugins.components,
        isSysAdmin,
        pluginMenuItems: state.plugins.components.PostDropdownMenu,
        teamId: getCurrentTeamId(state),
        userId,
        ...ownProps,
    };
}

type Actions = {
    doAppCall: DoAppCall;
    fetchBindings: (userId: string, channelId: string, teamId: string) => Promise<{data: AppBinding[]}>;
    openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: {post: Post; isRHS: boolean}}) => Promise<{
        data: boolean;
    }>;
    postEphemeralCallResponseForPost: PostEphemeralCallResponseForPost;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            doAppCall,
            fetchBindings,
            openModal,
            postEphemeralCallResponseForPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionsMenu);
