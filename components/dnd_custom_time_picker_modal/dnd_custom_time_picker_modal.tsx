// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import { FormattedMessage } from 'react-intl';

import { localizeMessage } from 'utils/utils';

import DayPicker from 'react-day-picker';

import '../category_modal.scss';
import GenericModal from 'components/generic_modal';
import { Button, DropdownButton } from 'react-bootstrap';

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

    showDatePicker = () => {
        let modifiers;
        if (this.props.currentDate) {
            modifiers = {
                today: this.props.currentDate,
            };
        }
        return (
            <DayPicker
                onDayClick={this.handleDayClick}
                showOutsideDays={true}
                modifiers={modifiers}
            // ref={(node) => {
            //     this.node = node;
            // }}
            />
        );
    }

    render() {
        const {
            modalHeaderText,
            confirmButtonText,
        } = this.getText();

        const showDatePicker = this.showDatePicker;

        return (
            <GenericModal
                onHide={this.props.onHide}
                modalHeaderText={modalHeaderText}
                confirmButtonText={confirmButtonText}
                id='dndCustomTimePickerModal'
            >

                <button
                    type='button'
                    className='GenericModal__button cancel'
                    onClick={showDatePicker}
                >
                    {'Date Picker'}
                </button>
            </GenericModal>
        );
    }
}
