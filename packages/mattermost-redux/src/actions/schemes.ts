// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {SchemeTypes} from 'mattermost-redux/action_types';
import {General} from '../constants';

import {Scheme, SchemeScope, SchemePatch} from '@mattermost/types/schemes';

import {ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';

import {bindClientFunc} from './helpers';

export function getScheme(schemeId: string): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getScheme,
        onSuccess: [SchemeTypes.RECEIVED_SCHEME],
        params: [
            schemeId,
        ],
    });
}

export function getSchemes(scope: SchemeScope, page = 0, perPage: number = General.PAGE_SIZE_DEFAULT): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getSchemes,
        onSuccess: [SchemeTypes.RECEIVED_SCHEMES],
        params: [
            scope,
            page,
            perPage,
        ],
    });
}

export function createScheme(scheme: Scheme): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.createScheme,
        onSuccess: [SchemeTypes.CREATED_SCHEME],
        params: [
            scheme,
        ],
    });
}

export function deleteScheme(schemeId: string): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        const data = await Client4.deleteScheme(schemeId);

        dispatch({type: SchemeTypes.DELETED_SCHEME, data: {schemeId}});

        return {data};
    };
}

export function patchScheme(schemeId: string, scheme: SchemePatch): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.patchScheme,
        onSuccess: [SchemeTypes.PATCHED_SCHEME],
        params: [
            schemeId,
            scheme,
        ],
    });
}

export function getSchemeTeams(schemeId: string, page = 0, perPage: number = General.PAGE_SIZE_DEFAULT): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getSchemeTeams,
        onSuccess: [SchemeTypes.RECEIVED_SCHEME_TEAMS],
        params: [
            schemeId,
            page,
            perPage,
        ],
    });
}

export function getSchemeChannels(schemeId: string, page = 0, perPage: number = General.PAGE_SIZE_DEFAULT): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getSchemeChannels,
        onSuccess: [SchemeTypes.RECEIVED_SCHEME_CHANNELS],
        params: [
            schemeId,
            page,
            perPage,
        ],
    });
}
