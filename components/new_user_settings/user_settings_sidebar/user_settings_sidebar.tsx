// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FC, useEffect, useRef, useState} from 'react';

import {FormattedMessage} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import ReactSelect, {ValueType} from 'react-select';

import {CategorySorting} from '@mattermost/types/channel_categories';
import {trackEvent} from 'actions/telemetry_actions';
import {setCategorySorting} from 'mattermost-redux/actions/channel_categories';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {
    getInt,
    shouldShowUnreadsCategory,
} from 'mattermost-redux/selectors/entities/preferences';
import state from 'mattermost-redux/store/initial_state';

import {getCategoriesForCurrentTeam} from 'selectors/views/channel_sidebar';
import {localizeMessage} from 'utils/utils';
import GenricSectionCreator1 from '../generic_section_creator';
import {UnsavedChangesModal} from '../unsaved_changes_modal';

type Limit = {
    value: number;
    label: string;
};

const limits: Limit[] = [
    {
        value: 10000,
        label: localizeMessage(
            'user.settings.sidebar.limitVisibleGMsDMs.allDirectMessages',
            'All Direct Messages',
        ),
    },
    {value: 10, label: '10'},
    {value: 15, label: '15'},
    {value: 20, label: '20'},
    {value: 40, label: '40'},
];

