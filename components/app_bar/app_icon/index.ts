// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {makeGetNotificationCounts} from 'mattermost-redux/selectors/entities/notifications';

import {GlobalState} from 'types/store';

import AppIcon, {Props} from './app_icon';

function makeMapStateToProps() {
    const getNotificationCounts = makeGetNotificationCounts();

    return (state: GlobalState, props: Props) => {
        return {
            counts: getNotificationCounts(state, props.name),
        };
    };
}

export default connect(makeMapStateToProps)(AppIcon);
