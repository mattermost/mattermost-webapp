// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {autoUpdateTimezone} from 'mattermost-redux/actions/timezone';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';
import {getLicense, getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser, shouldShowTermsOfService} from 'mattermost-redux/selectors/entities/users';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Channel} from 'mattermost-redux/types/channels';

import {browserHistory} from 'utils/browser_history';
import {checkIfMFARequired} from 'utils/route';
import {getChannelURL} from 'utils/utils';

import {GlobalState} from 'types/store';

import LoggedIn from './logged_in';

export declare type GetStateFunc = () => GlobalState;

type Props = {
    match: {
        url: string;
    }
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const license = getLicense(state);
    const config = getConfig(state);
    const showTermsOfService = shouldShowTermsOfService(state);

    return {
        currentUser: getCurrentUser(state),
        currentChannelId: getCurrentChannelId(state),
        mfaRequired: checkIfMFARequired(getCurrentUser(state), license, config, ownProps.match.url),
        enableTimezone: config.ExperimentalTimezone === 'true',
        showTermsOfService,
    };
}

// NOTE: suggestions where to keep this welcomed
const getChannelURLAction = (channel: Channel, teamId: string) => (dispatch: Dispatch, getState: GetStateFunc) => browserHistory.push(getChannelURL(getState(), channel, teamId));

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            autoUpdateTimezone,
            getChannelURLAction,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoggedIn);
