// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ComponentProps} from 'react';
import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId, getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {appsEnabled, makeAppBindingsSelector} from 'mattermost-redux/selectors/entities/apps';
import {getThreadOrSynthetic} from 'mattermost-redux/selectors/entities/threads';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {AppBindingLocations} from 'mattermost-redux/constants/apps';
import {isSystemMessage} from 'mattermost-redux/utils/post_utils';
import {isCombinedUserActivityPost} from 'mattermost-redux/utils/post_list';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {Post} from 'mattermost-redux/types/posts';

import {DoAppCall, PostEphemeralCallResponseForPost} from 'types/apps';

import {GlobalState} from 'types/store';

import {openModal} from 'actions/views/modals';
import {doAppCall, postEphemeralCallResponseForPost} from 'actions/apps';

import {isArchivedChannel} from 'utils/channel_utils';
import {isSystemAdmin} from 'utils/utils';
import {Locations} from 'utils/constants';

import DotMenu from './actions_menu';

type Props = {
    post: Post;
    handleCardClick?: (post: Post) => void;
    handleDropdownOpened: (open: boolean) => void;
    isMenuOpen: boolean;
    enableEmojiPicker?: boolean;
    location?: ComponentProps<typeof DotMenu>['location'];
};

const getPostMenuBindings = makeAppBindingsSelector(AppBindingLocations.POST_MENU_ITEM);

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const {post} = ownProps;

    const license = getLicense(state);
    const userId = getCurrentUserId(state);
    const channel = getChannel(state, post.channel_id);
    const currentTeam = getCurrentTeam(state) || {};

    const systemMessage = isSystemMessage(post);

    const rootId = post.root_id || post.id;
    let threadId = rootId;

    if (
        rootId && !systemMessage &&
        (

            // default prop location would be CENTER
            !ownProps.location ||
            ownProps.location === Locations.RHS_ROOT ||
            ownProps.location === Locations.RHS_COMMENT ||
            ownProps.location === Locations.CENTER
        )
    ) {
        const root = getPost(state, rootId);
        if (root) {
            const thread = getThreadOrSynthetic(state, root);
            threadId = thread.id;
        }
    }

    const apps = appsEnabled(state);
    const showBindings = apps && !systemMessage && !isCombinedUserActivityPost(post.id);
    const appBindings = showBindings ? getPostMenuBindings(state) : undefined;
    const currentUser = getCurrentUser(state);
    const isSysAdmin = isSystemAdmin(currentUser.roles);

    return {
        channelIsArchived: isArchivedChannel(channel),
        components: state.plugins.components,
        isLicensed: license.IsLicensed === 'true',
        teamId: getCurrentTeamId(state),
        pluginMenuItems: state.plugins.components.PostDropdownMenuItem,
        currentTeamId: currentTeam.id,
        userId,
        isSysAdmin,
        threadId,
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
