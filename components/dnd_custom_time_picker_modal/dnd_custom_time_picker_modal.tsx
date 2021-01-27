// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {UserStatus} from 'mattermost-redux/types/users';

import {UserTimezone} from 'mattermost-redux/src/types/users';
import {localizeMessage} from 'mattermost-redux/utils/i18n_utils';

import GenericModal from 'components/generic_modal';

import {UserStatuses} from 'utils/constants';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import './dnd_custom_time_picker_modal.scss';

type Props = {
    onHide: () => void;
    userId: string;
    userTimezone: UserTimezone;
    enableTimezone: boolean;
    getCurrentDateTime: (tz: UserTimezone, enable: boolean) => Date;
    actions: {
        setStatus: (status: UserStatus) => ActionFunc;
    };
};

type State = {
    userId: string;
    dateString: string;
    timeString: string;
    timeMenuList: string[];
}

export default class DndCustomTimePicker extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            userId: props.userId || '',
            dateString: this.formatDateString(this.props.getCurrentDateTime(this.props.userTimezone, this.props.enableTimezone)) || '',
            timeString: '',
            timeMenuList: [],
        };
    }

    formatDateString = (day: Date): string => {
        const str = day.getDate().toString() + '-' + day.getMonth().toString() + '-' + day.getFullYear().toString();
        return str;
    }

    getText = () => {
        const modalHeaderText = (
            <FormattedMessage
                id='dnd_custom_time_picker_modal.defautlMsg'
                defaultMessage={localizeMessage('dnd_custom_time_picker_modal.defaultMsg', 'Disable notifications till')}
            />
        );
        const confirmButtonText = (
            <FormattedMessage
                id='rename_category_modal.rename'
                defaultMessage={localizeMessage('dnd_custom_time_picker_modal.rename', 'Rename')}
            />
        );

        return {
            modalHeaderText,
            confirmButtonText,
        };
    }

    handleDaySelection = (day: Date) => {
        const dString = day.toDateString();
        this.setState({
            dateString: dString,
        }, this.setTimeMenuList);
    };

    setTimeMenuList = () => {
        const timeMenuItems = [];
        let h = 0;
        let m = 0;
        const curr = this.props.getCurrentDateTime(this.props.userTimezone, this.props.enableTimezone);
        if (curr.toDateString() === this.state.dateString) {
            h = curr.getHours();
            m = curr.getMinutes();
            if (m > 20) {
                h++;
                m = 0;
            } else {
                m = 30;
            }
        }
        for (let i = h; i < 24; i++) {
            for (let j = m / 30; j < 2; j++) {
                const t = i.toString().padStart(2, '0') + ':' + (j * 30).toString().padStart(2, '0');
                timeMenuItems.push(
                    t,
                );
            }
        }
        this.setState({
            timeMenuList: timeMenuItems,
        });
    }

    componentDidMount() {
        this.setTimeMenuList();
    }

    render() {
        const {
            modalHeaderText,
            confirmButtonText,
        } = this.getText();

        const {timeMenuList} = this.state;
        const timeMenuItems = timeMenuList.map((time) => {
            return (
                <Menu.ItemAction
                    key={time}
                    text={time}
                    onClick={() => {
                        this.setState({
                            timeString: time,
                        });
                    }}
                >
                    {time}
                </Menu.ItemAction>
            );
        });

        const setStatus = (event: any) => {
            event.preventDefault();
            const hours = parseInt(this.state.timeString.split(':')[0], 10);
            const minutes = parseInt(this.state.timeString.split(':')[1], 10);
            const endTime = new Date(this.state.dateString);
            endTime.setHours(hours, minutes);
            this.props.actions.setStatus({
                user_id: this.props.userId,
                status: UserStatuses.DND,
                dnd_end_time: endTime.toISOString(),
            });
        };

        const now = this.props.getCurrentDateTime(this.props.userTimezone, this.props.enableTimezone);

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
                                placeholder={this.state.dateString}
                                onDayChange={this.handleDaySelection}
                                dayPickerProps={{
                                    month: now,
                                    disabledDays: {
                                        before: now,
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <MenuWrapper
                        id='dropdown-no-caret'
                        stopPropagationOnToggle={true}
                    >
                        <button
                            className='DndModal__input'
                            type='button'
                        >
                            <div className='DndModal__input__label'>{'Time'}</div>
                            <i className='icon icon--no-spacing icon-clock-outline icon--xs icon-14'/>
                            <span>{timeMenuList[0]}</span>
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
