// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from '@mattermost/types/store';

export const getApiCalls = (state: GlobalState) => state.entities.debug.apiCalls;
export const getStoreCalls = (state: GlobalState) => state.entities.debug.storeCalls;
export const getSqlQueries = (state: GlobalState) => state.entities.debug.sqlQueries;
