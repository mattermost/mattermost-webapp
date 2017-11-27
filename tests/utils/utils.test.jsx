import * as Utils from 'utils/utils.jsx';

describe('Utils.isValidPassword', function() {
    test('Password min/max length enforced if no EE password requirements set', function() {
        for (const data of [
            {
                password: 'four',
                config: { // not EE, so password just has to be min < length < max
                    isEnterprise: false,
                    isLicensed: true,
                    isPasswordRequirements: true
                },
                valid: false
            },
            {
                password: 'thistestpasswordismorethansixtyfourcharacterslongsoitstoolongtobeapassword',
                config: { // not EE, so password just has to be min < length < max
                    isEnterprise: false,
                    isLicensed: true,
                    isPasswordRequirements: true
                },
                valid: false
            },
            {
                password: 'thisisavalidpassword',
                config: { // not EE, so password just has to be min < length < max
                    isEnterprise: false,
                    isLicensed: true,
                    isPasswordRequirements: true
                },
                valid: true
            },
            {
                password: 'four',
                config: { // not licensed, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: false,
                    isPasswordRequirements: true
                },
                valid: false
            },
            {
                password: 'thistestpasswordismorethansixtyfourcharacterslongsoitstoolongtobeapassword',
                config: { // not licensed, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: false,
                    isPasswordRequirements: true
                },
                valid: false
            },
            {
                password: 'thisisavalidpassword',
                config: { // not licensed, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: false,
                    isPasswordRequirements: true
                },
                valid: true
            },
            {
                password: 'four',
                config: { // no password requirements, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: false
                },
                valid: false
            },
            {
                password: 'thistestpasswordismorethansixtyfourcharacterslongsoitstoolongtobeapassword',
                config: { // no password requirements, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: false
                },
                valid: false
            },
            {
                password: 'thisisavalidpassword',
                config: { // no password requirements, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: false
                },
                valid: true
            }
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });

    test('Minimum length enforced', function() {
        for (const data of [
            {
                password: 'tooshort',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 10,
                    requireLowercase: false,
                    requireUppercase: false,
                    requireNumber: false,
                    requireSymbol: false
                },
                valid: false
            },
            {
                password: 'longenoughpassword',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 10,
                    requireLowercase: false,
                    requireUppercase: false,
                    requireNumber: false,
                    requireSymbol: false
                },
                valid: true
            }
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });

    test('Require lowercase enforced', function() {
        for (const data of [
            {
                password: 'UPPERCASE',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: false,
                    requireNumber: false,
                    requireSymbol: false
                },
                valid: false
            },
            {
                password: 'SOMELowercase',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: false,
                    requireNumber: false,
                    requireSymbol: false
                },
                valid: true
            }
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });

    test('Require uppercase enforced', function() {
        for (const data of [
            {
                password: 'lowercase',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: false,
                    requireUppercase: true,
                    requireNumber: false,
                    requireSymbol: false
                },
                valid: false
            },
            {
                password: 'SOMEUppercase',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: false,
                    requireUppercase: true,
                    requireNumber: false,
                    requireSymbol: false
                },
                valid: true
            }
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });

    test('Require number enforced', function() {
        for (const data of [
            {
                password: 'NoNumbers',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: true,
                    requireNumber: true,
                    requireSymbol: false
                },
                valid: false
            },
            {
                password: 'S0m3Numb3rs',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: true,
                    requireNumber: true,
                    requireSymbol: false
                },
                valid: true
            }
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });

    test('Require symbol enforced', function() {
        for (const data of [
            {
                password: 'N0Symb0ls',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: true,
                    requireNumber: true,
                    requireSymbol: true
                },
                valid: false
            },
            {
                password: 'S0m3Symb0!s',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: true,
                    requireNumber: true,
                    requireSymbol: true
                },
                valid: true
            }
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });
});
