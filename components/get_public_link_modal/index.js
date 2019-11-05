// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';
import * as Selectors from 'mattermost-redux/selectors/entities/files';

import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import GetPublicLinkModal from './get_public_link_modal.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.GET_PUBLIC_LINK;
    const show = isModalOpen(state, modalId);
    return {
        link: Selectors.getFilePublicLink(state).link,
        show,
    };
}

export default connect(mapStateToProps)(GetPublicLinkModal);
