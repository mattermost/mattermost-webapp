// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {PreferenceType} from '../../../../packages/mattermost-redux/src/types/preferences';

import testConfig from '../../test.config';

import {makeClient} from '.';
import {getOnPremServerConfig} from './default_config';
import {createRandomTeam} from './team';
import {createRandomUser} from './user';

export async function initSetup(userPrefix = 'user', teamPrefix = {name: 'team', displayName: 'Team'}) {
    try {
        const {adminClient, adminUser} = await getAdminClient();

        const adminConfig = await adminClient.updateConfig(getOnPremServerConfig());

        const team = await adminClient.createTeam(createRandomTeam(teamPrefix.name, teamPrefix.displayName));

        const randomUser = createRandomUser(userPrefix);
        const user = await adminClient.createUser(randomUser);
        user.password = randomUser.password;

        await adminClient.addToTeam(team.id, user.id);

        const {client: userClient} = await makeClient(user);

        const preferences: PreferenceType[] = [
            {user_id: user.id, category: 'recommended_next_steps', name: 'hide', value: 'true'},
            {user_id: user.id, category: 'tutorial_step', name: user.id, value: '999'},
        ];
        await userClient.savePreferences(user.id, preferences);

        return {
            adminClient,
            adminUser,
            adminConfig,
            user,
            userClient,
            team,
            offTopicUrl: getUrl(team.name, 'off-topic'),
            townSquareUrl: getUrl(team.name, 'town-square'),
        };
    } catch (err) {
        // log an error for debugging
        console.log(err);
    }
}

export async function getAdminClient() {
    const {
        client: adminClient,
        user: adminUser,
        err,
    } = await makeClient({
        username: testConfig.adminUsername,
        password: testConfig.adminPassword,
    });

    return {adminClient, adminUser, err};
}

function getUrl(teamName, channelName) {
    return `/${teamName}/channels/${channelName}`;
}
