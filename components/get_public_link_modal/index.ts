// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {getFilePublicLink} from 'mattermost-redux/actions/files';
import * as Selectors from 'mattermost-redux/selectors/entities/files';

import GetPublicLinkModal from './get_public_link_modal';
import { GlobalState } from 'mattermost-redux/types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

function mapStateToProps(state: GlobalState) {
    return {
        link: Selectors.getFilePublicLink(state)?.link || '',
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            getFilePublicLink,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GetPublicLinkModal);
