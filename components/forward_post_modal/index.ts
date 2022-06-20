// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {getAssociatedGroupsForReferenceByMention} from 'mattermost-redux/selectors/entities/groups';

import {FileInfo} from '@mattermost/types/files';
import {Post} from '@mattermost/types/posts';

import {isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {Permissions} from 'mattermost-redux/constants';
import {haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {joinChannelById, switchToChannel} from 'actions/views/channel';
import {GlobalState} from 'types/store';
import {runMessageWillBePostedHooks} from '../../actions/hooks';
import {createPost} from '../../actions/post_actions';
import {connectionErrorCount} from '../../selectors/views/system';
import * as Utils from '../../utils/utils';

import ForwardPostModal, {ActionProps, OwnProps} from './forward_post_modal';

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);
    const license = getLicense(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeam = getCurrentTeam(state);
    const currentUserId = getCurrentUserId(state);
    const badConnection = connectionErrorCount(state) > 1;
    const relativePermaLink = Utils.getPermalinkURL(state, currentTeam.id, ownProps.post.id);
    const isLDAPEnabled = license?.IsLicensed === 'true' && license?.LDAPGroups === 'true';
    const useLDAPGroupMentions = isLDAPEnabled && haveICurrentChannelPermission(state, Permissions.USE_GROUP_MENTIONS);
    const useCustomGroupMentions = isCustomGroupsEnabled(state) && haveICurrentChannelPermission(state, Permissions.USE_GROUP_MENTIONS);
    const groupsWithAllowReference = useLDAPGroupMentions || useCustomGroupMentions ? getAssociatedGroupsForReferenceByMention(state, currentTeam.id, currentChannel.id) : null;

    return {
        config,
        currentChannel,
        currentTeam,
        currentUserId,
        badConnection,
        relativePermaLink,
        useLDAPGroupMentions,
        useCustomGroupMentions,
        groupsWithAllowReference,
    };
}

function onSubmitPost(post: Post, fileInfos: FileInfo[]) {
    return (dispatch: Dispatch) => {
        dispatch(createPost(post, fileInfos) as any);
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, ActionProps>({
            joinChannelById,
            switchToChannel,
            runMessageWillBePostedHooks,
            onSubmitPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ForwardPostModal);
