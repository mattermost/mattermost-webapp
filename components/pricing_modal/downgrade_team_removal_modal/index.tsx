// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {noop, isEmpty} from 'lodash';
import {Modal} from 'react-bootstrap';

import {useDispatch, useSelector} from 'react-redux';

import {t} from 'utils/i18n';

import RadioButtonGroup from 'components/common/radio_group';
import DropdownInput, {ValueType} from 'components/dropdown_input';

import useGetUsage from 'components/common/hooks/useGetUsage';
import {getTeams, selectTeam, archiveAllTeamsExcept} from 'mattermost-redux/actions/teams';

import {getActiveTeamsList} from 'mattermost-redux/selectors/entities/teams';
import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';

import './downgrade_team_removal_modal.scss';

type Props = {
    onHide?: () => void;
};

function DownGradeTeamRemovalModal(props: Props) {
    const dispatch = useDispatch();
    const [radioValue, setRadioValue] = useState('');
    const [dropdownValue, setDropdownValue] = useState({});
    const {formatMessage} = useIntl();
    const isCloudDowngradeChooseTeamModalOpen = useSelector(
        (state: GlobalState) =>
            isModalOpen(state, ModalIdentifiers.CLOUD_DOWNGRADE_CHOOSE_TEAM),
    );
    const teams = useSelector(getActiveTeamsList);
    useEffect(() => {
        if (!teams) {
            dispatch(getTeams(0, 10000));
        }
    }, [teams]);
    const usage = useGetUsage();

    const onHide = () => {
        dispatch(closeModal(ModalIdentifiers.CLOUD_DOWNGRADE_CHOOSE_TEAM));
    };

    const onConfirmDowngrade = async () => {
        let teamIdToKeep = '';
        if (!isEmpty(radioValue) && isEmpty(dropdownValue)) {
            teamIdToKeep = radioValue;
        } else {
            teamIdToKeep = (dropdownValue as ValueType).value;
        }
        dispatch(selectTeam(teamIdToKeep));
        const test = await dispatch(archiveAllTeamsExcept(teamIdToKeep));
        console.log(test);

        if (typeof props.onHide === 'function') {
            props.onHide();
        }
    };

    const selectionSection = () => {
        if (usage.teams.active < 4) {
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
                legend={formatMessage({
                    id: t('admin.channel_settings.channel_list.teamHeader'),
                    defaultMessage: 'Team',
                })}
                placeholder={formatMessage({
                    id: t('downgrade_plan_modal.selectTeam'),
                    defaultMessage: 'Select team',
                })}
                value={
                    isEmpty(dropdownValue) ? undefined : (dropdownValue as ValueType)
                }
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
                <FormattedMessage
                    id='downgrade_plan_modal.title'
                    defaultMessage='Confirm Plan Downgrade'
                />
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
                        <FormattedMessage
                            id='downgrade_plan_modal.subtitle'
                            defaultMessage="Cloud starter is restricted to 1 team, 10GB file storage, 10 apps, and 5 board card views. <strong>If you downgrade, some data will be archived</strong>. It won't be deleted and you'll be able to access it again when you upgrade."
                            values={{
                                strong: (msg: React.ReactNode) => (
                                    <strong>{msg}</strong>
                                ),
                            }}
                        />
                    </div>
                    <div className='cta'>
                        <FormattedMessage
                            id='downgrade_plan_modal.whichTeamToUse'
                            defaultMessage='Which team would you like to continue using?'
                        />
                    </div>
                    <div className='DowngradeTeamRemovalModal__selectionSection'>
                        {selectionSection()}
                    </div>
                    <div className='warning'>
                        <i className='icon icon-alert-outline'/>
                        <FormattedMessage
                            id='downgrade_plan_modal.alert'
                            defaultMessage='The unselected teams will be automatically archived in the system console, but not deleted'
                        />
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
                        <FormattedMessage
                            id='admin.team_channel_settings.cancel'
                            defaultMessage='Cancel'
                        />
                    </button>
                    <button
                        disabled={isEmpty(radioValue) && isEmpty(dropdownValue)}
                        onClick={onConfirmDowngrade}
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='downgrade_plan_modal.confirmDowngrade'
                            defaultMessage='Confirm Downgrade'
                        />
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default DownGradeTeamRemovalModal;
