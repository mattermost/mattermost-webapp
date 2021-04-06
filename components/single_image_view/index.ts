// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {toggleEmbedVisibility} from 'actions/post_actions';

import {getIsRhsOpen} from 'selectors/rhs';

import SingleImageView from 'components/single_image_view/single_image_view';

function mapStateToProps(state: GlobalState) {
    const isRhsOpen = getIsRhsOpen(state);

    return {
        isRhsOpen,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            toggleEmbedVisibility,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleImageView);
