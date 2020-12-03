// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import { FormattedMessage } from 'react-intl';

import { localizeMessage } from 'utils/utils';

import DayPicker from 'react-day-picker';

import '../category_modal.scss';
import GenericModal from 'components/generic_modal';
import { MenuItem, DropdownButton } from 'react-bootstrap';

type Props = {
    onHide: () => void;
    userId: string;
    currentDate: Date;
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

    handleDayClick = (day: Date) => {
        const dayString = day.toISOString().split('T')[0];
    }

    render() {
        const {
            modalHeaderText,
            confirmButtonText,
        } = this.getText();

        let modifiers;
        if (this.props.currentDate) {
            modifiers = {
                today: this.props.currentDate,
            };
        }

        const times = ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00',
            '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
            '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
            '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
            '22:00', '22:30', '23:00', '23:30',
        ];

        const timeMenuItems = [];

        for (let i = 0; i < times.length; i++) {
            timeMenuItems.push(
                <MenuItem eventKey={i}> {times[i]} </MenuItem>,
            );
        }

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
                                onDayClick={this.handleDayClick}
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
            </GenericModal>
        );
    }
}
