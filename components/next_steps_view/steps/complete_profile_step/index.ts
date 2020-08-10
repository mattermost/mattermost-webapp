// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {
    updateMe,
    setDefaultProfileImage,
    uploadProfileImage,
} from 'mattermost-redux/actions/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {GlobalState} from 'types/store';

import CompleteProfileStep from './complete_profile_step';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    return {
        maxFileSize: parseInt(config.MaxFileSize!, 10),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            updateMe,
            setDefaultProfileImage,
            uploadProfileImage,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompleteProfileStep);
