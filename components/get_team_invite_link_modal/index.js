import {connect} from 'react-redux';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import GetTeamInviteLinkModal from './get_team_invite_link_modal.jsx';

const mapStateToProps = (state) => ({
    currentTeam: getCurrentTeam(state),
    config: getConfig(state)
});

export default connect(mapStateToProps)(GetTeamInviteLinkModal);
