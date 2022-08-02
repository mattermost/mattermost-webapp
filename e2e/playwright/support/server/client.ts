// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// This is based on "packages/mattermost-redux/src/client/client4.ts". Modified for node client.
// Update should be made in comparison with the base Client4.

import fs from 'fs';
import path from 'path';

import FormData from 'form-data';
import fetch from 'isomorphic-unfetch';

import Client4, {
    ClientError,
    parseAndMergeNestedHeaders,
    HEADER_X_VERSION_ID,
    HEADER_X_CLUSTER_ID,
} from '../../../../packages/mattermost-redux/src/client/client4';
import {UserProfile} from '../../../../packages/mattermost-redux/src/types/users';
import {Options, StatusOK, ClientResponse} from '../../../../packages/mattermost-redux/src/types/client4';
import {CustomEmoji} from '../../../../packages/mattermost-redux/src/types/emojis';
import {PluginManifest} from '../../../../packages/mattermost-redux/src/types/plugins';
import {License} from '../../../../packages/mattermost-redux/src/types/config';

import {buildQueryString} from '../../../../packages/mattermost-redux/src/utils/helpers_client';

type ItemsFromCookie = {
    token?: string;
    userId?: string;
    csrf?: string;
};

export default class Client extends Client4 {
    cookies: string[] | null;

    setCookies(cookies: string[]) {
        this.cookies = cookies;
    }

    getItemsFromCookie(rawCookies: string[]): ItemsFromCookie {
        return rawCookies
            .map((cookie) => cookie.split(';')[0])
            .reduce((acc: ItemsFromCookie, cookie) => {
                if (cookie.startsWith('MMAUTHTOKEN=')) {
                    acc['token'] = cookie.replace('MMAUTHTOKEN=', '');
                }
                if (cookie.startsWith('MMUSERID=')) {
                    acc['userId'] = cookie.replace('MMUSERID=', '');
                }
                if (cookie.startsWith('MMCSRF=')) {
                    acc['csrf'] = cookie.replace('MMCSRF=', '');
                }

                return acc;
            }, {});
    }

    createUser = (user: UserProfile, token?: string, inviteId?: string, redirect?: string) => {
        this.trackEvent('api', 'api_users_create');

        const queryParams: any = {};

        if (token) {
            queryParams.t = token;
        }

        if (inviteId) {
            queryParams.iid = inviteId;
        }

        if (redirect) {
            queryParams.r = redirect;
        }

        return this.doFetch<UserProfile>(`${this.getUsersRoute()}${buildQueryString(queryParams)}`, {
            method: 'post',
            body: JSON.stringify(user),
        });
    };

    uploadProfileImageX = (userId: string, filePath: string) => {
        this.trackEvent('api', 'api_users_update_profile_picture');

        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('image', fileData, path.basename(filePath));

        const request: any = {
            method: 'post',
            body: formData,
        };

        if (formData.getBoundary) {
            request.headers = {
                'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
            };
        }

        return this.doFetch<StatusOK>(`${this.getUserRoute(userId)}/image`, request);
    };

    doFetchAndSetCookies = async <T>(url: string, options: Options): Promise<ClientResponse<T>> => {
        const response = await fetch(url, this.getOptions(options));
        const headers = parseAndMergeNestedHeaders(response.headers);

        let data;
        try {
            data = await response.json();

            const cookies = response.headers.raw()['set-cookie'];
            this.setCookies(cookies);

            const {token, userId, csrf} = this.getItemsFromCookie(cookies);
            this.setToken(token);
            this.setUserId(userId);
            this.setCSRF(csrf);
        } catch (err) {
            throw new ClientError(this.getUrl(), {
                message: 'Received invalid response from the server.',
                intl: {
                    id: 'mobile.request.invalid_response',
                    defaultMessage: 'Received invalid response from the server.',
                },
                url,
            });
        }

        if (headers.has(HEADER_X_VERSION_ID) && !headers.get('Cache-Control')) {
            const serverVersion = headers.get(HEADER_X_VERSION_ID);
            if (serverVersion && this.serverVersion !== serverVersion) {
                this.serverVersion = serverVersion;
            }
        }

        if (headers.has(HEADER_X_CLUSTER_ID)) {
            const clusterId = headers.get(HEADER_X_CLUSTER_ID);
            if (clusterId && this.clusterId !== clusterId) {
                this.clusterId = clusterId;
            }
        }

        if (response.ok) {
            return {
                response,
                headers,
                data,
            };
        }

        const msg = data.message || '';

        if (this.logToConsole) {
            console.error(msg); // eslint-disable-line no-console
        }

        throw new ClientError(this.getUrl(), {
            message: msg,
            server_error_id: data.id,
            status_code: data.status_code,
            url,
        });
    };

