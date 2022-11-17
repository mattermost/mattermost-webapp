// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// This is based on "packages/mattermost-redux/src/client/client4.ts". Modified for node client.
// Update should be made in comparison with the base Client4.

import fs from 'fs';
import path from 'path';

import FormData from 'form-data';
import 'isomorphic-unfetch';

import {Client4} from '@mattermost/client';
import {StatusOK} from '@mattermost/types/client4';
import {CustomEmoji} from '@mattermost/types/emojis';
import {PluginManifest} from '@mattermost/types/plugins';
import {License} from '@mattermost/types/config';

export default class Client extends Client4 {
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
