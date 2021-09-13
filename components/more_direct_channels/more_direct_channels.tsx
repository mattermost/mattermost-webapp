// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps, ReactNode} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {debounce, partition, differenceBy} from 'lodash';
import classNames from 'classnames';

import {Client4} from 'mattermost-redux/client';
import {Channel} from 'mattermost-redux/types/channels';
import {RelationOneToOne} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';
import {GenericAction} from 'mattermost-redux/types/actions';

import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants';
import {displayEntireNameForUser, localizeMessage, isGuest, isMobile} from 'utils/utils.jsx';
import MultiSelect, {Value} from 'components/multiselect/multiselect';
import ProfilePicture from 'components/profile_picture';
import AddIcon from 'components/widgets/icons/fa_add_icon';
import GuestBadge from 'components/widgets/badges/guest_badge';
import BotBadge from 'components/widgets/badges/bot_badge';
import Timestamp from 'components/timestamp';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = Constants.MAX_USERS_IN_GM - 1;

export const TIME_SPEC: ComponentProps<typeof Timestamp> = {
    useTime: false,
    style: 'long',
    ranges: [
        {within: ['minute', -1], display: ['second', 0]},
        {within: ['hour', -1], display: ['minute']},
        {within: ['hour', -24], display: ['hour']},
        {within: ['day', -30], display: ['day']},
        {within: ['month', -11], display: ['month']},
        {within: ['year', -1000], display: ['year']},
    ],
};

export type GroupChannel = Channel & {profiles: UserProfile[]};

function isGroupChannel(option: UserProfile | GroupChannel): option is GroupChannel {
    return (option as GroupChannel)?.type === 'G';
}

export type Option = (UserProfile | GroupChannel) & {last_post_at?: number};
export type OptionValue = Option & Value;

function optionValue(option: Option): OptionValue {
    return {
        value: option.id,
        label: isGroupChannel(option) ? option.display_name : option.username,
        ...option,
    };
}

type Props = {
    currentUserId: string;
    currentTeamId: string;
    currentTeamName: string;
    searchTerm: string;
    users: UserProfile[];
    groupChannels: GroupChannel[];
    myDirectChannels: Channel[];
    recentDMUsers?: Array<UserProfile & {last_post_at: number }>;
    statuses: RelationOneToOne<UserProfile, string>;
    totalCount?: number;

    /*
    * List of current channel members of existing channel
    */
    currentChannelMembers: UserProfile[];

    /*
    * Whether the modal is for existing channel or not
    */
    isExistingChannel: boolean;

    /*
    * The mode by which direct messages are restricted, if at all.
    */
    restrictDirectMessage?: string;
    onModalDismissed: () => void;
    onHide?: () => void;
    actions: {
        getProfiles: (page?: number | undefined, perPage?: number | undefined, options?: any) => Promise<any>;
        getProfilesInTeam: (teamId: string, page: number, perPage?: number | undefined, sort?: string | undefined, options?: any) => Promise<any>;
        loadStatusesByIds: (userIds: string[]) => void;
        getTotalUsersStats: () => void;
        loadStatusesForProfilesList: (users: any) => {
            data: boolean;
        };
        loadProfilesForGroupChannels: (groupChannels: any) => void;
        openDirectChannelToUserId: (userId: any) => Promise<any>;
        openGroupChannelToUserIds: (userIds: any) => Promise<any>;
        searchProfiles: (term: string, options?: any) => Promise<any>;
        searchGroupChannels: (term: string) => Promise<any>;
        setModalSearchTerm: (term: any) => GenericAction;
    };
}

type State = {
    values: OptionValue[];
    show: boolean;
    search: boolean;
    saving: boolean;
    loadingUsers: boolean;
}

export default class MoreDirectChannels extends React.PureComponent<Props, State> {
    searchTimeoutId: any;
    exitToChannel?: string;
    multiselect: React.RefObject<MultiSelect<OptionValue>>;
    selectedItemRef: React.RefObject<HTMLDivElement>;
    constructor(props: Props) {
        super(props);

        this.searchTimeoutId = 0;
        this.multiselect = React.createRef();
        this.selectedItemRef = React.createRef();

        const values: OptionValue[] = [];

        if (props.currentChannelMembers) {
            for (let i = 0; i < props.currentChannelMembers.length; i++) {
                const user = Object.assign({}, props.currentChannelMembers[i]);

                if (user.id === props.currentUserId) {
                    continue;
                }

                values.push(optionValue(user));
            }
        }

        this.state = {
            values,
            show: true,
            search: false,
            saving: false,
            loadingUsers: true,
        };
    }

