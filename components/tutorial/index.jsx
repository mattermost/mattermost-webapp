import {connect} from 'react-redux';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';

import Constants from 'utils/constants.jsx';

import TutorialView from './tutorial_view.jsx';

function mapStateToProps(state, ownProps) {
    const license = state.entities.general.license;
    const config = state.entities.general.config;

    const teamChannels = getChannelsNameMapInCurrentTeam(state);
    const townSquare = teamChannels[Constants.DEFAULT_CHANNEL];
    const townSquareDisplayName = townSquare ? townSquare.display_name : Constants.DEFAULT_CHANNEL_UI_NAME;

    const appDownloadLink = config.AppDownloadLink;
    const isLicensed = license.IsLicensed === 'true';
    const restrictTeamInvite = config.RestrictTeamInvite;
    const supportEmail = config.SupportEmail;

    return {
        ...ownProps,
        townSquareDisplayName,
        appDownloadLink,
        isLicensed,
        restrictTeamInvite,
        supportEmail
    };
}

export default connect(mapStateToProps)(TutorialView);
