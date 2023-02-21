// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from '@mattermost/types/store';

export const getDebugLines = (state: GlobalState) => [...state.entities.debug.lines].reverse();
