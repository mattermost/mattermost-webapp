// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {getCurrentTeamId, getTeams} from 'mattermost-redux/selectors/entities/teams';
import {getChannelsInAllTeams} from 'mattermost-redux/selectors/entities/channels';
import {CommandPaletteEntities} from 'components/command_palette/types';
import Constants, {ModalIdentifiers} from 'utils/constants';
import {isKeyPressed} from 'utils/utils';

import {switchToChannel} from '../../../actions/views/channel';
import {openModal} from '../../../actions/views/modals';
import {GlobalState} from '../../../types/store';
import {browserHistory} from '../../../utils/browser_history';
import CustomStatusModal from '../../custom_status/custom_status_modal';
import InvitationModal from '../../invitation_modal';
import UserGroupsModal from '../../user_groups_modal';
import UserSettingsModal from '../../user_settings/modal';
import LoadingSpinner from '../../widgets/loading/loading_spinner';
import {CommandPaletteList} from '../command_palette_list/command_palette_list';
import {CommandPaletteItem} from '../command_palette_list_item/command_palette_list_item';
import {GotoListItemConstants, GotoListItemData} from '../constant';
import {channelToCommandPaletteItemTransformer, userToCommandPaletteItemTransform} from '../utils';
import './command_palette_modal.scss';

import {DispatchFunc} from 'mattermost-redux/types/actions';
import SwitchChannelProvider from 'components/suggestion/switch_channel_provider';

import Filters from './filters';
import Footer from './footer';
import Input from './input';

interface Props {
    selectedEntities: CommandPaletteEntities[];
    onExited: () => void;
    actions: {
        autocompleteUsersInTeam: (username: string) => DispatchFunc | any;
    };
}

type ProviderResults = {
    matchedPretext: string;
    terms: string[];

    // The providers currently do not provide a clearly defined type and structure
    items: Array<Record<string, any>>;
    component?: React.ReactNode;
}

enum ChipType {
    IN = 'IN',
    FROM = 'FROM',
}

const defaultEnities = [CommandPaletteEntities.Channel, CommandPaletteEntities.Playbooks, CommandPaletteEntities.Boards];

