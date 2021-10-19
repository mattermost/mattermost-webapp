// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {closeModal} from 'actions/views/modals';

import ConfirmModalRedux from './confirm_modal_redux';

const mapDispatchToProps = {
    closeModal,
};

export default connect(null, mapDispatchToProps)(ConfirmModalRedux);
