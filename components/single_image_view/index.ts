// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';

import {toggleEmbedVisibility} from 'actions/post_actions';
import {openModal} from 'actions/views/modals';
import {getFilePublicLink} from 'mattermost-redux/actions/files';

import {getIsRhsOpen} from 'selectors/rhs';

import SingleImageView from 'components/single_image_view/single_image_view';
import { get } from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'utils/constants';

function mapStateToProps(state: GlobalState) {
    const isRhsOpen = getIsRhsOpen(state);
    const config = getConfig(state);

    return {
        isRhsOpen,
        enablePublicLink: config.EnablePublicLink === 'true',
        autoplayGifAndEmojis : get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.AUTOPLAY_GIF_AND_EMOJI, Preferences.LINK_PREVIEW_DISPLAY_DEFAULT),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            toggleEmbedVisibility,
            openModal,
            getFilePublicLink,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SingleImageView);