const CommandPaletteModal = ({onExited, selectedEntities, actions}: Props) => {
    const [modalVisibility, setModalVisibility] = useState(true);
    const [isLoading, setLoading] = useState(true);
    const [transformedItems, setTransformedItems] = useState<CommandPaletteItem[]>([]);
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const CommandPaletteModalLabel = formatMessage({id: 'CommandPalette.modal', defaultMessage: 'Command Palette Modal'}).toLowerCase();

    const [chips, setChips] = useState<string[]>([]);
    const [entities, setEntities] = useState<CommandPaletteEntities[]>(selectedEntities || []);
    const [isCommandVisible, setIsCommandVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchPrefix, setSearchPrefix] = useState('');
    const currentTeamId = useSelector(getCurrentTeamId);
    const teams = useSelector(getTeams);

    const {current: provider} = useRef<SwitchChannelProvider>(new SwitchChannelProvider());

    const [currentChipType, setCurrentChipType] = useState<ChipType | null>(null);

    const pluginsList = useSelector((state: GlobalState) => state.plugins.plugins);
    const isBoardsEnabled = Boolean(pluginsList.focalboard);
    const isPlaybooksEnabled = Boolean(pluginsList.playbooks);

    const searchPrefixMap: {
        [key: string]: {
            enabled: boolean;
            entity: CommandPaletteEntities;
        };
    } = useMemo(() => ({
        '~': {
            enabled: true,
            entity: CommandPaletteEntities.Channel,
        },
        '!': {
            enabled: isPlaybooksEnabled,
            entity: CommandPaletteEntities.Playbooks,
        },
        '*': {
            enabled: isBoardsEnabled,
            entity: CommandPaletteEntities.Boards,
        },
    }), [isBoardsEnabled, isPlaybooksEnabled]);

    const searchHandler = useSelector((state: GlobalState) => state.plugins.syncSearchHandlers.focalboard);
    const recentHandler = useSelector((state: GlobalState) => {
        return state.plugins.recentlyViewedHandlers.focalboard;
    });
    const recentChannels = useSelector(getChannelsInAllTeams);
    const channelsTransformedItems = channelToCommandPaletteItemTransformer(recentChannels, teams);
    const boardsTransformedItems: CommandPaletteItem[] = [];
    const recentBoards = useCallback(async () => {
        // const recentData: any = await recentHandler();
        // if (recentData) {
        //     boardsTransformedItems = boardToCommandPaletteItemTransformer(recentData, teams);
        //     setTransformedItems([...boardsTransformedItems, ...channelsTransformedItems]);
        //     setLoading(false);
        // }
        setTransformedItems([...channelsTransformedItems]);
        setLoading(false);
    }, [currentTeamId]);

    const searchBoards = useCallback(async (query: string) => {
        // const searchData: any = await searchHandler(currentTeamId, query);
        // if (searchData) {
        //     boardsTransformedItems = boardToCommandPaletteItemTransformer(searchData, teams);
        //     setTransformedItems([...boardsTransformedItems, ...channelsTransformedItems]);
        //     setLoading(false);
        // }
        setTransformedItems([...boardsTransformedItems, ...channelsTransformedItems]);
        setLoading(false);
    }, [currentTeamId]);

    useEffect(() => {
        recentBoards();
    }, [recentBoards]);

    // Channel Autocomplete
    const autocompleteChannels = useCallback(async (term: string) => {
        let channelPrefix = term;
        const isAtSearch = channelPrefix.startsWith('@');
        if (isAtSearch) {
            channelPrefix = channelPrefix.replace(/^@/, '');
        }

        const handleResults = (res: ProviderResults) => {
            const t = res.items.map((item) => item.channel);

            const channels = channelToCommandPaletteItemTransformer(t, teams);
            setTransformedItems([...channels]);
        };

        provider.handlePretextChangedForChannelSearch(channelPrefix, handleResults);
    }, [provider, teams]);

    // User Autocomplete
    const autocompleteUsers = useCallback(async (term: string) => {
        const usernamePrefix = term;

        const data = await actions.autocompleteUsersInTeam(usernamePrefix);
        const users = userToCommandPaletteItemTransform(data.users);
        setTransformedItems([...users]);
    }, [actions]);

    const addChip = useCallback((chip: string) => {
        if (searchPrefix) {
            setSearchPrefix('');
        }
        setChips((chips: string[]) => {
            if (chips.indexOf(chip) === -1) {
                return [...chips, chip];
            }
            return chips;
        });
    }, [searchPrefix]);

    const removeChip = useCallback((index: number) => {
        setChips((chips: string[]) => chips.filter((_, i) => i !== index));
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (searchTerm.trim().length && isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            addChip(searchTerm);
            setSearchTerm('');
        } else if (isKeyPressed(e, Constants.KeyCodes.BACKSPACE) && !searchTerm.trim()) {
            if (searchPrefix) {
                setSearchPrefix('');
                setEntities(selectedEntities || []);
            } else if (chips.length) {
                removeChip(chips.length - 1);
            }
        }
    }, [addChip, chips.length, removeChip, searchPrefix, searchTerm, selectedEntities]);

    const toggleFilter = useCallback((entity: CommandPaletteEntities) => {
        if (entities.includes(entity)) {
            const newEntities = entities.filter((e) => e !== entity);
            setEntities(newEntities);
        } else if (entity === CommandPaletteEntities.GoTo) {
            setEntities([entity]);
            setTransformedItems(GotoListItemData);
        } else {
            setEntities([...entities, entity]);
        }
    }, [entities, setEntities]);

    const toggleCommandVisibility = useCallback(() => {
        setIsCommandVisible((isCommandVisible) => !isCommandVisible);
    }, []);

    const updateCurrentChip = useCallback((query) => {
        if (searchPrefix === '~') {
            autocompleteChannels(query);
        } else {
            const capturedChannel = (/\b(?:in|channel):\s*(\S*)$/i).exec(query.toLowerCase());
            const capturedUser = (/\bfrom:\s*(\S*)$/i).exec(query.toLowerCase());

            if (capturedChannel) {
                setCurrentChipType(ChipType.IN);
                autocompleteChannels(capturedChannel[1]);
            } else if (capturedUser) {
                setCurrentChipType(ChipType.FROM);
                autocompleteUsers(capturedUser[1]);
            }
        }
    }, [searchPrefix, autocompleteChannels, autocompleteUsers]);

    const updateSearchTerm = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        if (!chips.length && !searchTerm.trim() && searchPrefixMap[query]?.enabled) {
            setSearchPrefix(query);
            setEntities([searchPrefixMap[query].entity]);
        } else {
            setSearchTerm(e.target.value);
            searchBoards(query);
        }

        updateCurrentChip(query);
    }, [chips.length, searchTerm, searchPrefixMap, updateCurrentChip, searchBoards]);

    const onHide = (): void => {
        setModalVisibility(false);
    };

    const onItemSelectedMessagesAndFiles = (item: CommandPaletteItem) => {
        switch (item.type) {
        case CommandPaletteEntities.Channel : {
            if (currentChipType === ChipType.IN) {
                addChip(`${ChipType.IN}: ${item.title}`);
                setSearchTerm('');
                setCurrentChipType(null);
            }
            break;
        }
        case CommandPaletteEntities.User : {
            if (currentChipType === ChipType.FROM) {
                addChip(`${ChipType.FROM}: ${item.title}`);
                setSearchTerm('');
                setCurrentChipType(null);
            }
            break;
        }
        }
    };

    const onItemSelected = (item: CommandPaletteItem) => {
        if (currentChipType) {
            onItemSelectedMessagesAndFiles(item);
            setCurrentChipType(null);
            return;
        }

        switch (item.type) {
        case CommandPaletteEntities.Boards : {
            browserHistory.push(`/boards/team/${item.teamId}/${item.id}`);
            break;
        }
        case CommandPaletteEntities.Channel : {
            if (item.channel) {
                dispatch(switchToChannel(item.channel));
            }
            break;
        }
        case CommandPaletteEntities.GoTo : {
            if (item.title === GotoListItemConstants.CUSTOM_STATUS) {
                dispatch(openModal({
                    modalId: ModalIdentifiers.CUSTOM_STATUS,
                    dialogType: CustomStatusModal,
                }));
            } else if (item.title === GotoListItemConstants.PROFILE_SETTINGS) {
                dispatch(openModal({
                    modalId: ModalIdentifiers.USER_SETTINGS,
                    dialogType: UserSettingsModal,
                    dialogProps: {isContentProductSettings: false},
                }));
            } else if (item.title === GotoListItemConstants.NOTIFICATION_SETTINGS) {
                dispatch(openModal({
                    modalId: ModalIdentifiers.USER_SETTINGS,
                    dialogType: UserSettingsModal,
                    dialogProps: {isContentProductSettings: true, activeTab: 'notifications'},
                }));
            } else if (item.title === GotoListItemConstants.DISPLAY_SETTINGS) {
                dispatch(openModal({
                    modalId: ModalIdentifiers.USER_SETTINGS,
                    dialogType: UserSettingsModal,
                    dialogProps: {isContentProductSettings: true, activeTab: 'display'},
                }));
            } else if (item.title === GotoListItemConstants.USER_GROUPS) {
                dispatch(openModal({
                    modalId: ModalIdentifiers.USER_GROUPS,
                    dialogType: UserGroupsModal,
                }));
            } else if (item.title === GotoListItemConstants.INVITE_PEOPLE) {
                dispatch(openModal({
                    modalId: ModalIdentifiers.INVITATION,
                    dialogType: InvitationModal,
                }));
            }
            break;
        }
        default: {
            break;
        }
        }
        onHide();
    };

    return (
        <Modal
            dialogClassName='a11y__modal cmd-pl-modal'
            role='dialog'
            aria-labelledby={CommandPaletteModalLabel}
            show={modalVisibility}
            enforceFocus={true}
            restoreFocus={false}
            onHide={onHide}
            onExited={onExited}
            width={'672px'}
        >
            <Modal.Header>
                <Input
                    chips={chips}
                    entities={entities}
                    onChange={updateSearchTerm}
                    onKeyDown={handleKeyDown}
                    isCommandVisible={isCommandVisible}
                    removeChip={removeChip}
                    searchPrefix={searchPrefix}
                    searchTerm={searchTerm}
                    toggleCommandVisibility={toggleCommandVisibility}
                />
            </Modal.Header>
            <Modal.Body className={'cmd-pl-modal__body'}>
                <Filters
                    entities={entities}
                    isBoardsEnabled={isBoardsEnabled}
                    isCommandVisible={isCommandVisible}
                    isPlaybooksEnabled={isPlaybooksEnabled}
                    toggleFilter={toggleFilter}
                />
                {isLoading && <LoadingSpinner/>}
                {!isLoading &&
                    <CommandPaletteList
                        itemList={transformedItems}
                        onItemSelected={onItemSelected}
                    />
                }
            </Modal.Body>
            <Modal.Footer>
                <Footer/>
            </Modal.Footer>
        </Modal>
    );
};

export default CommandPaletteModal;
