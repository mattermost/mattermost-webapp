// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Modal} from 'react-bootstrap';

import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/types/users';

import * as Utils from 'utils/utils.jsx';
import {Group} from 'mattermost-redux/types/groups';

import 'components/user_groups_modal/user_groups_modal.scss';
import {ModalData} from 'types/actions';
import AddUserToGroupMultiSelect from 'components/add_user_to_group_multiselect';
import {ActionResult} from 'mattermost-redux/types/actions';

import LocalizedIcon from 'components/localized_icon';
import {t} from 'utils/i18n';

export type Props = {
    onExited: () => void;
    groupId: string;
    group: Group;
    backButtonCallback: () => void;
    actions: {
        addUsersToGroup: (groupId: string, userIds: string[]) => Promise<ActionResult>;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
}

type State = {
    show: boolean;
    savingEnabled: boolean;
    usersToAdd: UserProfile[];
}

export default class AddUsersToGroupModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            show: true,
            savingEnabled: false,
            usersToAdd: [],
        };
    }

    doHide = () => {
        this.setState({show: false});
    }
    isSaveEnabled = () => {
        return this.state.usersToAdd.length > 0;
    }

    private addUserCallback = (usersToAdd: UserProfile[]): void => {
        this.setState({usersToAdd});
    };

    private deleteUserCallback = (usersToAdd: UserProfile[]): void => {
        this.setState({usersToAdd});
    };

    addUsersToGroup = async (users?: UserProfile[]) => {
        if (!users || users.length === 0) {
            return;
        }
        const userIds = users.map((user) => {
            return user.id;
        });

        await this.props.actions.addUsersToGroup(this.props.groupId, userIds);

        // if (data.error) {

        // } else {
        this.goBack();
        // }
    }

    goBack = () => {
        this.props.backButtonCallback();
        this.props.onExited();
    }

    render() {
        const {group, groupId} = this.props;
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
                    <button
                        type='button'
                        className='modal-header-back-button btn-icon'
                        aria-label='Close'
                        onClick={() => {
                            this.goBack();
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
                            id='user_groups_modal.addPeopleTitle'
                            defaultMessage='Add people to {group}'
                            values={{
                                group: group.display_name,
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    className='overflow--visible'
                >
                    <div className='user-groups-modal__content'>
                        <form role='form'>
                            <div className='group-add-user'>
                                <AddUserToGroupMultiSelect
                                    multilSelectKey={'addUsersToGroupKey'}
                                    onSubmitCallback={this.addUsersToGroup}
                                    skipCommit={true}
                                    focusOnLoad={false}
                                    savingEnabled={this.isSaveEnabled()}
                                    addUserCallback={this.addUserCallback}
                                    deleteUserCallback={this.deleteUserCallback}
                                    groupId={groupId}
                                    searchOptions={{
                                        not_in_group_id: groupId,
                                    }}
                                    buttonSubmitText={Utils.localizeMessage('multiselect.createGroup', 'Add People')}
                                    buttonSubmitLoadingText={Utils.localizeMessage('multiselect.createGroup', 'Adding...')}
                                    backButtonClick={this.goBack}
                                    backButtonClass={'multiselect-back'}
                                />
                            </div>

                        </form>

                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}
