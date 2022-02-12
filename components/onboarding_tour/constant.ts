// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export const FINISHED = 999;
export const SKIPPED = 999;

export const ChannelsTourTelemetryPrefix = 'channels-tour';
const AutoStatusSuffix = '_at';

export const AutoTourStatus = {
    ENABLED: 0,
    DISABLED: 1,
};

// this should be used as for the tours related to channels
export const ChannelsTour = 'channels_tour';

export const TutorialTourName = {
    ON_BOARDING_STEP: 'on_boarding_step',
    CRT_TUTORIAL_STEP: 'crt_tutorial_step',
    CRT_THREAD_PANE_STEP: 'crt_thread_pane_step',
    AutoTourStatus: 'auto_tour_status',
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

export const TTNameMapToATStatusKey = {
    [TutorialTourName.ON_BOARDING_STEP]: TutorialTourName.ON_BOARDING_STEP + AutoStatusSuffix,
    [TutorialTourName.CRT_TUTORIAL_STEP]: TutorialTourName.CRT_TUTORIAL_STEP + AutoStatusSuffix,
    [TutorialTourName.CRT_THREAD_PANE_STEP]: [TutorialTourName.CRT_THREAD_PANE_STEP] + AutoStatusSuffix,
};
