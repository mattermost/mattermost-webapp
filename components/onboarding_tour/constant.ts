// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const FINISHED = 999;
export const SKIPPED = 999;

export const ChannelsTourTelemetryPrefix = 'channels-tour';
const AutoStatusSuffix = '_auto_tour_status';

export const AutoTourStatus = {
    ENABLED: 1,
    DISABLED: 0,
};

// this should be used as for the tours related to channels
export const ChannelsTour = 'channels_tour';

export const TutorialTourName = {
    ONBOARDING_TUTORIAL_STEP: 'tutorial_step',
    CRT_TUTORIAL_STEP: 'crt_tutorial_step',
    CRT_THREAD_PANE_STEP: 'crt_thread_pane_step',
    AUTO_TOUR_STATUS: 'auto_tour_status',
};

export const OnboardingTourSteps = {
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

export const TTNameMapToATStatusKey = {
    [TutorialTourName.ONBOARDING_TUTORIAL_STEP]: TutorialTourName.ONBOARDING_TUTORIAL_STEP + AutoStatusSuffix,
    [TutorialTourName.CRT_TUTORIAL_STEP]: TutorialTourName.CRT_TUTORIAL_STEP + AutoStatusSuffix,
    [TutorialTourName.CRT_THREAD_PANE_STEP]: [TutorialTourName.CRT_THREAD_PANE_STEP] + AutoStatusSuffix,
};