    loadModalData = () => {
        this.getUserProfiles();
        this.props.actions.getTotalUsersStats();
        this.loadProfilesMissingStatus(this.props.users, this.props.statuses);
    }

    updateFromProps(prevProps: Props) {
        if (prevProps.searchTerm !== this.props.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = this.props.searchTerm;
            if (searchTerm === '') {
                this.resetPaging();
            } else {
                const teamId = this.props.restrictDirectMessage === 'any' ? '' : this.props.currentTeamId;

                this.searchTimeoutId = setTimeout(
                    async () => {
                        this.setUsersLoadingState(true);
                        const [{data: profilesData}, {data: groupChannelsData}] = await Promise.all([
                            this.props.actions.searchProfiles(searchTerm, {team_id: teamId}),
                            this.props.actions.searchGroupChannels(searchTerm),
                        ]);
                        if (profilesData) {
                            this.props.actions.loadStatusesForProfilesList(profilesData);
                        }
                        if (groupChannelsData) {
                            this.props.actions.loadProfilesForGroupChannels(groupChannelsData);
                        }
                        this.resetPaging();
                        this.setUsersLoadingState(false);
                    },
                    Constants.SEARCH_TIMEOUT_MILLISECONDS,
                );
            }
        }

        if (
            prevProps.users.length !== this.props.users.length ||
            Object.keys(prevProps.statuses).length !== Object.keys(this.props.statuses).length
        ) {
            this.loadProfilesMissingStatus(this.props.users, this.props.statuses);
        }
    }

    componentDidUpdate(prevProps: Props) {
        this.updateFromProps(prevProps);
    }

    public loadProfilesMissingStatus = (users: UserProfile[] = [], statuses: RelationOneToOne<UserProfile, string> = {}) => {
        const missingStatusByIds = users.
            filter((user) => !statuses[user.id]).
            map((user) => user.id);

        if (missingStatusByIds.length > 0) {
            this.props.actions.loadStatusesByIds(missingStatusByIds);
        }
    }

    handleHide = () => {
        this.props.actions.setModalSearchTerm('');
        this.setState({show: false});
    }

    setUsersLoadingState = (loadingState: boolean) => {
        this.setState({
            loadingUsers: loadingState,
        });
    }

    handleExit = () => {
        if (this.exitToChannel) {
            browserHistory.push(this.exitToChannel);
        }

        this.props.onModalDismissed?.();
        this.props.onHide?.();
    }

    handleSubmit = (values = this.state.values) => {
        const {actions} = this.props;
        if (this.state.saving) {
            return;
        }

        const userIds = values.map((v) => v.id);
        if (userIds.length === 0) {
            return;
        }

        this.setState({saving: true});

        const done = (result: any) => {
            const {data, error} = result;
            this.setState({saving: false});

            if (!error) {
                this.exitToChannel = '/' + this.props.currentTeamName + '/channels/' + data.name;
                this.handleHide();
            }
        };

        if (userIds.length === 1) {
            actions.openDirectChannelToUserId(userIds[0]).then(done);
        } else {
            actions.openGroupChannelToUserIds(userIds).then(done);
        }
    };

    addValue = (value: OptionValue) => {
        if (isGroupChannel(value)) {
            this.addUsers(value.profiles);
        } else {
            const values = Object.assign([], this.state.values);

            if (values.indexOf(value) === -1) {
                values.push(value);
            }

            this.setState({values});
        }
    };

    addUsers = (users: UserProfile[]) => {
        const values: OptionValue[] = Object.assign([], this.state.values);
        const existingUserIds = values.map((user) => user.id);
        for (const user of users) {
            if (existingUserIds.indexOf(user.id) !== -1) {
                continue;
            }
            values.push(optionValue(user));
        }

        this.setState({values});
    };

