// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// This is based on "packages/client/src/client4.ts". Modified for node client.
// Update should be made in comparison with the base Client4.

import fs from 'fs';
import path from 'path';

import FormData from 'form-data';
import 'isomorphic-unfetch';

import Client4 from '@mattermost/client/client4';
import {Options, StatusOK} from '@mattermost/types/client4';
import {CustomEmoji} from '@mattermost/types/emojis';
import {PluginManifest} from '@mattermost/types/plugins';
import {License} from '@mattermost/types/config';

export default class Client extends Client4 {
    uploadProfileImageX = (userId: string, filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('image', fileData, path.basename(filePath));
        const options = this.getFormDataOptions(formData);

        return this.doFetch<StatusOK>(`${this.getUserRoute(userId)}/image`, options);
    };

    setTeamIconX = (teamId: string, filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('image', fileData, path.basename(filePath));
        const options = this.getFormDataOptions(formData);

        return this.doFetch<StatusOK>(`${this.getTeamRoute(teamId)}/image`, options);
    };

    createCustomEmojiX = (emoji: CustomEmoji, filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('image', fileData, path.basename(filePath));
        formData.append('emoji', JSON.stringify(emoji));
        const options = this.getFormDataOptions(formData);

        return this.doFetch<CustomEmoji>(`${this.getEmojisRoute()}`, options);
    };

    uploadBrandImageX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('image', fileData, path.basename(filePath));
        const options = this.getFormDataOptions(formData);

        return this.doFetch<StatusOK>(`${this.getBrandRoute()}/image`, options);
    };

    uploadPublicSamlCertificateX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('certificate', fileData, path.basename(filePath));
        const options = this.getFormDataOptions(formData);

        return this.doFetch<StatusOK>(`${this.getBaseRoute()}/saml/certificate/public`, options);
    };

    uploadPrivateSamlCertificateX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('certificate', fileData, path.basename(filePath));
        const options = this.getFormDataOptions(formData);

        return this.doFetch<StatusOK>(`${this.getBaseRoute()}/saml/certificate/private`, options);
    };

    uploadPublicLdapCertificateX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('certificate', fileData, path.basename(filePath));
        const options = this.getFormDataOptions(formData);

        return this.doFetch<StatusOK>(`${this.getBaseRoute()}/ldap/certificate/public`, options);
    };

    uploadPrivateLdapCertificateX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('certificate', fileData, path.basename(filePath));
        const options = this.getFormDataOptions(formData);

        return this.doFetch<StatusOK>(`${this.getBaseRoute()}/ldap/certificate/private`, options);
    };

    uploadIdpSamlCertificateX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('certificate', fileData, path.basename(filePath));
        const options = this.getFormDataOptions(formData);

        return this.doFetch<StatusOK>(`${this.getBaseRoute()}/saml/certificate/idp`, options);
    };

    uploadLicenseX = (filePath: string) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('license', fileData, path.basename(filePath));
        const options = this.getFormDataOptions(formData);

        return this.doFetch<License>(`${this.getBaseRoute()}/license`, options);
    };

    uploadPluginX = async (filePath: string, force = false) => {
        const fileData = fs.readFileSync(filePath);
        const formData = new FormData();
        if (force) {
            formData.append('force', 'true');
        }
        formData.append('license', fileData, path.basename(filePath));
        const options = this.getFormDataOptions(formData);

        return this.doFetch<PluginManifest>(this.getPluginsRoute(), options);
    };

    getFormDataOptions = (formData: FormData): Options => {
        return {
            method: 'post',
            body: formData,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
            },
        };
    };
}
