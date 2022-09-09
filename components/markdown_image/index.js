// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {openModal} from 'actions/views/modals';

import MarkdownImage from './markdown_image';

import {get} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'utils/constants';

function mapStateToProps(state, ownProps) {
    return {
        autoplayGifAndEmojis: get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.AUTOPLAY_GIF_AND_EMOJI, Preferences.LINK_PREVIEW_DISPLAY_DEFAULT),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
        }, dispatch),
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(MarkdownImage);
