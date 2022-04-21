// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, KeyboardEvent, useCallback, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {getTeams} from 'mattermost-redux/selectors/entities/teams';
import {CommandPaletteEntities} from 'components/command_palette/types';
import Constants from 'utils/constants';
import {isKeyPressed} from 'utils/utils';
import {getChannelsInAllTeams} from 'mattermost-redux/selectors/entities/channels';
import {CommandPaletteList} from '../command_palette_list/command_palette_list';
import {channelToCommandPaletteItemTransformer} from '../utils';

import Filters from './filters';
import Footer from './footer';
import Input from './input';
import './command_palette_modal.scss';

interface Props {
    selectedEntities: CommandPaletteEntities[];
    onExited: () => void;
}

const CommandPaletteModal = ({onExited, selectedEntities}: Props) => {
    const [modalVisibility, setModalVisibility] = useState(true);
    const {formatMessage} = useIntl();
    const CommandPaletteModalLabel = formatMessage({id: 'CommandPalette.modal', defaultMessage: 'Command Palette Modal'}).toLowerCase();

    const [chips, setChips] = useState(['Chip 1', 'Chip 2']);
    const [entities, setEntities] = useState<CommandPaletteEntities[]>(selectedEntities || []);
    const [isCommandVisible, setIsCommandVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const addChip = useCallback((chip: string) => {
        setChips((chips) => {
            if (chips.indexOf(chip) === -1) {
                return [...chips, chip];
            }
            return chips;
        });
    }, []);

    const removeChip = useCallback((index: number) => {
        setChips((chips) => chips.filter((_, i) => i !== index));
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (searchTerm.trim().length && isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            addChip(searchTerm);
            setSearchTerm('');
        } else if (chips.length && isKeyPressed(e, Constants.KeyCodes.BACKSPACE) && !searchTerm) {
            removeChip(chips.length - 1);
        }
    }, [addChip, chips, removeChip, searchTerm]);

    const toggleFilter = useCallback((entity: CommandPaletteEntities) => {
        if (entities.includes(entity)) {
            setEntities(entities.filter((e) => e !== entity));
        } else {
            setEntities([...entities, entity]);
        }
    }, [entities, setEntities]);

    const toggleCommandVisibility = useCallback(() => {
        setIsCommandVisible((isCommandVisible) => !isCommandVisible);
    }, []);

    const updateSearchTerm = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const recentChannels = useSelector(getChannelsInAllTeams);
    const teams = useSelector(getTeams);
    const transformedItems = channelToCommandPaletteItemTransformer(recentChannels, teams);
    const onHide = (): void => {
        setModalVisibility(false);
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
                    searchTerm={searchTerm}
                    toggleCommandVisibility={toggleCommandVisibility}
                />
            </Modal.Header>
            <Modal.Body className={'cmd-pl-modal__body'}>
                <Filters
                    entities={entities}
                    isCommandVisible={isCommandVisible}
                    toggleFilter={toggleFilter}
                />
                <CommandPaletteList itemList={transformedItems}/>
            </Modal.Body>
            <Modal.Footer>
                <Footer/>
            </Modal.Footer>
        </Modal>
    );
};

export default CommandPaletteModal;