    getUserProfiles = (page?: number) => {
        const pageNum = page ? page + 1 : 0;
        if (this.props.restrictDirectMessage === 'any') {
            this.props.actions.getProfiles(pageNum, USERS_PER_PAGE * 2).then(() => {
                this.setUsersLoadingState(false);
            });
        } else {
            this.props.actions.getProfilesInTeam(this.props.currentTeamId, pageNum, USERS_PER_PAGE * 2).then(() => {
                this.setUsersLoadingState(false);
            });
        }
    }

    handlePageChange = (page: number, prevPage: number) => {
        if (page > prevPage) {
            this.setUsersLoadingState(true);
            this.getUserProfiles(page);
        }
    }

    resetPaging = () => {
        this.multiselect.current?.resetPaging();
    }

    search = debounce((term: string) => {
        this.props.actions.setModalSearchTerm(term);
    }, 250);

    handleDelete = (values: OptionValue[]) => {
        this.setState({values});
    }

    renderAriaLabel = (option: OptionValue) => {
        return (option as UserProfile)?.username ?? '';
    }
    optionDisplayParts = (option: OptionValue): ReactNode => {
        if (isGroupChannel(option)) {
            return (
                <>
                    <div className='more-modal__gm-icon bg-text-200'>
                        {option.profiles.length}
                    </div>
                    <div className='more-modal__details'>
                        <div className='more-modal__name'>
                            <span>
                                {option.profiles.map((profile) => `@${profile.username}`).join(', ')}
                            </span>
                        </div>
                    </div>
                </>
            );
        }

        const {
            id,
            delete_at: deleteAt,
            is_bot: isBot = false,
            last_picture_update: lastPictureUpdate,
        } = option;

        const displayName = displayEntireNameForUser(option);

        let modalName: ReactNode = displayName;
        if (option.id === this.props.currentUserId) {
            modalName = (
                <FormattedMessage
                    id='more_direct_channels.directchannel.you'
                    defaultMessage='{displayname} (you)'
                    values={{
                        displayname: displayName,
                    }}
                />
            );
        } else if (option.delete_at) {
            modalName = (
                <FormattedMessage
                    id='more_direct_channels.directchannel.deactivated'
                    defaultMessage='{displayname} - Deactivated'
                    values={{
                        displayname: displayName,
                    }}
                />
            );
        }

        return (
            <>
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(id, lastPictureUpdate)}
                    status={!deleteAt && !isBot ? this.props.statuses[id] : undefined}
                    size='md'
                />
                <div className='more-modal__details'>
                    <div className='more-modal__name'>
                        {modalName}
                        <BotBadge
                            show={isBot}
                            className='badge-popoverlist'
                        />
                        <GuestBadge
                            show={isGuest(option)}
                            className='badge-popoverlist'
                        />
                        <CustomStatusEmoji
                            userID={option.id}
                            showTooltip={true}
                            emojiSize={15}
                        />
                    </div>
                    {!isBot && (
                        <div className='more-modal__description'>
                            {option.email}
                        </div>
                    )}
                </div>
            </>
        );
    }

    renderValue(props: {data: OptionValue}) {
        return (props.data as UserProfile).username;
    }

    handleSubmitImmediatelyOn = (value: OptionValue) => {
        return value.id === this.props.currentUserId || Boolean(value.delete_at);
    }

    note = (): ReactNode => {
        let note;
        if (this.props.currentChannelMembers) {
            if (this.state.values && this.state.values.length >= MAX_SELECTABLE_VALUES) {
                note = (
                    <FormattedMessage
                        id='more_direct_channels.new_convo_note.full'
                        defaultMessage={'You\'ve reached the maximum number of people for this conversation. Consider creating a private channel instead.'}
                    />
                );
            } else if (this.props.isExistingChannel) {
                note = (
                    <FormattedMessage
                        id='more_direct_channels.new_convo_note'
                        defaultMessage={'This will start a new conversation. If you\'re adding a lot of people, consider creating a private channel instead.'}
                    />
                );
            }
        }
        return note;
    }

    renderOptionValue = (
        option: OptionValue,
        isSelected: boolean,
        add: (value: OptionValue) => void,
        select: (value: OptionValue) => void,
    ) => {
        const {id, last_post_at: lastPostAt} = option;

        return (
            <div
                key={id}
                ref={isSelected ? this.selectedItemRef : option.id}
                className={classNames('more-modal__row clickable', {'more-modal__row--selected': isSelected})}
                onClick={() => add(option)}
                onMouseEnter={() => select(option)}
            >
                {this.optionDisplayParts(option)}

                {!isMobile() && Boolean(lastPostAt) &&
                    <div className='more-modal__lastPostAt'>
                        <Timestamp
                            {...TIME_SPEC}
                            value={lastPostAt}
                        />
                    </div>
                }

                <div className='more-modal__actions'>
                    <div className='more-modal__actions--round'>
                        <AddIcon/>
                    </div>
                </div>
            </div>
        );
    }

    computeOptions = (): Option[] => {
        const {
            currentUserId,
            searchTerm,
            myDirectChannels,
            recentDMUsers = [],
        } = this.props;

        const {values} = this.state;

        const [activeUsers, inactiveUsers] = partition(this.props.users, ({delete_at: deleteAt}) => deleteAt === 0);

        const groupChannelsWithAvailableProfiles = this.props.groupChannels.filter(({profiles}) => differenceBy(profiles, values, 'id').length);
        const [recentGroupChannels, groupChannels] = partition(groupChannelsWithAvailableProfiles, 'last_post_at');

        let users = values.length ? activeUsers.filter(({id}) => id !== currentUserId) : activeUsers.concat(inactiveUsers);

        users = users.filter((user) => (
            (user.delete_at === 0 || myDirectChannels.some(({name}) => name.includes(user.id))) &&
            !recentDMUsers.some(({id}) => id === user.id)
        ));

        const recent = [
            ...values.length ? recentDMUsers.filter(({id}) => id !== currentUserId) : recentDMUsers,
            ...recentGroupChannels,
        ].sort((a, b) => b.last_post_at - a.last_post_at);

        if (recent.length && !searchTerm) {
            return recent.slice(0, 20);
        }

        return [
            ...recent,
            ...users,
            ...groupChannels,
        ];
    }

    render() {
        const {values} = this.state;

        const buttonSubmitText = localizeMessage('multiselect.go', 'Go');
        const buttonSubmitLoadingText = localizeMessage('multiselect.loading', 'Loading..');

        const numRemainingText = (
            <FormattedMessage
                id='multiselect.numPeopleRemaining'
                defaultMessage='Use ↑↓ to browse, ↵ to select. You can add {num, number} more {num, plural, one {person} other {people}}. '
                values={{
                    num: MAX_SELECTABLE_VALUES - values.length,
                }}
            />
        );

        const body = (
            <MultiSelect<OptionValue>
                key='moreDirectChannelsList'
                ref={this.multiselect}
                options={this.computeOptions().map(optionValue)}
                optionRenderer={this.renderOptionValue}
                selectedItemRef={this.selectedItemRef}
                values={this.state.values}
                valueRenderer={this.renderValue}
                ariaLabelRenderer={this.renderAriaLabel}
                perPage={USERS_PER_PAGE}
                handlePageChange={this.handlePageChange}
                handleInput={this.search}
                handleDelete={this.handleDelete}
                handleAdd={this.addValue}
                handleSubmit={this.handleSubmit}
                noteText={this.note()}
                maxValues={MAX_SELECTABLE_VALUES}
                numRemainingText={numRemainingText}
                buttonSubmitText={buttonSubmitText}
                buttonSubmitLoadingText={buttonSubmitLoadingText}
                submitImmediatelyOn={this.handleSubmitImmediatelyOn}
                saving={this.state.saving}
                loading={this.state.loadingUsers}
                users={this.props.users}
                totalCount={this.props.totalCount}
                placeholderText={localizeMessage('multiselect.placeholder', 'Search and add members')}
            />
        );

        return (
            <Modal
                dialogClassName='a11y__modal more-modal more-direct-channels'
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
                onEntered={this.loadModalData}
                role='dialog'
                aria-labelledby='moreDmModalLabel'
                id='moreDmModal'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title
                        componentClass='h1'
                        id='moreDmModalLabel'
                    >
                        <FormattedMessage
                            id='more_direct_channels.title'
                            defaultMessage='Direct Messages'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body
                    role='application'
                >
                    {body}
                </Modal.Body>
                <Modal.Footer className='modal-footer--invisible'>
                    <button
                        id='closeModalButton'
                        type='button'
                        className='btn btn-link'
                    >
                        <FormattedMessage
                            id='general_button.close'
                            defaultMessage='Close'
                        />
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
