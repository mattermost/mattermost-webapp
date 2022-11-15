// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from '@mattermost/types/store';

export const isRecordingModalVisible = (state: GlobalState) => state.entities.voice.recordingModalVisible;
