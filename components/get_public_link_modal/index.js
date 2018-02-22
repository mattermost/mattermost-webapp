import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getFilePublicLink} from 'mattermost-redux/actions/files';
import * as Selectors from 'mattermost-redux/selectors/entities/files';

import GetPublicLinkModal from './get_public_link_modal.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        link: Selectors.getFilePublicLink(state).link,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getFilePublicLink,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GetPublicLinkModal);
