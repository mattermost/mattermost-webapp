// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
export type RelationOneToOne<E extends {id: string}, T> = {
    [x in E['id']]: T;
};
export type RelationOneToMany<E1 extends {id: string}, E2 extends {id: string}> = {
    [x in E1['id']]: Array<E2['id']>;
};
export type RelationOneToManyUnique<E1 extends {id: string}, E2 extends {id: string}> = {
    [x in E1['id']]: Set<E2['id']>;
};
export type IDMappedObjects<E extends {id: string}> = RelationOneToOne<E, E>;
export type UserIDMappedObjects<E extends {user_id: string}> = {
    [x in E['user_id']]: E;
};
export type NameMappedObjects<E extends {name: string}> = {
    [x in E['name']]: E;
};
export type UsernameMappedObjects<E extends {username: string}> = {
    [x in E['username']]: E;
};
export type EmailMappedObjects<E extends {email: string}> = {
    [x in E['email']]: E;
};

export type Dictionary<T> = {
    [key: string]: T;
};
