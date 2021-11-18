// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';

import {ModalIdentifiers} from 'utils/constants';

import * as Utils from 'utils/utils.jsx';
import {CustomGroupPatch, Group} from 'mattermost-redux/types/groups';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import 'components/user_groups_modal/user_groups_modal.scss';
import './update_user_group_modal.scss';
import {ModalData} from 'types/actions';
import Input from 'components/input';
import AddUserToGroupMultiSelect from 'components/add_user_to_group_multiselect';
import {ActionResult} from 'mattermost-redux/types/actions';
import UserGroupsModal from 'components/user_groups_modal';
import LocalizedIcon from 'components/localized_icon';
import {t} from 'utils/i18n';
import ViewUserGroupModal from 'components/view_user_group_modal';
import classNames from 'classnames';
import SaveButton from 'components/save_button';

export type Props = {
    onExited: () => void;
    groupId: string;
    group: Group;
    showBackButton?: boolean;
    actions: {
        patchGroup: (groupId: string, group: CustomGroupPatch) => Promise<ActionResult>;
        openModal: <P>(modalData: ModalData<P>) => void;
    },
}

type State = {
    saving: boolean;
    show: boolean;
    name: string;
    mention: string;
    hasUpdated: boolean;
}

export default class UpdateUserGroupModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            saving: false,
            show: true,
            name: this.props.group.display_name,
            mention: this.props.group.name,
            hasUpdated: false,
        };
    }

    doHide = () => {
        this.setState({show: false});
    }
    isSaveEnabled = () => {
        return this.state.name.length > 0 && this.state.mention.length > 0 && this.state.hasUpdated;
    }
    updateNameState = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        console.log('test');
        this.setState({name: value, hasUpdated: true});
    }

    updateMentionState = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        console.log('test');
        this.setState({mention: value, hasUpdated: true});
    }

    patchGroup = async () => {
        this.setState({saving: true});
        const group: CustomGroupPatch = {
            name: this.state.mention,
            display_name: this.state.name,
        };
        const data = await this.props.actions.patchGroup(this.props.groupId, group);

        if (data.error) {
            
        } else {
            this.goToGroupModal();
        }
    }

    goToGroupModal = () => {
        const {actions, groupId} = this.props;

        actions.openModal({
            modalId: ModalIdentifiers.VIEW_USER_GROUP,
            dialogType: ViewUserGroupModal,
            dialogProps: {
                groupId: groupId,
            }
        });

        this.props.onExited();
    }

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal user-groups-modal-update'
                show={this.state.show}
                onHide={this.doHide}
                onExited={this.props.onExited}
                role='dialog'
                aria-labelledby='createUserGroupsModalLabel'
                id='createUserGroupsModal'
            >
                <Modal.Header closeButton={true}>
                    <button
                        type='button'
                        className='modal-header-back-button btn-icon'
                        aria-label='Close'
                        onClick={() => {
                            this.goToGroupModal();
                        }}
                    >
                        <LocalizedIcon
                            className='icon icon-arrow-left'
                            ariaLabel={{id: t('user_groups_modal.goBackLabel'), defaultMessage: 'Back'}}
                        />
                    </button>
                    <Modal.Title
                        componentClass='h1'
                        id='userGroupsModalLabel'
                    >
                        <FormattedMessage
                            id='user_groups_modal.createTitle'
                            defaultMessage='Edit Group Details'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    className='overflow--visible'
                >
                    <div className='user-groups-modal__content'>
                        <form role='form'>
                            <div className='group-name-input-wrapper'>
                                <Input
                                    type='text'
                                    placeholder={Utils.localizeMessage('user_groups_modal.name', 'Name')}
                                    onChange={this.updateNameState}
                                    value={this.state.name}
                                    data-testid='nameInput'
                                    autoFocus={true}
                                />
                            </div>
                            <div className='group-mention-input-wrapper'>
                                <Input
                                    type='text'
                                    placeholder={Utils.localizeMessage('user_groups_modal.mention', 'Mention')}
                                    onChange={this.updateMentionState}
                                    value={this.state.mention}
                                    data-testid='nameInput'
                                />
                            </div>
                            <div className='update-buttons-wrapper'>
                                <button
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.preventDefault();
                                        this.goToGroupModal();
                                    }}
                                    className='btn update-group-back'
                                >
                                    {Utils.localizeMessage('multiselect.backButton', 'Back')}
                                </button>
                                <SaveButton
                                    id='saveItems'
                                    saving={this.state.saving}
                                    disabled={!this.isSaveEnabled()}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.patchGroup();
                                    }}
                                    defaultMessage={Utils.localizeMessage('multiselect.saveDetailsButton', 'Save Details')}
                                    savingMessage={Utils.localizeMessage('multiselect.savingDetailsButton', 'Saving...')}
                                />
                            </div>
                            
                        </form>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
