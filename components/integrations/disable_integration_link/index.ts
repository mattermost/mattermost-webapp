// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {openModal} from 'actions/views/modals';

import DisableIntegrationLink from './disable_integration_link';

const mapDispatchToProps = {
    openModal,
};

export default connect(null, mapDispatchToProps)(DisableIntegrationLink);
