import {connect} from 'react-redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import GetChannelLinkModal from './get_channel_link_modal.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        currentTeam: getCurrentTeam(state),
        config: getConfig(state)
    };
}

export default connect(mapStateToProps)(GetChannelLinkModal);
