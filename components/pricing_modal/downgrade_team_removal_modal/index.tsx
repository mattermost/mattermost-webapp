// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {noop} from 'lodash';
import {Modal} from 'react-bootstrap';

import {useDispatch, useSelector} from 'react-redux';

import {isEmpty} from 'lodash';

import RadioButtonGroup from 'components/common/radio_group';
import DropdownInput, {ValueType} from 'components/dropdown_input';

import useGetUsage from 'components/common/hooks/useGetUsage';
import {getTeams} from 'mattermost-redux/actions/teams';

import {getTeamsList} from 'mattermost-redux/selectors/entities/teams';
import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';

import './downgrade_team_removal_modal.scss';

function DownGradeTeamRemovalModal() {
    const dispatch = useDispatch();
    const [radioValue, setRadioValue] = useState('');
    const [dropdownValue, setDropdownValue] = useState({});
    const isCloudDowngradeChooseTeamModalOpen = useSelector(
        (state: GlobalState) =>
            isModalOpen(state, ModalIdentifiers.CLOUD_DOWNGRADE_CHOOSE_TEAM),
    );
    const teams = useSelector(getTeamsList);
    useEffect(() => {
        if (!teams) {
            dispatch(getTeams(0, 10000));
        }
    }, [teams]);
    const usage = useGetUsage();

    const onHide = () => {
        dispatch(closeModal(ModalIdentifiers.CLOUD_DOWNGRADE_CHOOSE_TEAM));
    };

    const onConfirmDowngrade = () => {
        console.log(radioValue);
        console.log(dropdownValue);
    };

    const selectionSection = () => {
        console.log(usage);
        if (usage.teams.active > 1 && usage.teams.active < 4) {
            return (
                <RadioButtonGroup
                    id='deleteTeamRadioGroup'
                    values={teams.map((team) => {
                        return {
                            value: team.id,
                            key: team.display_name,
                            testId: team.id,
                        };
                    })}
                    value={radioValue}
                    onChange={(e) => setRadioValue(e.target.value)}

                />
            );
        }

        return (
            <DropdownInput
                onChange={(e) => setDropdownValue(e)}
                legend={'Team'}
                placeholder={'Select team'}
                value={isEmpty(dropdownValue) ? undefined : dropdownValue as ValueType}
                options={teams.map((team) => {
                    return {
                        label: team.display_name,
                        value: team.id,
                    };
                })}
            />
        );
    };

    return (
        <Modal
            className='DowngradeTeamRemovalModal'
            show={isCloudDowngradeChooseTeamModalOpen}
            id='downgradeTeamRemovalModal'
            onExited={() => {
                dispatch(
                    closeModal(ModalIdentifiers.CLOUD_DOWNGRADE_CHOOSE_TEAM),
                );
            }}
            data-testid='downgradeTeamRemovalModal'
            dialogClassName='a11y__modal'
            onHide={noop}
            role='dialog'
            aria-modal='true'
            aria-labelledby='downgradeTeamRemovalModalTitle'
        >
            <Modal.Header className='DowngradeTeamRemovalModal__header'>
                {'Confirm Plan Downgrade'}
                <button
                    id='closeIcon'
                    className='icon icon-close'
                    aria-label='Close'
                    title='Close'
                    onClick={onHide}
                />
            </Modal.Header>
            <Modal.Body>
                <div className='DowngradeTeamRemovalModal__body'>
                    <div>
                        {
                            "Cloud starter is restricted to 1 team, 10GB file storage, 10 apps, and 5 board card views. If you downgrade, some data will be archived. It won't be deleted and you'll be able to access it again when you upgrade."
                        }
                    </div>
                    <div className='cta'>
                        {'Which team would you like to continue using?'}
                    </div>
                    <div className='DowngradeTeamRemovalModal__selectionSection'>
                        {selectionSection()}
                    </div>
                    <div className='warning'>
                        <i className='icon icon-alert-outline'/>
                        {'The unselected teams will be automatically archived in the system console, but not deleted'}
                    </div>
                </div>
                <div className='DowngradeTeamRemovalModal__buttons'>
                    <button
                        onClick={() =>
                            dispatch(
                                closeModal(
                                    ModalIdentifiers.CLOUD_DOWNGRADE_CHOOSE_TEAM,
                                ),
                            )
                        }
                        className='btn btn-light'
                    >
                        {'Cancel'}
                    </button>
                    <button
                        onClick={onConfirmDowngrade}
                        className='btn btn-primary'
                    >{'Confirm Downgrade'}</button>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default DownGradeTeamRemovalModal;
