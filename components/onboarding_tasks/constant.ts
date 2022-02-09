// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const FINISHED = 999;

export const OnBoardingTaskCategory = 'on_boarding_task_list';

export const OnBoardingTaskName = {
    START_TRIAL: 'start_trial',
    CHANNELS_TOUR: 'channels_tour',
    BOARDS_TOUR: 'BOARDS_TOUR',
    PLAYBOOKS_TOUR: 'playbooks_tour',
    COMPLETE_YOUR_PROFILE: 'complete_your_profile',
    VISIT_SYSTEM_CONSOLE: 'visit_system_console',
};

export const GenericTaskSteps = {
    start: 0,
    STARTED: 1,
    FINISHED,
};

export const TaskNameMapToSteps = {
    [OnBoardingTaskName.START_TRIAL]: GenericTaskSteps,
    [OnBoardingTaskName.CHANNELS_TOUR]: GenericTaskSteps,
    [OnBoardingTaskName.BOARDS_TOUR]: GenericTaskSteps,
    [OnBoardingTaskName.PLAYBOOKS_TOUR]: GenericTaskSteps,
    [OnBoardingTaskName.COMPLETE_YOUR_PROFILE]: GenericTaskSteps,
    [OnBoardingTaskName.VISIT_SYSTEM_CONSOLE]: GenericTaskSteps,
};

