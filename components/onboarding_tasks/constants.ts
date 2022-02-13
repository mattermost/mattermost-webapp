// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const FINISHED = 999;

export const OnBoardingTaskCategory = 'on_boarding_task_list';

// Whole task list is based on these
export const OnBoardingTasksName = {
    CHANNELS_TOUR: 'channels_tour',
    BOARDS_TOUR: 'boards_tour',
    PLAYBOOKS_TOUR: 'playbooks_tour',
    INVITE_PEOPLE: 'invite_people',
    DOWNLOAD_APP: 'download_app',
    COMPLETE_YOUR_PROFILE: 'complete_your_profile',
    VISIT_SYSTEM_CONSOLE: 'visit_system_console',
};

export const OnBoardingTaskList = {
    ON_BOARDING_TASK_LIST_OPEN: 'on_boarding_task_list_open',
    ON_BOARDING_TASK_LIST_SHOW: 'on_boarding_task_list_show',
    ON_BOARDING_VIDEO_MODAL: 'on_boarding_video_modal',
};

export const GenericTaskSteps = {
    START: 0,
    STARTED: 1,
    FINISHED,
};

export const TaskNameMapToSteps = {
    [OnBoardingTasksName.CHANNELS_TOUR]: GenericTaskSteps,
    [OnBoardingTasksName.BOARDS_TOUR]: GenericTaskSteps,
    [OnBoardingTasksName.PLAYBOOKS_TOUR]: GenericTaskSteps,
    [OnBoardingTasksName.COMPLETE_YOUR_PROFILE]: GenericTaskSteps,
    [OnBoardingTasksName.DOWNLOAD_APP]: GenericTaskSteps,
    [OnBoardingTasksName.VISIT_SYSTEM_CONSOLE]: GenericTaskSteps,
    [OnBoardingTasksName.INVITE_PEOPLE]: GenericTaskSteps,
};

