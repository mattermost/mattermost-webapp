// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {ActionFunc, GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';

import CreateUserGroupsModal, {Props} from './create_user_groups_modal';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getAllAssociatedGroupsForReference, getMyAllowReferencedGroups} from 'mattermost-redux/selectors/entities/groups';
import {getGroups, getGroupsByUserId} from 'mattermost-redux/actions/groups';
import {Group} from 'mattermost-redux/types/groups';
import {ModalData} from 'types/actions';
import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {closeModal, openModal} from 'actions/views/modals';
import {setModalSearchTerm} from 'actions/views/search';

export default connect()(CreateUserGroupsModal);
