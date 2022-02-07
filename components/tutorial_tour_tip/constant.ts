// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// This needs to replaced with the actual tour data based on product

export const FINISHED = 999;
export const SKIPPED = 999;

export const AutoTourStatus = {
    ENABLED: 0,
    DISABLED: 1,
};

const AutoStatusSuffix = '_auto_status';

export const TutorialTourCategories = {
    ON_BOARDING: 'tutorial_step',
    CRT_TUTORIAL_STEP: 'crt_tutorial_step',
    CRT_THREAD_PANE_STEP: 'crt_thread_pane_step',
    START_TRIAL: 'start_trial',
};

export const OnBoardingTourSteps = {
    CHANNELS_AND_DIRECT_MESSAGES: 0,
    CREATE_AND_JOIN_CHANNELS: 1,
    INVITE_PEOPLE: 2,
    SEND_MESSAGE: 3,
    CUSTOMIZE_EXPERIENCE: 4,
    FINISHED,
};

export const TutorialSteps = {
    ADD_FIRST_CHANNEL: -1,
    POST_POPOVER: 0,
    CHANNEL_POPOVER: 1,
    ADD_CHANNEL_POPOVER: 2,
    MENU_POPOVER: 3,
    PRODUCT_SWITCHER: 4,
    SETTINGS: 5,
    FINISHED: 999,
};

export const CrtTutorialSteps = {
    WELCOME_POPOVER: 0,
    LIST_POPOVER: 1,
    UNREAD_POPOVER: 2,
    FINISHED: 999,
};

export const CrtTutorialTriggerSteps = {
    START: 0,
    STARTED: 1,
    FINISHED: 999,
};

export const StartTrialTriggerSteps = {
    START: 0,
    STARTED: 1,
    FINISHED: 999,
};

export const TTCategoriesMapToSteps = {
    [TutorialTourCategories.ON_BOARDING]: OnBoardingTourSteps,
    [TutorialTourCategories.CRT_TUTORIAL_STEP]: CrtTutorialSteps,
    [TutorialTourCategories.CRT_THREAD_PANE_STEP]: CrtTutorialTriggerSteps,
    [TutorialTourCategories.START_TRIAL]: StartTrialTriggerSteps,
};

export const TTCategoriesMapToAutoTourStatusKey = {
    [TutorialTourCategories.ON_BOARDING]: TutorialTourCategories.ON_BOARDING + AutoStatusSuffix,
    [TutorialTourCategories.CRT_TUTORIAL_STEP]: [TutorialTourCategories.CRT_TUTORIAL_STEP] + AutoStatusSuffix,
    [TutorialTourCategories.CRT_THREAD_PANE_STEP]: [TutorialTourCategories.CRT_THREAD_PANE_STEP] + AutoStatusSuffix,
    [TutorialTourCategories.START_TRIAL]: [TutorialTourCategories.START_TRIAL] + AutoStatusSuffix,
};