    login = async (loginId: string, password: string, token = '', deviceId = '', ldapOnly = false) => {
        this.trackEvent('api', 'api_users_login');

        if (ldapOnly) {
            this.trackEvent('api', 'api_users_login_ldap');
        }

        const body: any = {
            device_id: deviceId,
            login_id: loginId,
            password,
            token,
        };

        if (ldapOnly) {
            body.ldap_only = 'true';
        }

        return this.doFetchAndSetCookies<UserProfile>(`${this.getUsersRoute()}/login`, {
            method: 'post',
            body: JSON.stringify(body),
        });
    };

    setTeamIconX = (teamId: string, filePath: string) => {
        this.trackEvent('api', 'api_team_set_team_icon');

        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('image', fileData, path.basename(filePath));

        const request: any = {
            method: 'post',
            body: formData,
        };

        if (formData.getBoundary) {
            request.headers = {
                'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
            };
        }

        return this.doFetch<StatusOK>(`${this.getTeamRoute(teamId)}/image`, request);
    };

    createCustomEmojiX = (emoji: CustomEmoji, filePath: string) => {
        this.trackEvent('api', 'api_emoji_custom_add');

        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('image', fileData, path.basename(filePath));
        formData.append('emoji', JSON.stringify(emoji));

        const request: any = {
            method: 'post',
            body: formData,
        };

        if (formData.getBoundary) {
            request.headers = {
                'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
            };
        }

        return this.doFetch<CustomEmoji>(`${this.getEmojisRoute()}`, request);
    };

    uploadBrandImageX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('image', fileData, path.basename(filePath));
        const request: any = {
            method: 'post',
            body: formData,
        };

        if (formData.getBoundary) {
            request.headers = {
                'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
            };
        }

        return this.doFetch<StatusOK>(`${this.getBrandRoute()}/image`, request);
    };

    uploadPublicSamlCertificateX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('certificate', fileData, path.basename(filePath));

        return this.doFetch<StatusOK>(`${this.getBaseRoute()}/saml/certificate/public`, {
            method: 'post',
            body: formData,
        });
    };

    uploadPrivateSamlCertificateX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('certificate', fileData, path.basename(filePath));

        return this.doFetch<StatusOK>(`${this.getBaseRoute()}/saml/certificate/private`, {
            method: 'post',
            body: formData,
        });
    };

    uploadPublicLdapCertificateX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('certificate', fileData, path.basename(filePath));

        return this.doFetch<StatusOK>(`${this.getBaseRoute()}/ldap/certificate/public`, {
            method: 'post',
            body: formData,
        });
    };

    uploadPrivateLdapCertificateX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('certificate', fileData, path.basename(filePath));

        return this.doFetch<StatusOK>(`${this.getBaseRoute()}/ldap/certificate/private`, {
            method: 'post',
            body: formData,
        });
    };

    uploadIdpSamlCertificateX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('certificate', fileData, path.basename(filePath));

        return this.doFetch<StatusOK>(`${this.getBaseRoute()}/saml/certificate/idp`, {
            method: 'post',
            body: formData,
        });
    };

    uploadLicenseX = (filePath: string) => {
        this.trackEvent('api', 'api_license_upload');

        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('license', fileData, path.basename(filePath));

        const request: any = {
            method: 'post',
            body: formData,
        };

        if (formData.getBoundary) {
            request.headers = {
                'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
            };
        }

        return this.doFetch<License>(`${this.getBaseRoute()}/license`, request);
    };

    uploadPluginX = async (filePath: string, force = false) => {
        this.trackEvent('api', 'api_plugin_upload');

        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        if (force) {
            formData.append('force', 'true');
        }
        formData.append('license', fileData, path.basename(filePath));

        const request: any = {
            method: 'post',
            body: formData,
        };

        if (formData.getBoundary) {
            request.headers = {
                'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
            };
        }

        return this.doFetch<PluginManifest>(this.getPluginsRoute(), request);
    };
}
