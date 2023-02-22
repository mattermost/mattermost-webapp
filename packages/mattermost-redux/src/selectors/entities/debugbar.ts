// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GlobalState} from '@mattermost/types/store';

export const getApiCalls = (state: GlobalState) => state.entities.debugbar.apiCalls;
export const getStoreCalls = (state: GlobalState) => state.entities.debugbar.storeCalls;
export const getSqlQueries = (state: GlobalState) => state.entities.debugbar.sqlQueries;
export const getLogs = (state: GlobalState) => state.entities.debugbar.logs;
export const getEmailsSent = (state: GlobalState) => state.entities.debugbar.emailsSent;
