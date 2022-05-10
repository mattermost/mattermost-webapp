// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GlobalState} from 'types/store';

import {getIsPostForwardingEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {openModal} from 'actions/views/modals';

import ForwardPost from './forward_post';

const mapStateToProps = (state: GlobalState) => {
    return {
        isPostForwardingEnabled: getIsPostForwardingEnabled(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators({
            openModal,
        }, dispatch),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ForwardPost);
