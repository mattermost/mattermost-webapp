// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Team} from '../../../../packages/mattermost-redux/src/types/teams';
import {PreferenceType} from '../../../../packages/mattermost-redux/src/types/preferences';
import {UserProfile} from '../../../../packages/mattermost-redux/src/types/users';

import {makeClient} from '.';
import {getOnPremServerConfig} from './default_config';
import {createRandomTeam} from './team';
import {createRandomUser} from './user';

const adminUsername = process.env.PW_ADMIN_USERNAME || 'sysadmin';
const adminPassword = process.env.PW_ADMIN_PASSWORD || 'Sys@dmin-sample1';

export async function initSetup(userPrefix = 'user', teamPrefix = {name: 'team', displayName: 'Team'}) {
    try {
        const {adminClient, adminUser} = await getAdminClient();

        const adminConfig = await adminClient.updateConfig(getOnPremServerConfig());

        const team = await adminClient.createTeam(createRandomTeam(teamPrefix.name, teamPrefix.displayName) as Team);

        const randomUser = createRandomUser(userPrefix) as UserProfile;
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
    const {client: adminClient, user: adminUser} = await makeClient({
        username: adminUsername,
        password: adminPassword,
    });

    return {adminClient, adminUser};
}

function getUrl(teamName, channelName) {
    return `/${teamName}/channels/${channelName}`;
}
