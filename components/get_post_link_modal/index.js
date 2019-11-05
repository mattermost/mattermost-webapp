// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {getSiteURL} from 'utils/url';

import GetPostLinkModal from './get_post_link_modal';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.GET_POST_LINK;
    const show = isModalOpen(state, modalId);

    const currentTeam = getCurrentTeam(state) || {};
    const currentTeamUrl = `${getSiteURL()}/${currentTeam.name}`;
    return {
        currentTeamUrl,
        show,
    };
}

export default connect(mapStateToProps)(GetPostLinkModal);
