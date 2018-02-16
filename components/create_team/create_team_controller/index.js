// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import CreateTeamController from './create_team_controller.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);

    const isLicensed = license.IsLicensed === 'true';
    const customBrand = license.CustomBrand === 'true';
    const enableCustomBrand = config.EnableCustomBrand === 'true';
    const customDescriptionText = config.CustomDescriptionText;
    const siteName = config.SiteName;

    return {
        isLicensed,
        customBrand,
        enableCustomBrand,
        customDescriptionText,
        siteName
    };
}

export default connect(mapStateToProps)(CreateTeamController);
