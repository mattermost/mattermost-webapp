// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getCurrentUserId, makeGetProfilesInChannel, makeGetProfilesNotInChannel} from 'mattermost-redux/selectors/entities/users';

import {autocompleteUsersInChannel} from 'actions/views/channel';
import {autocompleteChannels} from 'actions/channel_actions';
import Constants from 'utils/constants';
import {isFeatureEnabled} from 'utils/utils';

import Textbox from './textbox.jsx';
import PureTextboxLinks from './textbox_links.jsx';

const PreReleaseFeatures = Constants.PRE_RELEASE_FEATURES;

const makeMapStateToProps = () => {
    const getProfilesInChannel = makeGetProfilesInChannel();
    const getProfilesNotInChannel = makeGetProfilesNotInChannel();

    return (state, ownProps) => ({
        currentUserId: getCurrentUserId(state),
        profilesInChannel: getProfilesInChannel(state, ownProps.channelId, true),
        profilesNotInChannel: getProfilesNotInChannel(state, ownProps.channelId, true),
    });
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        autocompleteUsersInChannel,
        autocompleteChannels,
    }, dispatch),
});

const textboxLinksMapStateToProps = (state) => ({
    isMarkdownPreviewEnabled: isFeatureEnabled(PreReleaseFeatures.MARKDOWN_PREVIEW, state),
});

export default connect(makeMapStateToProps, mapDispatchToProps, null, {withRef: true})(Textbox);
export const TextboxLinks = connect(textboxLinksMapStateToProps)(PureTextboxLinks);
