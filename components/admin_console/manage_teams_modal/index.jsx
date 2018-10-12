// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentLocale} from 'selectors/i18n';

import ManageTeamsModal from './manage_teams_modal';

function mapStateToProps(state) {
    return {
        locale: getCurrentLocale(state),
    };
}

export default connect(mapStateToProps)(ManageTeamsModal);
