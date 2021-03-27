// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getNotificationCountsForApp} from 'mattermost-redux/selectors/entities/notifications';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';

import {GlobalState} from 'types/store';

import AppIcon, {Props} from './app_icon';

function makeMapStateToProps() {
    const getAppCounts = makeGetAppCounts();

    return (state: GlobalState, props: Props) => {
        return {
            counts: getAppCounts(state, props.name),
        };
    };
}

export default connect(makeMapStateToProps)(AppIcon);
