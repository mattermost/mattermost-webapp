// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getFilePublicLink} from 'mattermost-redux/actions/files';
import * as Selectors from 'mattermost-redux/selectors/entities/files';

import GetPublicLinkModal from './get_public_link_modal.jsx';

function mapStateToProps(state) {
    return {
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
