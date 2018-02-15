// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateUserRoles} from 'mattermost-redux/actions/users';

import ManageRolesModal from './manage_roles_modal.jsx';

const mapStateToProps = (state) => ({
    userAccessTokensEnabled: state.entities.admin.config.ServiceSettings.EnableUserAccessTokens
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        updateUserRoles
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageRolesModal);
