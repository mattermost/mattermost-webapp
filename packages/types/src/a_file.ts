// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type FooBarBaz = 'foo' | 'bar' | 'baz';

export enum MyEnum {
    Foo = 'foo',
    Bar = 'bar',
    Baz = 'baz',
}

export type MyType = {
    someField: string;
    anotherField: number;
    andAnother?: FooBarBaz;
}
