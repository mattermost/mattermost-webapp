// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {openModal} from 'actions/views/modals';

import {GlobalState} from 'types/store';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'utils/constants';

import PostImage from './post_image';

function mapStateToProps(state: GlobalState) {
    return {
        autoplayGifAndEmojis: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.AUTOPLAY_GIF_AND_EMOJI, Preferences.LINK_PREVIEW_DISPLAY_DEFAULT),
    };
}
function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(PostImage);
