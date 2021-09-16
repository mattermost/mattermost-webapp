// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentProps} from 'react';
import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {appsEnabled, makeAppBindingsSelector} from 'mattermost-redux/selectors/entities/apps';

import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {isSystemMessage} from 'mattermost-redux/utils/post_utils';
import {isCombinedUserActivityPost} from 'mattermost-redux/utils/post_list';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {Post} from 'mattermost-redux/types/posts';

import {DoAppCall, PostEphemeralCallResponseForPost} from 'types/apps';

import {GlobalState} from 'types/store';

import {openModal} from 'actions/views/modals';
import {doAppCall, postEphemeralCallResponseForPost} from 'actions/apps';

import {isSystemAdmin} from 'utils/utils';

import DotMenu from './actions_menu';

type Props = {
    post: Post;
    handleCardClick?: (post: Post) => void;
    handleDropdownOpened: (open: boolean) => void;
    isMenuOpen: boolean;
    location?: ComponentProps<typeof DotMenu>['location'];
};

const getPostMenuBindings = makeAppBindingsSelector(AppBindingLocations.POST_MENU_ITEM);

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const {post} = ownProps;

    const userId = getCurrentUserId(state);
    const currentTeam = getCurrentTeam(state) || {};

    const systemMessage = isSystemMessage(post);

    const apps = appsEnabled(state);
    const showBindings = apps && !systemMessage && !isCombinedUserActivityPost(post.id);
    const appBindings = showBindings ? getPostMenuBindings(state) : undefined;
    const currentUser = getCurrentUser(state);
    const isSysAdmin = isSystemAdmin(currentUser.roles);

    return {
        components: state.plugins.components,
        teamId: getCurrentTeamId(state),
        pluginMenuItems: state.plugins.components.PostDropdownMenu,
        currentTeamId: currentTeam.id,
        userId,
        isSysAdmin,
        appBindings,
        appsEnabled: apps,
        ...ownProps,
    };
}

type Actions = {
    openModal: () => void;
    doAppCall: DoAppCall;
    postEphemeralCallResponseForPost: PostEphemeralCallResponseForPost;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            openModal,
            doAppCall,
            postEphemeralCallResponseForPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DotMenu);
