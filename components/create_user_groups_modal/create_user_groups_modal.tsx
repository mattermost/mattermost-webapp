// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Modal} from 'react-bootstrap';

import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/types/users';

import {ModalIdentifiers} from 'utils/constants';

import * as Utils from 'utils/utils.jsx';
import {GroupCreateWithUserIds} from 'mattermost-redux/types/groups';

import 'components/user_groups_modal/user_groups_modal.scss';
import './create_user_groups_modal.scss';
import {ModalData} from 'types/actions';
import Input from 'components/input';
import AddUserToGroupMultiSelect from 'components/add_user_to_group_multiselect';
import {ActionResult} from 'mattermost-redux/types/actions';
import UserGroupsModal from 'components/user_groups_modal';
import LocalizedIcon from 'components/localized_icon';
import {t} from 'utils/i18n';

export type Props = {
    onExited: () => void;
    showBackButton?: boolean;
    actions: {
        createGroupWithUserIds: (group: GroupCreateWithUserIds) => Promise<ActionResult>;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
}

type State = {
    show: boolean;
    name: string;
    mention: string;
    savingEnabled: boolean;
    usersToAdd: UserProfile[];
}

export default class CreateUserGroupsModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: true,
            name: '',
            mention: '',
            savingEnabled: false,
            usersToAdd: [],
        };
    }

    doHide = () => {
        this.setState({show: false});
    }
    isSaveEnabled = () => {
        return this.state.name.length > 0 && this.state.mention.length > 0 && this.state.usersToAdd.length > 0;
    }
    updateNameState = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        this.setState({name: value});
    }

    updateMentionState = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        this.setState({mention: value});
    }

    private addUserCallback = (usersToAdd: UserProfile[]): void => {
        this.setState({usersToAdd});
    };

    private deleteUserCallback = (usersToAdd: UserProfile[]): void => {
        this.setState({usersToAdd});
    };

    createGroup = async (users?: UserProfile[]) => {
        if (!users || users.length === 0) {
            return;
        }
        const userIds = users.map((user) => {
            return user.id;
        });

        const group = {
            name: this.state.mention,
            display_name: this.state.name,
            allow_reference: true,
            source: 'custom',
            user_ids: userIds,
        };
        const data = await this.props.actions.createGroupWithUserIds(group);

        if (data.error) {

        } else if (this.props.showBackButton) {
            this.goToGroupsModal();
        } else {
            this.doHide();
        }
    }

    goToGroupsModal = () => {
        const {actions} = this.props;

        actions.openModal({
            modalId: ModalIdentifiers.USER_GROUPS,
            dialogType: UserGroupsModal,
        });

        this.props.onExited();
    }

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal user-groups-modal-create'
                show={this.state.show}
                onHide={this.doHide}
                onExited={this.props.onExited}
                role='dialog'
                aria-labelledby='createUserGroupsModalLabel'
                id='createUserGroupsModal'
            >
                <Modal.Header closeButton={true}>
                    {
                        this.props.showBackButton &&
                        <button
                            type='button'
                            className='modal-header-back-button btn-icon'
                            aria-label='Close'
                            onClick={() => {
                                this.goToGroupsModal();
                            }}
                        >
                            <LocalizedIcon
                                className='icon icon-arrow-left'
                                ariaLabel={{id: t('user_groups_modal.goBackLabel'), defaultMessage: 'Back'}}
                            />
                        </button>
                    }

                    <Modal.Title
                        componentClass='h1'
                        id='userGroupsModalLabel'
                    >
                        <FormattedMessage
                            id='user_groups_modal.createTitle'
                            defaultMessage='Create Group'
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
                            <h2>
                                <FormattedMessage
                                    id='user_groups_modal.addPeople'
                                    defaultMessage='Add People'
                                />
                            </h2>
                            <div className='group-add-user'>
                                <AddUserToGroupMultiSelect
                                    multilSelectKey={'addUsersToGroupKey'}
                                    onSubmitCallback={this.createGroup}
                                    skipCommit={true}
                                    focusOnLoad={false}
                                    savingEnabled={this.isSaveEnabled()}
                                    addUserCallback={this.addUserCallback}
                                    deleteUserCallback={this.deleteUserCallback}

                                    // groupId={'c75btzjxfpywp8adikr96q3iur'}
                                    // searchOptions={{
                                    //     not_in_group_id: 'c75btzjxfpywp8adikr96q3iur'
                                    // }}
                                />
                            </div>

                        </form>

                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
