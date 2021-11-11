// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';
import {Channel, ChannelStats, ChannelMembership} from 'mattermost-redux/types/channels';

import Constants, { ModalIdentifiers } from 'utils/constants';
import * as UserAgent from 'utils/user_agent';

import ChannelMembersDropdown from 'components/channel_members_dropdown';
import FaSearchIcon from 'components/widgets/icons/fa_search_icon';
import FaSuccessIcon from 'components/widgets/icons/fa_success_icon';
import * as Utils from 'utils/utils.jsx';
import LoadingScreen from 'components/loading_screen';
import { Group, GroupCreateWithUserIds } from 'mattermost-redux/types/groups';
import { Modal } from 'react-bootstrap';
import {browserHistory} from 'utils/browser_history';
import { FormattedMessage } from 'react-intl';

import 'components/user_groups_modal/user_groups_modal.scss';
import './create_user_groups_modal.scss';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import { getCurrentUserId } from 'mattermost-redux/selectors/entities/common';
import { ModalData } from 'types/actions';
import Input from 'components/input';
import AddUserToGroupMultiSelect from 'components/add_user_to_group_multiselect';
import { ActionResult } from 'mattermost-redux/types/actions';
import { RelationOneToOne } from 'mattermost-redux/types/utilities';

export type Props = {
    onExited: () => void;
    actions: {
        createGroupWithUserIds :(group: GroupCreateWithUserIds) => Promise<ActionResult>;
    },
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

    async componentDidMount() {
    }

    componentWillUnmount() {
        // this.props.actions.setModalSearchTerm('');
    }

    componentDidUpdate(prevProps: Props) {
        // if (prevProps.searchTerm !== this.props.searchTerm) {
        //     clearTimeout(this.searchTimeoutId);
        //     const searchTerm = this.props.searchTerm;

        //     if (searchTerm === '') {
        //         this.loadComplete();
        //         this.searchTimeoutId = 0;
        //         return;
        //     }

        //     const searchTimeoutId = window.setTimeout(
        //         async () => {
        //             const {data} = await prevProps.actions.searchProfiles(searchTerm, {team_id: this.props.currentTeamId, in_channel_id: this.props.currentChannelId});

        //             if (searchTimeoutId !== this.searchTimeoutId) {
        //                 return;
        //             }

        //             this.props.actions.loadStatusesForProfilesList(data);
        //             this.props.actions.loadTeamMembersAndChannelMembersForProfilesList(data, this.props.currentTeamId, this.props.currentChannelId).then(({data: membersLoaded}) => {
        //                 if (membersLoaded) {
        //                     this.loadComplete();
        //                 }
        //             });
        //         },
        //         Constants.SEARCH_TIMEOUT_MILLISECONDS,
        //     );

        //     this.searchTimeoutId = searchTimeoutId;
        // }
    }

    searchUsers = () => {

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
            
        } else {
            this.doHide();
        }
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
