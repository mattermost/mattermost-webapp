// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import Input from 'components/widgets/inputs/input/input';

import {localizeMessage} from 'utils/utils';

import './directory.scss';
import PeopleList from './people_list';

const Directory = () => {

    const [searchTerm, setSearchTerm] = useState('');

    const searchOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    useEffect(() => {
        // Search for a user 
    }, [searchTerm]);

    return (
        <>
            <header
                className={classNames('header directory-header')}
            >
                <div className='top'>
                    <span className='people-title'>
                        <FormattedMessage 
                            defaultMessage={'{value} people'}
                            id={'directory.people.count'}
                            values={{value: 186}}
                        />
                    </span>
                    
                </div>
                <div className='bottom'>
                    <Input
                        type='text'
                        placeholder={localizeMessage('directory.people.search', 'Search for a person')}
                        onChange={searchOnChange}
                        value={searchTerm}
                        data-testid='searchInput'
                        className={'people-search-input'}
                        inputPrefix={<i className={'icon icon-magnify'}/>}
                    />
                </div>
            </header>

            <PeopleList 
                people={[
                        {
                          "id": "zjs3czatobf3j8z9s33cwh6tba",
                          "create_at": 1663780109454,
                          "update_at": 1663780109539,
                          "delete_at": 0,
                          "username": "aaron.medina",
                          
                          "auth_service": "",
                          "email": "user-5@sample.mattermost.com",
                          "nickname": "Centidel",
                          "first_name": "Aaron",
                          "last_name": "Medina",
                          "position": "Systems Administrator I",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "bx1sbcom8jgh7cyhzdud7izd4y",
                          "create_at": 1663780109441,
                          "update_at": 1663780109537,
                          "delete_at": 0,
                          "username": "aaron.peterson",
                          
                          "auth_service": "",
                          "email": "user-7@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Aaron",
                          "last_name": "Peterson",
                          "position": "Biostatistician II",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "b3k83hphrj8w7jiygy6361kdgc",
                          "create_at": 1663780114488,
                          "update_at": 1663780114578,
                          "delete_at": 0,
                          "username": "aaron.ward",
                          
                          "auth_service": "",
                          "email": "user-36@sample.mattermost.com",
                          "nickname": "Avavee",
                          "first_name": "Aaron",
                          "last_name": "Ward",
                          "position": "Sales Representative",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "jt3c3hcto3fp9jzrko5ozqmt7a",
                          "create_at": 1663780116414,
                          "update_at": 1663780116509,
                          "delete_at": 0,
                          "username": "albert.torres",
                          
                          "auth_service": "",
                          "email": "user-49@sample.mattermost.com",
                          "nickname": "Lazz",
                          "first_name": "Albert",
                          "last_name": "Torres",
                          "position": "Accountant IV",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "ck73xdsp3frgi887xpc9cz1w8a",
                          "create_at": 1663780116414,
                          "update_at": 1663780116496,
                          "delete_at": 0,
                          "username": "alice.johnston",
                          
                          "auth_service": "",
                          "email": "user-50@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Alice",
                          "last_name": "Johnston",
                          "position": "Account Executive",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "6y4jeaq6ntn8zn3rdbtkk87s1w",
                          "create_at": 1663780109432,
                          "update_at": 1663780109544,
                          "delete_at": 0,
                          "username": "anne.stone",
                          
                          "auth_service": "",
                          "email": "user-4@sample.mattermost.com",
                          "nickname": "Realpoint",
                          "first_name": "Anne",
                          "last_name": "Stone",
                          "position": "Design Engineer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "1c1qoc9ojpd79j1egwcp3k5efa",
                          "create_at": 1663780111123,
                          "update_at": 1663780111225,
                          "delete_at": 0,
                          "username": "ashley.berry",
                          
                          "auth_service": "",
                          "email": "user-12@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Ashley",
                          "last_name": "Berry",
                          "position": "Registered Nurse",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "ouypfmwwhbfym8uxsbgau4wyaw",
                          "create_at": 1663780111194,
                          "update_at": 1663780111280,
                          "delete_at": 0,
                          "username": "benjamin.bennett",
                          
                          "auth_service": "",
                          "email": "user-16@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Benjamin",
                          "last_name": "Bennett",
                          "position": "Social Worker",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "s3q9pk5qhtb8zrt5bc3cjp76ge",
                          "create_at": 1663780113179,
                          "update_at": 1663780113257,
                          "delete_at": 0,
                          "username": "betty.campbell",
                          
                          "auth_service": "",
                          "email": "user-35@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Betty",
                          "last_name": "Campbell",
                          "position": "Engineer I",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "9ezxczsq7tnizm9aut16a1nnso",
                          "create_at": 1663780111312,
                          "update_at": 1663780111394,
                          "delete_at": 0,
                          "username": "brenda.boyd",
                          
                          "auth_service": "",
                          "email": "user-20@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Brenda",
                          "last_name": "Boyd",
                          "position": "Human Resources Manager",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "ztfpi97rbifyfqufjbiasrda5a",
                          "create_at": 1663780109428,
                          "update_at": 1663780109518,
                          "delete_at": 0,
                          "username": "christina.wilson",
                          
                          "auth_service": "",
                          "email": "user-6@sample.mattermost.com",
                          "nickname": "Leenti",
                          "first_name": "Christina",
                          "last_name": "Wilson",
                          "position": "Account Representative I",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "uafeogqysfrtdfdzo5fyn3ntke",
                          "create_at": 1663780109465,
                          "update_at": 1663780109596,
                          "delete_at": 0,
                          "username": "craig.reed",
                          
                          "auth_service": "",
                          "email": "user-11@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Craig",
                          "last_name": "Reed",
                          "position": "Chief Design Engineer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "664au9g873yqmjitrtaq374hee",
                          "create_at": 1663780114626,
                          "update_at": 1663780114697,
                          "delete_at": 0,
                          "username": "deborah.freeman",
                          
                          "auth_service": "",
                          "email": "user-41@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Deborah",
                          "last_name": "Freeman",
                          "position": "Nuclear Power Engineer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "itfgjmmomjfgpc5mhj18c7oify",
                          "create_at": 1663780109432,
                          "update_at": 1663780109518,
                          "delete_at": 0,
                          "username": "diana.wells",
                          
                          "auth_service": "",
                          "email": "user-8@sample.mattermost.com",
                          "nickname": "Rhycero",
                          "first_name": "Diana",
                          "last_name": "Wells",
                          "position": "Programmer IV",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "7hmg1ct41fb9pc94df1x574jpc",
                          "create_at": 1663780116744,
                          "update_at": 1663780116837,
                          "delete_at": 0,
                          "username": "douglas.daniels",
                          
                          "auth_service": "",
                          "email": "user-57@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Douglas",
                          "last_name": "Daniels",
                          "position": "Electrical Engineer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "yeww7mpmgbfjjdx1ekzis8k5jh",
                          "create_at": 1663780111182,
                          "update_at": 1663780111274,
                          "delete_at": 0,
                          "username": "emily.meyer",
                          
                          "auth_service": "",
                          "email": "user-14@sample.mattermost.com",
                          "nickname": "Realcube",
                          "first_name": "Emily",
                          "last_name": "Meyer",
                          "position": "VP Accounting",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "o7mswqfpri8cum5z1i5drpyhhy",
                          "create_at": 1663780113009,
                          "update_at": 1663780113086,
                          "delete_at": 0,
                          "username": "eugene.rodriguez",
                          
                          "auth_service": "",
                          "email": "user-30@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Eugene",
                          "last_name": "Rodriguez",
                          "position": "Food Chemist",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "in7qeec1dtr8f8sgoo3da8fudw",
                          "create_at": 1663780112857,
                          "update_at": 1663780112939,
                          "delete_at": 0,
                          "username": "frances.elliott",
                          
                          "auth_service": "",
                          "email": "user-24@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Frances",
                          "last_name": "Elliott",
                          "position": "Financial Analyst",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "mhuakgbtopb37jjz7ph9x4cq9w",
                          "create_at": 1663780112938,
                          "update_at": 1663780113009,
                          "delete_at": 0,
                          "username": "helen.hunter",
                          
                          "auth_service": "",
                          "email": "user-28@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Helen",
                          "last_name": "Hunter",
                          "position": "General Manager",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "h3yxgwmaptrd9eh5cex9wf3zzr",
                          "create_at": 1663780109488,
                          "update_at": 1663780109595,
                          "delete_at": 0,
                          "username": "jack.wheeler",
                          
                          "auth_service": "",
                          "email": "user-3@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Jack",
                          "last_name": "Wheeler",
                          "position": "Civil Engineer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "cqcjftr6pfr55dqtj5owxchwao",
                          "create_at": 1663780111186,
                          "update_at": 1663780111267,
                          "delete_at": 0,
                          "username": "janice.armstrong",
                          
                          "auth_service": "",
                          "email": "user-15@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Janice",
                          "last_name": "Armstrong",
                          "position": "Occupational Therapist",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "gmuhakt43pb5fg76po4ieifgoe",
                          "create_at": 1663780114687,
                          "update_at": 1663780114757,
                          "delete_at": 0,
                          "username": "jeremy.williamson",
                          
                          "auth_service": "",
                          "email": "user-44@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Jeremy",
                          "last_name": "Williamson",
                          "position": "Senior Cost Accountant",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "qpk191okfjgofepr6fknzut34a",
                          "create_at": 1663780114929,
                          "update_at": 1663780115015,
                          "delete_at": 0,
                          "username": "jerry.ramos",
                          
                          "auth_service": "",
                          "email": "user-47@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Jerry",
                          "last_name": "Ramos",
                          "position": "Product Engineer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "78kd7g61mpywzgzt3iuiuzrxgr",
                          "create_at": 1663780111387,
                          "update_at": 1663780111482,
                          "delete_at": 0,
                          "username": "johnny.hansen",
                          
                          "auth_service": "",
                          "email": "user-22@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Johnny",
                          "last_name": "Hansen",
                          "position": "Structural Analysis Engineer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "a58efec1sbgymbowmbfmccngmc",
                          "create_at": 1663780116634,
                          "update_at": 1663780116727,
                          "delete_at": 0,
                          "username": "jonathan.watson",
                          
                          "auth_service": "",
                          "email": "user-55@sample.mattermost.com",
                          "nickname": "Twitterlist",
                          "first_name": "Jonathan",
                          "last_name": "Watson",
                          "position": "Systems Administrator II",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "4bkhppthmtfzxje9y16xmurnjo",
                          "create_at": 1663780116492,
                          "update_at": 1663780116573,
                          "delete_at": 0,
                          "username": "juan.adams",
                          
                          "auth_service": "",
                          "email": "user-52@sample.mattermost.com",
                          "nickname": "Vimbo",
                          "first_name": "Juan",
                          "last_name": "Adams",
                          "position": "Registered Nurse",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "ungsdhzu1fbiifoxotppmtb5pc",
                          "create_at": 1663780114572,
                          "update_at": 1663780114644,
                          "delete_at": 0,
                          "username": "judith.gray",
                          
                          "auth_service": "",
                          "email": "user-38@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Judith",
                          "last_name": "Gray",
                          "position": "Administrative Assistant I",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "xrfgxzjj33ntbd7g15hznhjyio",
                          "create_at": 1663780109432,
                          "update_at": 1663780109550,
                          "delete_at": 0,
                          "username": "karen.austin",
                          
                          "auth_service": "",
                          "email": "user-9@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Karen",
                          "last_name": "Austin",
                          "position": "Physical Therapy Assistant",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "eams1mb1sinb9k8qwd6ggtc6oc",
                          "create_at": 1663780116516,
                          "update_at": 1663780116602,
                          "delete_at": 0,
                          "username": "karen.martin",
                          
                          "auth_service": "",
                          "email": "user-53@sample.mattermost.com",
                          "nickname": "Jaloo",
                          "first_name": "Karen",
                          "last_name": "Martin",
                          "position": "Quality Engineer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "tre3u4ki4idb3fj8a8x35nukra",
                          "create_at": 1663780116402,
                          "update_at": 1663780116489,
                          "delete_at": 0,
                          "username": "kathryn.mills",
                          
                          "auth_service": "",
                          "email": "user-48@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Kathryn",
                          "last_name": "Mills",
                          "position": "Research Associate",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "mjzc7waxnfnc7bmzdznj3ude8o",
                          "create_at": 1663780116574,
                          "update_at": 1663780116663,
                          "delete_at": 0,
                          "username": "laura.wagner",
                          
                          "auth_service": "",
                          "email": "user-54@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Laura",
                          "last_name": "Wagner",
                          "position": "Financial Advisor",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "doy44j3gqfnyiqsf99mbart8jy",
                          "create_at": 1663780112910,
                          "update_at": 1663780112980,
                          "delete_at": 0,
                          "username": "lillian.lawson",
                          
                          "auth_service": "",
                          "email": "user-27@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Lillian",
                          "last_name": "Lawson",
                          "position": "Web Developer II",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "17ahc5taxtgymenfkfosy3ig5c",
                          "create_at": 1663780116871,
                          "update_at": 1663780116951,
                          "delete_at": 0,
                          "username": "lisa.gilbert",
                          
                          "auth_service": "",
                          "email": "user-59@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Lisa",
                          "last_name": "Gilbert",
                          "position": "Financial Analyst",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "8dz7newcnpbtzxcspzmt8o1u7r",
                          "create_at": 1663780113057,
                          "update_at": 1663780113127,
                          "delete_at": 0,
                          "username": "lori.holmes",
                          
                          "auth_service": "",
                          "email": "user-32@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Lori",
                          "last_name": "Holmes",
                          "position": "Physical Therapy Assistant",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "hunbm9wkbbnk7mafknmqmx73ka",
                          "create_at": 1663780114768,
                          "update_at": 1663780114837,
                          "delete_at": 0,
                          "username": "margaret.morgan",
                          
                          "auth_service": "",
                          "email": "user-45@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Margaret",
                          "last_name": "Morgan",
                          "position": "Mechanical Systems Engineer",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "ct1197ohobnm5mzbfkzr8j1a4r",
                          "create_at": 1663780114671,
                          "update_at": 1663780114746,
                          "delete_at": 0,
                          "username": "mark.rodriguez",
                          
                          "auth_service": "",
                          "email": "user-43@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Mark",
                          "last_name": "Rodriguez",
                          "position": "VP Quality Control",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "o5ib1sdcqigf3cye8xbsydic3o",
                          "create_at": 1663780113064,
                          "update_at": 1663780113142,
                          "delete_at": 0,
                          "username": "matthew.mendoza",
                          
                          "auth_service": "",
                          "email": "user-33@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Matthew",
                          "last_name": "Mendoza",
                          "position": "Professor",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "36u75jsz1iyf3eu8mbf1ao759r",
                          "create_at": 1663780114859,
                          "update_at": 1663780114957,
                          "delete_at": 0,
                          "username": "mildred.barnes",
                          
                          "auth_service": "",
                          "email": "user-46@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Mildred",
                          "last_name": "Barnes",
                          "position": "Information Systems Manager",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "jjbgdazyrbda9y31mhp5zjdfxh",
                          "create_at": 1663780113041,
                          "update_at": 1663780113109,
                          "delete_at": 0,
                          "username": "mildred.price",
                          
                          "auth_service": "",
                          "email": "user-31@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Mildred",
                          "last_name": "Price",
                          "position": "Software Engineer I",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "r7964inxffdexq3s4urjy57b5a",
                          "create_at": 1663780113084,
                          "update_at": 1663780113159,
                          "delete_at": 0,
                          "username": "nancy.roberts",
                          
                          "auth_service": "",
                          "email": "user-34@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Nancy",
                          "last_name": "Roberts",
                          "position": "Geologist I",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "qp49jnd4af8zpjrxwynei5dnoa",
                          "create_at": 1663780112894,
                          "update_at": 1663780112969,
                          "delete_at": 0,
                          "username": "peter.jones",
                          
                          "auth_service": "",
                          "email": "user-25@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Peter",
                          "last_name": "Jones",
                          "position": "Account Executive",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "it9c1s9t37rnbf3gitj7ztzu9y",
                          "create_at": 1663780111305,
                          "update_at": 1663780111391,
                          "delete_at": 0,
                          "username": "ralph.watson",
                          
                          "auth_service": "",
                          "email": "user-19@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Ralph",
                          "last_name": "Watson",
                          "position": "Analyst Programmer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "wi4ot4quepyfjmseskbxaww9ha",
                          "create_at": 1663780114608,
                          "update_at": 1663780114677,
                          "delete_at": 0,
                          "username": "raymond.austin",
                          
                          "auth_service": "",
                          "email": "user-39@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Raymond",
                          "last_name": "Austin",
                          "position": "Research Assistant I",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "kg58e9nnp7yazps6pu3gnpjuio",
                          "create_at": 1663780113003,
                          "update_at": 1663780113075,
                          "delete_at": 0,
                          "username": "raymond.fisher",
                          
                          "auth_service": "",
                          "email": "user-29@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Raymond",
                          "last_name": "Fisher",
                          "position": "Business Systems Development Analyst",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "myt4g5xrs7f6m8p5gjjpjf1gry",
                          "create_at": 1663780111218,
                          "update_at": 1663780111292,
                          "delete_at": 0,
                          "username": "raymond.fox",
                          
                          "auth_service": "",
                          "email": "user-17@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Raymond",
                          "last_name": "Fox",
                          "position": "Financial Advisor",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "g75ojnj4sfdsucurpmuzxofpah",
                          "create_at": 1663780111291,
                          "update_at": 1663780111367,
                          "delete_at": 0,
                          "username": "rebecca.ruiz",
                          
                          "auth_service": "",
                          "email": "user-18@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Rebecca",
                          "last_name": "Ruiz",
                          "position": "Structural Analysis Engineer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "cengn5688tfr9epsydzejqgrao",
                          "create_at": 1663780111320,
                          "update_at": 1663780111396,
                          "delete_at": 0,
                          "username": "richard.carr",
                          
                          "auth_service": "",
                          "email": "user-21@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Richard",
                          "last_name": "Carr",
                          "position": "Account Executive",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "t3384g6oc7gpbjptnto5kztqxe",
                          "create_at": 1663780114540,
                          "update_at": 1663780114618,
                          "delete_at": 0,
                          "username": "robert.sims",
                          
                          "auth_service": "",
                          "email": "user-37@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Robert",
                          "last_name": "Sims",
                          "position": "Legal Assistant",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "4sm5qnp4ipn6mxxta8684uioxe",
                          "create_at": 1663780109432,
                          "update_at": 1663780109524,
                          "delete_at": 0,
                          "username": "robert.ward",
                          
                          "auth_service": "",
                          "email": "user-10@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Robert",
                          "last_name": "Ward",
                          "position": "Accountant IV",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "yy16qe4rnfbgjf3exncc4pxq4e",
                          "create_at": 1663780114615,
                          "update_at": 1663780114685,
                          "delete_at": 0,
                          "username": "robin.gomez",
                          
                          "auth_service": "",
                          "email": "user-40@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Robin",
                          "last_name": "Gomez",
                          "position": "VP Product Management",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "niwsgpqpabg53recbpswef5nwy",
                          "create_at": 1663780116666,
                          "update_at": 1663780116758,
                          "delete_at": 0,
                          "username": "roy.garza",
                          
                          "auth_service": "",
                          "email": "user-56@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Roy",
                          "last_name": "Garza",
                          "position": "Product Engineer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "hkh4nktnof87tyjmbqk1znezho",
                          "create_at": 1663780116424,
                          "update_at": 1663780116507,
                          "delete_at": 0,
                          "username": "ruth.mason",
                          
                          "auth_service": "",
                          "email": "user-51@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Ruth",
                          "last_name": "Mason",
                          "position": "Programmer IV",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "fb15jdf49jy5upaagdy9wirr8h",
                          "create_at": 1663780111450,
                          "update_at": 1663780111539,
                          "delete_at": 0,
                          "username": "ryan.dunn",
                          
                          "auth_service": "",
                          "email": "user-23@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Ryan",
                          "last_name": "Dunn",
                          "position": "Sales Associate",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "uk8sjrkuw3d83r47ghfrcypskr",
                          "create_at": 1663780111126,
                          "update_at": 1663780111234,
                          "delete_at": 0,
                          "username": "samuel.palmer",
                          
                          "auth_service": "",
                          "email": "user-13@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Samuel",
                          "last_name": "Palmer",
                          "position": "Actuary",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "on6rnfognbfim81ysnohosexgc",
                          "create_at": 1663780109432,
                          "update_at": 1663780109522,
                          "delete_at": 0,
                          "username": "samuel.tucker",
                          
                          "auth_service": "",
                          "email": "user-2@sample.mattermost.com",
                          "nickname": "Oyonder",
                          "first_name": "Samuel",
                          "last_name": "Tucker",
                          "position": "Statistician IV",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "8ms3x1ohs3bamjxi5ajao3rhxc",
                          "create_at": 1663780116766,
                          "update_at": 1663780116859,
                          "delete_at": 0,
                          "username": "sean.rose",
                          
                          "auth_service": "",
                          "email": "user-58@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Sean",
                          "last_name": "Rose",
                          "position": "VP Product Management",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "aq4whnw8nbd8x85qobjufgsa5h",
                          "create_at": 1663780109432,
                          "update_at": 1663780245492,
                          "delete_at": 0,
                          "username": "sysadmin",
                          
                          "auth_service": "",
                          "email": "sysadmin@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Kenneth",
                          "last_name": "Moreno",
                          "position": "Software Test Engineer III",
                          "roles": "system_admin system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "America/Barbados",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "o97kmau3a7bkpjjpd5ftmpeder",
                          "create_at": 1663780114632,
                          "update_at": 1663780114706,
                          "delete_at": 0,
                          "username": "theresa.murphy",
                          
                          "auth_service": "",
                          "email": "user-42@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Theresa",
                          "last_name": "Murphy",
                          "position": "GIS Technical Architect",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "dowh1ubodjf5i8ohcd4ag4tzoy",
                          "create_at": 1663780109443,
                          "update_at": 1663780109566,
                          "delete_at": 0,
                          "username": "user-1",
                          
                          "auth_service": "",
                          "email": "user-1@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Victor",
                          "last_name": "Welch",
                          "position": "Design Engineer",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        },
                        {
                          "id": "aq4ssrcjojbjbkbz3jyypd1kya",
                          "create_at": 1663780112899,
                          "update_at": 1663780112971,
                          "delete_at": 0,
                          "username": "wayne.stone",
                          
                          "auth_service": "",
                          "email": "user-26@sample.mattermost.com",
                          "nickname": "",
                          "first_name": "Wayne",
                          "last_name": "Stone",
                          "position": "Account Executive",
                          "roles": "system_user",
                          "locale": "en",
                          "timezone": {
                            "automaticTimezone": "",
                            "manualTimezone": "",
                            "useAutomaticTimezone": "true"
                          },
                          "disable_welcome_email": false
                        }
                      ]} 
                hasNextPage={false} 
                isNextPageLoading={false} 
                searchTerms={''}            
            />
        </>
    );
};

export default Directory;
