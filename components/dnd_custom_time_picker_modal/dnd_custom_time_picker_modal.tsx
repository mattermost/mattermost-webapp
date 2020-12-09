// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import { FormattedMessage } from 'react-intl';

import { localizeMessage } from 'utils/utils';

import DayPicker from 'react-day-picker';

import '../category_modal.scss';
import GenericModal from 'components/generic_modal';
import { MenuItem, DropdownButton } from 'react-bootstrap';
import { Button } from 'react-bootstrap/lib/InputGroup';
import { ActionFunc } from 'mattermost-redux/types/actions';
import { UserStatus } from 'mattermost-redux/types/users';
import { UserStatuses } from 'utils/constants';

type Props = {
    onHide: () => void;
    setStatus: (status: UserStatus) => ActionFunc;
    userId: string;
};

type State = {
    userId: string;
}

export default class DndCustomTimePicker extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            userId: props.userId || '',
        };
    }

    // handleClear = () => {
    //     this.setState({ categoryName: '' });
    // }

    // handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     this.setState({ categoryName: e.target.value });
    // }

    // handleCancel = () => {
    //     this.handleClear();
    // }

    // handleConfirm = () => {
    //     if (this.props.categoryId) {
    //         this.props.actions.renameCategory(this.props.categoryId, this.state.categoryName);
    //     } else {
    //         this.props.actions.createCategory(this.props.currentTeamId, this.state.categoryName, this.props.channelIdsToAdd);
    //         trackEvent('ui', 'ui_sidebar_created_category');
    //     }
    // }

    // isConfirmDisabled = () => {
    //     return !this.state.categoryName ||
    //         (Boolean(this.props.initialCategoryName) && this.props.initialCategoryName === this.state.categoryName);
    // }

    getText = () => {
        const modalHeaderText = (
            <FormattedMessage
                id='dnd_custom_time_picker_modal.'
                defaultMessage='Disable notifications till'
            />
        );
        const confirmButtonText = (
            <FormattedMessage
                id='rename_category_modal.rename'
                defaultMessage='Rename'
            />
        );

        return {
            modalHeaderText,
            confirmButtonText,
        };
    }

    render() {
        const {
            modalHeaderText,
            confirmButtonText,
        } = this.getText();

        const modifiers = {
            today: new Date(),
        };

        let dateString: string;
        const handleDayClick = (day: Date) => {
            dateString = day.toISOString().split('T')[0];
        };

        let timeString: string;
        const handleTimeSelect = (time: any) => {
            timeString = time;
        };

        const timeMenuItems = [];

        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 2; j++) {
                const t = i.toString().padStart(2, '0') + ':' + (j * 30).toString().padStart(2, '0');
                console.log('uparmar', t);
                timeMenuItems.push(
                    <MenuItem
                        eventKey={t}
                        onSelect={handleTimeSelect}
                    >
                        {t}
                    </MenuItem>,
                );
            }
        }

        const setStatus = () => {
            const hours = parseInt(timeString.split(':')[0], 10);
            const minutes = parseInt(timeString.split(':')[1], 10);
            const endTime = new Date(dateString);
            endTime.setHours(hours, minutes);
            this.props.setStatus({
                user_id: this.props.userId,
                status: UserStatuses.DND,
                dnd_end_time: endTime.toISOString(),
            });
            console.log('uparmar', endTime);
        };

        return (
            <GenericModal
                onHide={this.props.onHide}
                modalHeaderText={modalHeaderText}
                confirmButtonText={confirmButtonText}
                id='dndCustomTimePickerModal'
                className={'modal-overflow'}
            >
                {
                    <DropdownButton
                        bsStyle='default'
                        title='Date Picker'
                        id='dropdown-no-caret'
                        noCaret={true}
                    >
                        <MenuItem
                            className={'dnd-pickers-dropdown-menu'}
                        >
                            <DayPicker
                                onDayClick={handleDayClick}
                                showOutsideDays={true}
                                modifiers={modifiers}
                            />
                        </MenuItem>
                    </DropdownButton>
                }
                {
                    <DropdownButton
                        bsStyle='default'
                        title='Time Picker'
                        id='dropdown-no-caret'
                        noCaret={true}
                    >
                        {timeMenuItems}
                    </DropdownButton>
                }
                {
                    <button
                        onClick={setStatus}
                    >
                        {'Done'}
                    </button>
                }
            </GenericModal>
        );
    }
}
