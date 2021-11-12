// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {connect} from 'react-redux';

import {bindActionCreators, Dispatch} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import {isAdmin} from 'mattermost-redux/utils/user_utils';
import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import {makeAsyncComponent} from 'components/async_load';

import {closeModal, openModal} from 'actions/views/modals';

const UserLimitModal = makeAsyncComponent('UserLimitModal', React.lazy(() => import('./user_limit_modal')));

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    return {
        userIsAdmin: isAdmin(getCurrentUser(state).roles),
        show: isModalOpen(state, ModalIdentifiers.UPGRADE_CLOUD_ACCOUNT),
        cloudUserLimit: config.ExperimentalCloudUserLimit || '10',
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators(
            {
                closeModal,
                openModal,
            },
            dispatch,
        ),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(UserLimitModal);
