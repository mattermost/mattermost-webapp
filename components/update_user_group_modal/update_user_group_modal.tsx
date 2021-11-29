// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Modal} from 'react-bootstrap';

import {FormattedMessage} from 'react-intl';

import {ModalIdentifiers} from 'utils/constants';

import * as Utils from 'utils/utils.jsx';
import {CustomGroupPatch, Group} from 'mattermost-redux/types/groups';

import 'components/user_groups_modal/user_groups_modal.scss';
import './update_user_group_modal.scss';
import {ModalData} from 'types/actions';
import Input from 'components/input';
import {ActionResult} from 'mattermost-redux/types/actions';
import LocalizedIcon from 'components/localized_icon';
import {t} from 'utils/i18n';

import SaveButton from 'components/save_button';

export type Props = {
    onExited: () => void;
    groupId: string;
    group: Group;
    showBackButton?: boolean;
    backButtonCallback: () => void;
    actions: {
        patchGroup: (groupId: string, group: CustomGroupPatch) => Promise<ActionResult>;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
}

type State = {
    saving: boolean;
    show: boolean;
    name: string;
    mention: string;
    hasUpdated: boolean;
    mentionInputErrorText: string;
    nameInputErrorText: string;
    showUnknownError: boolean;
}

export default class UpdateUserGroupModal extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            saving: false,
            show: true,
            name: this.props.group.display_name,
            mention: this.props.group.name,
            mentionInputErrorText: '',
            nameInputErrorText: '',
            hasUpdated: false,
            showUnknownError: false,
        };
    }

    doHide = () => {
        this.setState({show: false});
    }

    isSaveEnabled = () => {
        return this.state.name.length > 0 && this.state.mention.length > 0 && this.state.hasUpdated && !this.state.saving;
    }

    updateNameState = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        this.setState({name: value, hasUpdated: true});
    }

    updateMentionState = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        this.setState({mention: value, hasUpdated: true});
    }

    patchGroup = async () => {
        this.setState({saving: true, showUnknownError: false, mentionInputErrorText: ''});
        const group: CustomGroupPatch = {
            name: this.state.mention,
            display_name: this.state.name,
        };
        const data = await this.props.actions.patchGroup(this.props.groupId, group);
        if (data.error) {
            if (data.error.server_error_id === 'app.group.save_not_unique.name_error') {
                this.setState({mentionInputErrorText: Utils.localizeMessage('user_groups_modal.mentionNotUnique', 'Mention needs to be unique.')});
            } else {
                this.setState({showUnknownError: true});
            }
        } else {
            this.goBack();
        }
    }
    goBack = () => {
        this.props.backButtonCallback();
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
                            id='user_groups_modal.editGroupTitle'
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
                                    error={this.state.nameInputErrorText}
                                />
                            </div>
                            <div className='group-mention-input-wrapper'>
                                <Input
                                    type='text'
                                    placeholder={Utils.localizeMessage('user_groups_modal.mention', 'Mention')}
                                    onChange={this.updateMentionState}
                                    value={this.state.mention}
                                    data-testid='nameInput'
                                    error={this.state.mentionInputErrorText}
                                />
                            </div>
                            <div className='update-buttons-wrapper'>
                                {
                                    this.state.showUnknownError &&
                                    <div className='Input___error group-error'>
                                        <i className='icon icon-alert-outline'/>
                                        <FormattedMessage
                                            id='user_groups_modal.unknownError'
                                            defaultMessage='An unknown error has occurred.'
                                        />
                                    </div>
                                }
                                <button
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.preventDefault();
                                        this.goBack();
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
