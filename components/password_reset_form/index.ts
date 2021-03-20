// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {resetUserPassword} from 'mattermost-redux/actions/users';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import PasswordResetForm from './password_reset_form';

type Actions = {
    resetUserPassword: (token: string, newPassword: string) => any;
}
function mapStateToProps(state: GlobalState) {
    const {SiteName: siteName} = getConfig(state);
    return {siteName};
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            resetUserPassword,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PasswordResetForm);