const UserSettingsSidebar: FC = () => {
    const dispatch = useDispatch();

    const checkboxRef = useRef<any>();

    const currentUserId = useSelector(getCurrentUserId);
    const categories = useSelector(getCategoriesForCurrentTeam);
    const showUnreadsCategory = useSelector(shouldShowUnreadsCategory);

    const [somethingChanged, setSomethingChanged] = useState(false);
    const [unreadsCategory, setUnreadsCategory] = useState(showUnreadsCategory);
    const [channelsRadio, setChannelsRadio] = useState<CategorySorting>(
        CategorySorting.Alphabetical,
    );
    const [directMessagesRadio, setDirectMessagesRadio] =
        useState<CategorySorting>(CategorySorting.Alphabetical);

    const dmgmLimit = getInt(
        state,
        Preferences.CATEGORY_SIDEBAR_SETTINGS,
        Preferences.LIMIT_VISIBLE_DMS_GMS,
        20,
    );
    const [limit, setLimit] = useState<any>({
        label: dmgmLimit,
        value: dmgmLimit,
    });
    useEffect(() => {
        categories.map((c) => {
            if (c.type === 'channels' && c.sorting === 'alpha') {
                setChannelsRadio(CategorySorting.Alphabetical);
            } else if (c.type === 'channels' && c.sorting === 'recent') {
                setChannelsRadio(CategorySorting.Recency);
            } else if (c.type === 'channels' && c.sorting === 'manual') {
                setChannelsRadio(CategorySorting.Manual);
            } else if (c.type === 'direct_messages' && c.sorting === 'alpha') {
                setDirectMessagesRadio(CategorySorting.Alphabetical);
            } else if (c.type === 'direct_messages' && c.sorting === 'recent') {
                setDirectMessagesRadio(CategorySorting.Recency);
            }
        });
    }, []);

    const handleCheckBoxChanged = (e: boolean) => {
        const checked = checkboxRef.current.checked;
        setUnreadsCategory(checked);
        setSomethingChanged(true);
    };

    const sortChannelsAccordingly = (sorting: any) => {
        setSomethingChanged(true);
        let sort: CategorySorting;
        if (sorting === 'Alphabetically') {
            sort = CategorySorting.Alphabetical;
            setChannelsRadio(sort);
        } else if (sorting === 'By recent activity') {
            sort = CategorySorting.Recency;
            setChannelsRadio(sort);
        } else if (sorting === 'Manually') {
            sort = CategorySorting.Manual;
            setChannelsRadio(sort);
        }
    };

    const sortDirectMessagesAccordingly = (sorting: any) => {
        setSomethingChanged(true);
        let sort: CategorySorting;
        if (sorting === 'Alphabetically') {
            sort = CategorySorting.Alphabetical;
            setDirectMessagesRadio(sort);
        } else if (sorting === 'By recent activity') {
            sort = CategorySorting.Recency;
            setDirectMessagesRadio(sort);
        }
    };

    const handleSubmit = () => {
        dispatch(
            savePreferences(currentUserId, [
                {
                    user_id: currentUserId,
                    category: Preferences.CATEGORY_SIDEBAR_SETTINGS,
                    name: Preferences.SHOW_UNREAD_SECTION,
                    value: unreadsCategory.toString(),
                },
            ]),
        );

        dispatch(
            savePreferences(currentUserId, [
                {
                    user_id: currentUserId,
                    category: Preferences.CATEGORY_SIDEBAR_SETTINGS,
                    name: Preferences.LIMIT_VISIBLE_DMS_GMS,
                    value: limit.value.toString(),
                },
            ]),
        );

        categories.map((c, i) => {
            if (c.type === 'channels') {
                dispatch(setCategorySorting(c.id, channelsRadio));
                trackEvent('ui', `ui_sidebar_sort_dm_${channelsRadio}`);
            }

            if (c.type === 'direct_messages') {
                dispatch(setCategorySorting(c.id, directMessagesRadio));
                trackEvent('ui', `ui_sidebar_sort_dm_${directMessagesRadio}`);
            }
        });
    };

    const handleLimitChange = (selected: ValueType<Limit>) => {
        if (selected && 'value' in selected) {
            setLimit(selected);
        }
    };

    return (
        <div className='section'>
            {GenricSectionCreator1({
                title: {
                    id: 'user.settings.sidebar.Unreadchannels',
                    message: 'Unread channels',
                    titleClassname: 'font-16-weight-600 Pb-14',
                },
                subSection: {
                    checkbox: [
                        {
                            id: 'user.settings.sidebar.group',
                            message: 'Group unread channels separately',
                            checked: unreadsCategory,
                            ref: checkboxRef,
                            checkBoxContentClassname: 'Mb-8',
                        },
                    ],
                },
                xtraInfo: (
                    <div className='section-description font-12-weight-400 Pb-24'>
                        <FormattedMessage
                            id='user.settings.sidebar.enableDescription'
                            defaultMessage='When enabled, all unread channels and direct messages are grouped together at the top of your channel sidebar.'
                        />
                    </div>
                ),

                onCheckBoxChange: handleCheckBoxChanged,
            })}
            {GenricSectionCreator1({
                title: {
                    id: 'user.settings.sidebar.Channelcategories',
                    message: 'Channel categories',
                    titleClassname: 'font-16-weight-600 Pt-24 Pb-24',
                },
                description: {
                    id: 'user.settings.sidebar.defaultSort',
                    message: 'Default sort for channel categories',
                    descriptionClassname: 'font-12-weight-600 Pb-6',
                },
                subSection: {
                    radio: [
                        [
                            {
                                id: 'user.settings.sidebar.alphabetically',
                                message: 'Alphabetically',
                                checked: channelsRadio === 'alpha',
                                radioContentClassname: 'Pb-2',
                            },
                            {
                                id: 'user.settings.sidebar.recency',
                                message: 'By recent activity',
                                checked: channelsRadio === 'recent',
                                radioContentClassname: 'Pb-2',
                            },
                            {
                                id: 'user.settings.sidebar.manually',
                                message: 'Manually',
                                checked: channelsRadio === 'manual',
                                radioContentClassname: 'Pb-6',
                            },
                        ],
                    ],
                },
                xtraInfo: (
                    <div className='font-12-weight-400 section-description Pb-24'>
                        <FormattedMessage
                            id='user.settings.sidebar.overrideDescription'
                            defaultMessage="You can override sorting for individual categories using the category's sidebar menu."
                        />
                    </div>
                ),
                onRadioChange: sortChannelsAccordingly,
            })}
            {GenricSectionCreator1({
                title: {
                    id: 'user.settings.sidebar.Directmessages',
                    message: 'Direct messages',
                    titleClassname: 'font-16-weight-600 Pt-24 Pb-24',
                },
                description: {
                    id: 'user.settings.sidebar.sortDMs',
                    message: 'Sort direct messages',
                    descriptionClassname: 'font-12-weight-600 Pb-6',
                },
                subSection: {
                    radio: [
                        [
                            {
                                id: 'user.settings.sidebar.alphabetically',
                                message: 'Alphabetically',
                                checked: directMessagesRadio === 'alpha',
                                radioContentClassname: 'Pb-2',
                            },
                            {
                                id: 'user.settings.sidebar.recency',
                                message: 'By recent activity',
                                checked: directMessagesRadio === 'recent',
                                radioContentClassname: 'Pb-14',
                            },
                        ],
                    ],
                    select: (
                        <div>
                            <div className='font-12-weight-600 Pb-16'>
                                <FormattedMessage
                                    id='user.settings.sidebar.limitVisibleGMsDMsTitle'
                                    defaultMessage='Number of direct messages to show in the channel sidebar'
                                />
                            </div>
                            <ReactSelect
                                className='dmgm-select'
                                classNamePrefix='react-select'
                                id='limitVisibleGMsDMs'
                                options={limits}
                                clearable={false}
                                onChange={(e) => {
                                    handleLimitChange(e);
                                    setSomethingChanged(true);
                                }}
                                value={limit}
                                isSearchable={false}
                            />
                        </div>
                    ),
                },
                xtraInfo: (
                    <div className='font-12-weight-400 Pt-8 section-description'>
                        <FormattedMessage
                            id='user.settings.sidebar.DMSidebarMenu'
                            defaultMessage='You can change direct message settings using the direct messages sidebar menu.'
                        />
                    </div>
                ),
                onRadioChange: sortDirectMessagesAccordingly,
            })}
            {somethingChanged && (
                <UnsavedChangesModal
                    setSomethingChanged={setSomethingChanged}
                    handleSubmit={handleSubmit}
                />
            )}
        </div>
    );
};

export default UserSettingsSidebar;
