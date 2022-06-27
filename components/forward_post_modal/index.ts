// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';

import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {Channel} from '@mattermost/types/channels';
import {ActionResult} from 'mattermost-redux/types/actions';

import {getAssociatedGroupsForReferenceByMention} from 'mattermost-redux/selectors/entities/groups';

import {Post} from '@mattermost/types/posts';

import {Permissions} from 'mattermost-redux/constants';
import {isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {haveICurrentChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {joinChannelById, switchToChannel} from 'actions/views/channel';
import {forwardPost} from 'actions/views/posts';
import {GlobalState} from 'types/store';
import * as Utils from 'utils/utils';

import ForwardPostModal from './forward_post_modal';

export type PropsFromRedux = ConnectedProps<typeof connector>;

export type ActionProps = {

    // join the selected channel when necessary
    joinChannelById: (channelId: string) => Promise<ActionResult>;

    // switch to the selected channel
    switchToChannel: (channel: Channel) => Promise<ActionResult>;

    // action called to forward the post with an optional comment
    forwardPost: (post: Post, channelId: string, message?: string) => Promise<ActionResult>;
}

export type OwnProps = {

    // The function called immediately after the modal is hidden
    onExited?: () => void;

    // the post that is going to be forwarded
    post: Post;
};

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const config = getConfig(state);
    const license = getLicense(state);
    const currentChannel = getCurrentChannel(state);
    const currentTeam = getCurrentTeam(state);
    const currentUserId = getCurrentUserId(state);
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
        relativePermaLink,
        useLDAPGroupMentions,
        useCustomGroupMentions,
        groupsWithAllowReference,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<any>, ActionProps>({
            joinChannelById,
            switchToChannel,
            forwardPost,
        }, dispatch),
    };
}
const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(ForwardPostModal);
