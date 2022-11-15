// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type VoiceState = {
    recordingModalVisible: boolean;
    recordingDuration: number;
}

export type VoiceRecord = {
    channel_id: string;
    root_id: string;
    message: string;
    type: string;
    props: {
        fileId: string;
        duration: number;
    };
}
