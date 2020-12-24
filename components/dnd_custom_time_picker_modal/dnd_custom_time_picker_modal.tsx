// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {UserStatus} from 'mattermost-redux/types/users';

import GenericModal from 'components/generic_modal';
// import {localizeMessage} from 'utils/utils';


import {UserStatuses} from 'utils/constants';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import './dnd_custom_time_picker_modal.scss';

type Props = {
    onHide: () => void;
    userId: string;
    actions: {
        setStatus: (status: UserStatus) => ActionFunc;
    };
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
    //     this.setState({categoryName: '' });
    // }

    // handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     this.setState({categoryName: e.target.value });
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
                timeMenuItems.push(
                    <Menu.ItemAction
                        text={t}
                        onClick={handleTimeSelect}
                    >
                        {t}
                    </Menu.ItemAction>,
                );
            }
        }

        const setStatus = () => {
            const hours = parseInt(timeString.split(':')[0], 10);
            const minutes = parseInt(timeString.split(':')[1], 10);
            const endTime = new Date(dateString);
            endTime.setHours(hours, minutes);
            this.props.actions.setStatus({
                user_id: this.props.userId,
                status: UserStatuses.DND,
                dnd_end_time: endTime.toISOString(),
            });
        };

        return (
            <GenericModal
                onHide={this.props.onHide}
                modalHeaderText={modalHeaderText}
                confirmButtonText={confirmButtonText}
                id='dndCustomTimePickerModal'
                className={'DndModal modal-overflow'}
            >
                <div className='DndModal__content'>
                    <div>
                        <div className='DndModal__input DndModal__input--no-border'>
                            <div className='DndModal__input__label'>{'Date'}</div>
                            <i className='icon icon--no-spacing icon-calendar-outline icon--xs icon-14'/>
                            <DayPickerInput
                                placeholder='Today'
                                dayPickerProps={{
                                    month: new Date(),
                                    disabledDays: {
                                        before: new Date(),
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <MenuWrapper
                        id='dropdown-no-caret'
                    >
                        <button
                            className='DndModal__input'
                            type='button'
                        >
                            <div className='DndModal__input__label'>{'Time'}</div>
                            <i className='icon icon--no-spacing icon-clock-outline icon--xs icon-14'/>
                            <span>{'12:30 PM'}</span>
                        </button>
                        <Menu
                            openLeft={false}
                            ariaLabel={'Clear custom status after'}
                        >
                            {timeMenuItems}
                        </Menu>
                    </MenuWrapper>
                </div>
                <div className='DndModal__footer'>
                    <button
                        className='btn btn-primary'
                        onClick={setStatus}
                    >
                        {'Disable Notifications'}
                    </button>
                </div>
            </GenericModal>
        );
    }
}
