// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';

import CreateTeamController from './create_team_controller.jsx';

function mapStateToProps(state, ownProps) {
    const config = state.entities.general.config;
    const license = state.entities.general.license;

    const isLicensed = license.IsLicensed === 'true';
    const customBrand = license.CustomBrand === 'true';
    const enableCustomBrand = config.EnableCustomBrand === 'true';
    const customDescriptionText = config.CustomDescriptionText;
    const siteName = config.SiteName;

    return {
        ...ownProps,
        isLicensed,
        customBrand,
        enableCustomBrand,
        customDescriptionText,
        siteName
    };
}

export default connect(mapStateToProps)(CreateTeamController);
