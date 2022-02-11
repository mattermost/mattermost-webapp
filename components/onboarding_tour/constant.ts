// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const FINISHED = 999;
export const SKIPPED = 999;

export const ChannelsTourTelemetryPrefix = 'channels-tt';

export const AutoTourStatus = {
    ENABLED: 0,
    DISABLED: 1,
};

const AutoStatusSuffix = '_auto_status';

export const TutorialTourCategories = {
    ON_BOARDING: 'tutorial_step',
    CRT_TUTORIAL_STEP: 'crt_tutorial_step',
    CRT_THREAD_PANE_STEP: 'crt_thread_pane_step',
};

export const OnBoardingTourSteps = {
    CHANNELS_AND_DIRECT_MESSAGES: 0,
    CREATE_AND_JOIN_CHANNELS: 1,
    INVITE_PEOPLE: 2,
    SEND_MESSAGE: 3,
    CUSTOMIZE_EXPERIENCE: 4,
    FINISHED,
};

export const CrtTutorialSteps = {
    WELCOME_POPOVER: 0,
    LIST_POPOVER: 1,
    UNREAD_POPOVER: 2,
    FINISHED,
};

export const CrtTutorialTriggerSteps = {
    START: 0,
    STARTED: 1,
    FINISHED,
};

export const TTCategoriesMapToSteps = {
    [TutorialTourCategories.ON_BOARDING]: OnBoardingTourSteps,
    [TutorialTourCategories.CRT_TUTORIAL_STEP]: CrtTutorialSteps,
    [TutorialTourCategories.CRT_THREAD_PANE_STEP]: CrtTutorialTriggerSteps,
};

export const TTCategoriesMapToAutoTourStatusKey = {
    [TutorialTourCategories.ON_BOARDING]: TutorialTourCategories.ON_BOARDING + AutoStatusSuffix,
    [TutorialTourCategories.CRT_TUTORIAL_STEP]: [TutorialTourCategories.CRT_TUTORIAL_STEP] + AutoStatusSuffix,
    [TutorialTourCategories.CRT_THREAD_PANE_STEP]: [TutorialTourCategories.CRT_THREAD_PANE_STEP] + AutoStatusSuffix,
};
