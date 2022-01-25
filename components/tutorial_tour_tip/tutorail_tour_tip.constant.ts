// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// This needs to replaced with the actual tour data based on product

export const FINISHED = 999;

export const AutoTourStatus = {
    ENABLED: 0,
    DISABLED: 1,
};

const AutoStatusSuffix = '_at_status';

export const TutorialTourCategories: Record<string, string> = {
    ADMIN_ON_BOARDING: 'admin_on_boarding',
    CRT_TUTORIAL_STEP: 'crt_tutorial_step',
    CRT_THREAD_PANE_STEP: 'crt_thread_pane_step',
    TUTORIAL_STEP: 'tutorial_step',
};

export const AdminOnBoardingTourSteps = {
    ADD_FIRST_CHANNEL: 0,
    POST_POPOVER: 1,
    CHANNEL_POPOVER: 2,
    ADD_CHANNEL_POPOVER: 3,
    MENU_POPOVER: 4,
    PRODUCT_SWITCHER: 5,
    SETTINGS: 6,
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

export const TTCategoriesMapToSteps: Record<string, Record<string, number>> = {
    [TutorialTourCategories.ADMIN_ON_BOARDING]: AdminOnBoardingTourSteps,
    [TutorialTourCategories.TUTORIAL_STEP]: TutorialSteps,
    [TutorialTourCategories.CRT_TUTORIAL_STEP]: CrtTutorialSteps,
    [TutorialTourCategories.CRT_THREAD_PANE_STEP]: CrtTutorialTriggerSteps,
};

export const TTCategoriesMapToAutoTourStatusKey: Record<string, string> = {
    [TutorialTourCategories.ADMIN_ON_BOARDING]: TutorialTourCategories.ADMIN_ON_BOARDING + AutoStatusSuffix,
    [TutorialTourCategories.TUTORIAL_STEP]: [TutorialTourCategories.TUTORIAL_STEP] + AutoStatusSuffix,
    [TutorialTourCategories.CRT_TUTORIAL_STEP]: [TutorialTourCategories.TUTORIAL_STEP] + AutoStatusSuffix,
    [TutorialTourCategories.CRT_THREAD_PANE_STEP]: [TutorialTourCategories.TUTORIAL_STEP] + AutoStatusSuffix,
};
