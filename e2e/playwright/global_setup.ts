// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect} from '@playwright/test';
import {UserProfile} from '@mattermost/types/users';

import {
    Client,
    createRandomTeam,
    getAdminClient,
    getDefaultAdminUser,
    getOnPremServerConfig,
    makeClient,
} from './support/server';
import {defaultTeam} from './support/utils';
import testConfig from './test.config';

const productsAsPlugin = ['com.mattermost.calls', 'focalboard', 'playbooks'];

async function globalSetup() {
    let adminClient: Client | null
    let adminUser: UserProfile | null
    ({adminClient, adminUser} = await getAdminClient());

    if (!adminClient) {
        const {client: firstClient} = await makeClient();
        const defaultAdmin = getDefaultAdminUser();
        await firstClient?.createUser(defaultAdmin, '', '');

        ({client: adminClient, user: adminUser} = await makeClient(defaultAdmin));
    }

    if (adminClient) {
        await sysadminSetup(adminClient, adminUser);
    } else {
        throw new Error("Failed to setup admin: Check that you're able to access the server using the same admin credential.");
    }
}

async function sysadminSetup(client: Client, user: UserProfile | null) {
    // Ensure admin's email is verified.
    if (!user) {
        await client.verifyUserEmail(client.token);
    }

    await client.updateConfig(getOnPremServerConfig());

    // Create default team if not present.
    // Otherwise, create other teams and channels other than the default team cna channels (town-square and off-topic).
    const myTeams = await client.getMyTeams();
    const myDefaultTeam = myTeams && myTeams.length > 0 && myTeams.find((team) => team.name === defaultTeam.name);
    if (!myDefaultTeam) {
        await client.createTeam(createRandomTeam(defaultTeam.name, defaultTeam.displayName, 'O', false));
    } else if (myDefaultTeam && testConfig.resetBeforeTest) {
        await Promise.all(
            myTeams.filter((team) => team.name !== defaultTeam.name).map((team) => client.deleteTeam(team.id))
        );

        const myChannels = await client.getMyChannels(myDefaultTeam.id);
        await Promise.all(
            myChannels
                .filter((channel) => {
                    return (
                        channel.team_id === myDefaultTeam.id &&
                        channel.name !== 'town-square' &&
                        channel.name !== 'off-topic'
                    );
                })
                .map((channel) => client.deleteChannel(channel.id))
        );
    }

    // Ensure all products as plugin are installed and active.
    const pluginStatus = await client.getPluginStatuses();
    const plugins = await client.getPlugins();

    productsAsPlugin.forEach(async (pluginId) => {
        const isInstalled = pluginStatus.some((plugin) => plugin.plugin_id === pluginId);
        if (!isInstalled) {
            // eslint-disable-next-line no-console
            console.log(`${pluginId} is not installed. Related visual test will fail.`);
            return;
        }

        const isActive = plugins.active.some((plugin) => plugin.id === pluginId);
        if (!isActive) {
            const isInactive = plugins.inactive.some((plugin) => plugin.id === pluginId);
            if (isInstalled && isInactive) {
                await client.enablePlugin(pluginId);
                // eslint-disable-next-line no-console
                console.log(`${pluginId} has been activated.`);
            } else {
                // eslint-disable-next-line no-console
                console.log(`${pluginId} is not active. Related visual test will fail.`);
            }
        }
    });

    // Ensure server deployment type is as expected
    if (testConfig.haClusterEnabled) {
        const {haClusterNodeCount, haClusterName} = testConfig;

        const {Enable, ClusterName} = (await client.getConfig()).ClusterSettings;
        expect(Enable, Enable ? '' : 'Should have cluster enabled').toBe(true);

        const sameClusterName = ClusterName === haClusterName;
        expect(
            sameClusterName,
            sameClusterName
                ? ''
                : `Should have cluster name set and as expected. Got "${ClusterName}" but expected "${haClusterName}"`
        ).toBe(true);

        const clusterInfo = await client.getClusterStatus();
        const sameCount = clusterInfo?.length === haClusterNodeCount;
        expect(
            sameCount,
            sameCount
                ? ''
                : `Should match number of nodes in a cluster as expected. Got "${clusterInfo?.length}" but expected "${haClusterNodeCount}"`
        ).toBe(true);

        clusterInfo.forEach((info) =>
            // eslint-disable-next-line no-console
            console.log(`hostname: ${info.hostname}, version: ${info.version}, config_hash: ${info.config_hash}`)
        );
    }
}

export default globalSetup;
