// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AddChannelButtonTreatments, CollapsedThreads} from '../constants/config';

import {Dictionary} from './utilities';

import {ThemeKey} from './themes';

export type ClientConfig = {
    AboutLink: string;
    AddChannelButton: AddChannelButtonTreatments;
    AllowBannerDismissal: string;
    AllowCustomThemes: string;
    AllowedThemes: string;
    AndroidAppDownloadLink: string;
    AndroidLatestVersion: string;
    AndroidMinVersion: string;
    AppDownloadLink: string;
    AsymmetricSigningPublicKey: string;
    AvailableLocales: string;
    BannerColor: string;
    BannerText: string;
    BannerTextColor: string;
    BuildDate: string;
    BuildEnterpriseReady: string;
    BuildHash: string;
    BuildHashEnterprise: string;
    BuildNumber: string;
    CollapsedThreads: CollapsedThreads;
    CustomBrandText: string;
    CustomDescriptionText: string;
    CustomTermsOfServiceId: string;
    CustomTermsOfServiceReAcceptancePeriod: string;
    CustomUrlSchemes: string;
    CWSURL: string;
    DataRetentionEnableFileDeletion: string;
    DataRetentionEnableMessageDeletion: string;
    DataRetentionFileRetentionDays: string;
    DataRetentionMessageRetentionDays: string;
    DefaultClientLocale: string;
    DefaultTheme: ThemeKey;
    DesktopLatestVersion: string;
    DesktopMinVersion: string;
    DiagnosticId: string;
    DiagnosticsEnabled: string;
    EmailLoginButtonBorderColor: string;
    EmailLoginButtonColor: string;
    EmailLoginButtonTextColor: string;
    EmailNotificationContentsType: string;
    EnableAskCommunityLink: string;
    EnableBanner: string;
    EnableBotAccountCreation: string;
    EnableChannelViewedMessages: string;
    EnableCluster: string;
    EnableCommands: string;
    EnableCompliance: string;
    EnableConfirmNotificationsToChannel: string;
    EnableCustomBrand: string;
    EnableCustomEmoji: string;
    EnableCustomUserStatuses: string;
    EnableTimedDND: string;
    EnableCustomTermsOfService: string;
    EnableDeveloper: string;
    EnableDiagnostics: string;
    EnableEmailBatching: string;
    EnableEmailInvitations: string;
    EnableEmojiPicker: string;
    EnableFileAttachments: string;
    EnableFile: string;
    EnableGifPicker: string;
    EnableGuestAccounts: string;
    EnableIncomingWebhooks: string;
    EnableLatex: string;
    EnableLdap: string;
    EnableLinkPreviews: string;
    EnableMarketplace: string;
    EnableMetrics: string;
    EnableMobileFileDownload: string;
    EnableMobileFileUpload: string;
    EnableMultifactorAuthentication: string;
    EnableOAuthServiceProvider: string;
    EnableOpenServer: string;
    EnableOutgoingWebhooks: string;
    EnablePostIconOverride: string;
    EnablePostUsernameOverride: string;
    EnablePreviewFeatures: string;
    EnablePreviewModeBanner: string;
    EnablePublicLink: string;
    EnableReliableWebSockets: string;
    EnableSaml: string;
    EnableSignInWithEmail: string;
    EnableSignInWithUsername: string;
    EnableSignUpWithEmail: string;
    EnableSignUpWithGitLab: string;
    EnableSignUpWithGoogle: string;
    EnableSignUpWithOffice365: string;
    EnableSignUpWithOpenId: string;
    EnableSVGs: string;
    EnableTesting: string;
    EnableThemeSelection: string;
    EnableTutorial: string;
    EnableOnboardingFlow: string;
    EnableUserAccessTokens: string;
    EnableUserCreation: string;
    EnableUserDeactivation: string;
    EnableUserTypingMessages: string;
    EnforceMultifactorAuthentication: string;
    ExperimentalClientSideCertCheck: string;
    ExperimentalClientSideCertEnable: string;
    ExperimentalCloudBilling: string;
    ExperimentalCloudUserLimit: string;
    ExperimentalDataPrefetch: string;
    ExperimentalEnableAuthenticationTransfer: string;
    ExperimentalEnableAutomaticReplies: string;
    ExperimentalEnableClickToReply: string;
    ExperimentalEnableDefaultChannelLeaveJoinMessages: string;
    ExperimentalEnablePostMetadata: string;
    ExperimentalGroupUnreadChannels: string;
    ExperimentalPrimaryTeam: string;
    ExperimentalTimezone: string;
    ExperimentalTownSquareIsReadOnly: string;
    ExperimentalViewArchivedChannels: string;
    FileLevel: string;
    GfycatAPIKey: string;
    GfycatAPISecret: string;
    GoogleDeveloperKey: string;
    GuestAccountsEnforceMultifactorAuthentication: string;
    HasImageProxy: string;
    HelpLink: string;
    IosAppDownloadLink: string;
    IosLatestVersion: string;
    IosMinVersion: string;
    IsDefaultMarketplace: string;
    LdapFirstNameAttributeSet: string;
    LdapLastNameAttributeSet: string;
    LdapLoginButtonBorderColor: string;
    LdapLoginButtonColor: string;
    LdapLoginButtonTextColor: string;
    LdapLoginFieldName: string;
    LdapNicknameAttributeSet: string;
    LdapPositionAttributeSet: string;
    LdapPictureAttributeSet: string;
    LockTeammateNameDisplay: string;
    ManagedResourcePaths: string;
    MaxFileSize: string;
    MaxPostSize: string;
    MaxNotificationsPerChannel: string;
    MinimumHashtagLength: string;
    NoAccounts: string;
    GitLabButtonText: string;
    GitLabButtonColor: string;
    OpenIdButtonText: string;
    OpenIdButtonColor: string;
    PasswordMinimumLength: string;
    PasswordRequireLowercase: string;
    PasswordRequireNumber: string;
    PasswordRequireSymbol: string;
    PasswordRequireUppercase: string;
    PluginsEnabled: string;
    PostEditTimeLimit: string;
    PrivacyPolicyLink: string;
    ReportAProblemLink: string;
    RequireEmailVerification: string;
    RestrictDirectMessage: string;
    RunJobs: string;
    SamlFirstNameAttributeSet: string;
    SamlLastNameAttributeSet: string;
    SamlLoginButtonBorderColor: string;
    SamlLoginButtonColor: string;
    SamlLoginButtonText: string;
    SamlLoginButtonTextColor: string;
    SamlNicknameAttributeSet: string;
    SamlPositionAttributeSet: string;
    SendEmailNotifications: string;
    SendPushNotifications: string;
    ShowEmailAddress: string;
    SiteName: string;
    SiteURL: string;
    SQLDriverName: string;
    SupportEmail: string;
    TeammateNameDisplay: string;
    TermsOfServiceLink: string;
    TimeBetweenUserTypingUpdatesMilliseconds: string;
    Version: string;
    WebsocketPort: string;
    WebsocketSecurePort: string;
    WebsocketURL: string;
};

export type License = {
    id: string;
    issued_at: number;
    starts_at: number;
    expires_at: string;
    customer: LicenseCustomer;
    features: LicenseFeatures;
    sku_name: string;
    short_sku_name: string;
};

export type LicenseCustomer = {
    id: string;
    name: string;
    email: string;
    company: string;
};

export type LicenseFeatures = {
    users?: number;
    ldap?: boolean;
    ldap_groups?: boolean;
    mfa?: boolean;
    google_oauth?: boolean;
    office365_oauth?: boolean;
    compliance?: boolean;
    cluster?: boolean;
    metrics?: boolean;
    mhpns?: boolean;
    saml?: boolean;
    elastic_search?: boolean;
    announcement?: boolean;
    theme_management?: boolean;
    email_notification_contents?: boolean;
    data_retention?: boolean;
    message_export?: boolean;
    custom_permissions_schemes?: boolean;
    custom_terms_of_service?: boolean;
    guest_accounts?: boolean;
    guest_accounts_permissions?: boolean;
    id_loaded?: boolean;
    lock_teammate_name_display?: boolean;
    cloud?: boolean;
    future_features?: boolean;
};

export type ClientLicense = Record<string, string>;

export type DataRetentionPolicy = {
    message_deletion_enabled: boolean;
    file_deletion_enabled: boolean;
    message_retention_cutoff: number;
    file_retention_cutoff: number;
};

export type ServiceSettings = {
    SiteURL: string;
    WebsocketURL: string;
    LicenseFileLocation: string;
    ListenAddress: string;
    ConnectionSecurity: string;
    TLSCertFile: string;
    TLSKeyFile: string;
    TLSMinVer: string;
    TLSStrictTransport: boolean;
    TLSStrictTransportMaxAge: number;
    TLSOverwriteCiphers: string[];
    UseLetsEncrypt: boolean;
    LetsEncryptCertificateCacheFile: string;
    Forward80To443: boolean;
    TrustedProxyIPHeader: string[];
    ReadTimeout: number;
    WriteTimeout: number;
    IdleTimeout: number;
    MaximumLoginAttempts: number;
    GoroutineHealthThreshold: number;
    GoogleDeveloperKey: string;
    EnableOAuthServiceProvider: boolean;
    EnableIncomingWebhooks: boolean;
    EnableOutgoingWebhooks: boolean;
    EnableCommands: boolean;
    EnableOnlyAdminIntegrations: boolean;
    EnablePostUsernameOverride: boolean;
    EnablePostIconOverride: boolean;
    EnableLinkPreviews: boolean;
    EnableTesting: boolean;
    EnableDeveloper: boolean;
    EnableOpenTracing: boolean;
    EnableSecurityFixAlert: boolean;
    EnableInsecureOutgoingConnections: boolean;
    AllowedUntrustedInternalConnections: string;
    EnableMultifactorAuthentication: boolean;
    EnforceMultifactorAuthentication: boolean;
    EnableUserAccessTokens: boolean;
    AllowCorsFrom: string;
    CorsExposedHeaders: string;
    CorsAllowCredentials: boolean;
    CorsDebug: boolean;
    AllowCookiesForSubdomains: boolean;
    ExtendSessionLengthWithActivity: boolean;
    SessionLengthWebInDays: number;
    SessionLengthMobileInDays: number;
    SessionLengthSSOInDays: number;
    SessionCacheInMinutes: number;
    SessionIdleTimeoutInMinutes: number;
    WebsocketSecurePort: number;
    WebsocketPort: number;
    WebserverMode: string;
    EnableCustomEmoji: boolean;
    EnableEmojiPicker: boolean;
    EnableGifPicker: boolean;
    GfycatAPIKey: string;
    GfycatAPISecret: string;
    RestrictCustomEmojiCreation: string;
    RestrictPostDelete: string;
    AllowEditPost: string;
    PostEditTimeLimit: number;
    TimeBetweenUserTypingUpdatesMilliseconds: number;
    EnablePostSearch: boolean;
    MinimumHashtagLength: number;
    EnableUserTypingMessages: boolean;
    EnableChannelViewedMessages: boolean;
    EnableUserStatuses: boolean;
    ExperimentalEnableAuthenticationTransfer: boolean;
    ClusterLogTimeoutMilliseconds: number;
    EnablePreviewFeatures: boolean;
    EnableTutorial: boolean;
    EnableOnboardingFlow: boolean;
    ExperimentalEnableDefaultChannelLeaveJoinMessages: boolean;
    ExperimentalGroupUnreadChannels: string;
    ExperimentalDataPrefetch: boolean;
    ImageProxyType: string;
    ImageProxyURL: string;
    ImageProxyOptions: string;
    EnableAPITeamDeletion: boolean;
    ExperimentalEnableHardenedMode: boolean;
    DisableLegacyMFA: boolean;
    ExperimentalStrictCSRFEnforcement: boolean;
    EnableEmailInvitations: boolean;
    DisableBotsWhenOwnerIsDeactivated: boolean;
    EnableBotAccountCreation: boolean;
    EnableSVGs: boolean;
    EnableLatex: boolean;
    EnableLocalMode: boolean;
    LocalModeSocketLocation: string;
    CollapsedThreads: 'disabled' | 'default_on' | 'default_off';
};

export type TeamSettings = {
    SiteName: string;
    MaxUsersPerTeam: number;
    EnableTeamCreation: boolean;
    EnableCustomUserStatuses: boolean;
    EnableUserCreation: boolean;
    EnableOpenServer: boolean;
    EnableUserDeactivation: boolean;
    RestrictCreationToDomains: string;
    EnableCustomBrand: boolean;
    CustomBrandText: string;
    CustomDescriptionText: string;
    RestrictDirectMessage: string;
    RestrictTeamInvite: string;
    RestrictPublicChannelManagement: string;
    RestrictPrivateChannelManagement: string;
    RestrictPublicChannelCreation: string;
    RestrictPrivateChannelCreation: string;
    RestrictPublicChannelDeletion: string;
    RestrictPrivateChannelDeletion: string;
    RestrictPrivateChannelManageMembers: string;
    UserStatusAwayTimeout: number;
    MaxChannelsPerTeam: number;
    MaxNotificationsPerChannel: number;
    EnableConfirmNotificationsToChannel: boolean;
    TeammateNameDisplay: string;
    ExperimentalViewArchivedChannels: boolean;
    ExperimentalEnableAutomaticReplies: boolean;
    ExperimentalTownSquareIsReadOnly: boolean;
    LockTeammateNameDisplay: boolean;
    ExperimentalPrimaryTeam: string;
    ExperimentalDefaultChannels: string[];
};

export type ClientRequirements = {
    AndroidLatestVersion: string;
    AndroidMinVersion: string;
    DesktopLatestVersion: string;
    DesktopMinVersion: string;
    IosLatestVersion: string;
    IosMinVersion: string;
};

export type SqlSettings = {
    DriverName: string;
    DataSource: string;
    DataSourceReplicas: string[];
    DataSourceSearchReplicas: string[];
    MaxIdleConns: number;
    ConnMaxLifetimeMilliseconds: number;
    MaxOpenConns: number;
    Trace: boolean;
    AtRestEncryptKey: string;
    QueryTimeout: number;
    DisableDatabaseSearch: boolean;
};

export type LogSettings = {
    EnableConsole: boolean;
    ConsoleLevel: string;
    ConsoleJson: boolean;
    EnableFile: boolean;
    FileLevel: string;
    FileJson: boolean;
    FileLocation: string;
    EnableWebhookDebugging: boolean;
    EnableDiagnostics: boolean;
    EnableSentry: boolean;
};

export type ExperimentalAuditSettings = {
    SysLogEnabled: boolean;
    SysLogIP: string;
    SysLogPort: number;
    SysLogTag: string;
    SysLogCert: string;
    SysLogInsecure: boolean;
    SysLogMaxQueueSize: number;
    FileEnabled: boolean;
    FileName: string;
    FileMaxSizeMB: number;
    FileMaxAgeDays: number;
    FileMaxBackups: number;
    FileCompress: boolean;
    FileMaxQueueSize: number;
};

export type NotificationLogSettings = {
    EnableConsole: boolean;
    ConsoleLevel: string;
    ConsoleJson: boolean;
    EnableFile: boolean;
    FileLevel: string;
    FileJson: boolean;
    FileLocation: string;
};

export type PasswordSettings = {
    MinimumLength: number;
    Lowercase: boolean;
    Number: boolean;
    Uppercase: boolean;
    Symbol: boolean;
};

export type FileSettings = {
    EnableFileAttachments: boolean;
    EnableMobileUpload: boolean;
    EnableMobileDownload: boolean;
    MaxFileSize: number;
    DriverName: string;
    Directory: string;
    EnablePublicLink: boolean;
    PublicLinkSalt: string;
    InitialFont: string;
    AmazonS3AccessKeyId: string;
    AmazonS3SecretAccessKey: string;
    AmazonS3Bucket: string;
    AmazonS3Region: string;
    AmazonS3Endpoint: string;
    AmazonS3SSL: boolean;
    AmazonS3SignV2: boolean;
    AmazonS3SSE: boolean;
    AmazonS3Trace: boolean;
};

export type EmailSettings = {
    EnableSignUpWithEmail: boolean;
    EnableSignInWithEmail: boolean;
    EnableSignInWithUsername: boolean;
    SendEmailNotifications: boolean;
    UseChannelInEmailNotifications: boolean;
    RequireEmailVerification: boolean;
    FeedbackName: string;
    FeedbackEmail: string;
    ReplyToAddress: string;
    FeedbackOrganization: string;
    EnableSMTPAuth: boolean;
    SMTPUsername: string;
    SMTPPassword: string;
    SMTPServer: string;
    SMTPPort: string;
    SMTPServerTimeout: number;
    ConnectionSecurity: string;
    SendPushNotifications: boolean;
    PushNotificationServer: string;
    PushNotificationContents: string;
    EnableEmailBatching: boolean;
    EmailBatchingBufferSize: number;
    EmailBatchingInterval: number;
    EnablePreviewModeBanner: boolean;
    SkipServerCertificateVerification: boolean;
    EmailNotificationContentsType: string;
    LoginButtonColor: string;
    LoginButtonBorderColor: string;
    LoginButtonTextColor: string;
};

export type RateLimitSettings = {
    Enable: boolean;
    PerSec: number;
    MaxBurst: number;
    MemoryStoreSize: number;
    VaryByRemoteAddr: boolean;
    VaryByUser: boolean;
    VaryByHeader: string;
};

export type PrivacySettings = {
    ShowEmailAddress: boolean;
    ShowFullName: boolean;
};

export type SupportSettings = {
    TermsOfServiceLink: string;
    PrivacyPolicyLink: string;
    AboutLink: string;
    HelpLink: string;
    ReportAProblemLink: string;
    SupportEmail: string;
    CustomTermsOfServiceEnabled: boolean;
    CustomTermsOfServiceReAcceptancePeriod: number;
};

export type AnnouncementSettings = {
    EnableBanner: boolean;
    BannerText: string;
    BannerColor: string;
    BannerTextColor: string;
    AllowBannerDismissal: boolean;
};

export type ThemeSettings = {
    EnableThemeSelection: boolean;
    DefaultTheme: string;
    AllowCustomThemes: boolean;
    AllowedThemes: string[];
};

export type SSOSettings = {
    Enable: boolean;
    Secret: string;
    Id: string;
    Scope: string;
    AuthEndpoint: string;
    TokenEndpoint: string;
    UserAPIEndpoint: string;
    DiscoveryEndpoint: string;
    ButtonText: string;
    ButtonColor: string;
};

export type Office365Settings = {
    Enable: boolean;
    Secret: string;
    Id: string;
    Scope: string;
    AuthEndpoint: string;
    TokenEndpoint: string;
    UserAPIEndpoint: string;
    DiscoveryEndpoint: string;
    DirectoryId: string;
};

export type LdapSettings = {
    Enable: boolean;
    EnableSync: boolean;
    LdapServer: string;
    LdapPort: number;
    ConnectionSecurity: string;
    BaseDN: string;
    BindUsername: string;
    BindPassword: string;
    UserFilter: string;
    GroupFilter: string;
    GuestFilter: string;
    EnableAdminFilter: boolean;
    AdminFilter: string;
    GroupDisplayNameAttribute: string;
    GroupIdAttribute: string;
    FirstNameAttribute: string;
    LastNameAttribute: string;
    EmailAttribute: string;
    UsernameAttribute: string;
    NicknameAttribute: string;
    IdAttribute: string;
    PositionAttribute: string;
    LoginIdAttribute: string;
    PictureAttribute: string;
    SyncIntervalMinutes: number;
    SkipCertificateVerification: boolean;
    QueryTimeout: number;
    MaxPageSize: number;
    LoginFieldName: string;
    LoginButtonColor: string;
    LoginButtonBorderColor: string;
    LoginButtonTextColor: string;
    Trace: boolean;
};

export type ComplianceSettings = {
    Enable: boolean;
    Directory: string;
    EnableDaily: boolean;
};

export type LocalizationSettings = {
    DefaultServerLocale: string;
    DefaultClientLocale: string;
    AvailableLocales: string;
};

export type SamlSettings = {
    Enable: boolean;
    EnableSyncWithLdap: boolean;
    EnableSyncWithLdapIncludeAuth: boolean;
    IgnoreGuestsLdapSync: boolean;
    Verify: boolean;
    Encrypt: boolean;
    SignRequest: boolean;
    IdpURL: string;
    IdpDescriptorURL: string;
    IdpMetadataURL: string;
    AssertionConsumerServiceURL: string;
    SignatureAlgorithm: string;
    CanonicalAlgorithm: string;
    ScopingIDPProviderId: string;
    ScopingIDPName: string;
    IdpCertificateFile: string;
    PublicCertificateFile: string;
    PrivateKeyFile: string;
    IdAttribute: string;
    GuestAttribute: string;
    EnableAdminAttribute: boolean;
    AdminAttribute: string;
    FirstNameAttribute: string;
    LastNameAttribute: string;
    EmailAttribute: string;
    UsernameAttribute: string;
    NicknameAttribute: string;
    LocaleAttribute: string;
    PositionAttribute: string;
    LoginButtonText: string;
    LoginButtonColor: string;
    LoginButtonBorderColor: string;
    LoginButtonTextColor: string;
};

export type NativeAppSettings = {
    AppDownloadLink: string;
    AndroidAppDownloadLink: string;
    IosAppDownloadLink: string;
};

export type ClusterSettings = {
    Enable: boolean;
    ClusterName: string;
    OverrideHostname: string;
    NetworkInterface: string;
    BindAddress: string;
    AdvertiseAddress: string;
    UseIPAddress: boolean;
    EnableExperimentalGossipEncryption: boolean;
    ReadOnlyConfig: boolean;
    GossipPort: number;
    StreamingPort: number;
    MaxIdleConns: number;
    MaxIdleConnsPerHost: number;
    IdleConnTimeoutMilliseconds: number;
};

export type MetricsSettings = {
    Enable: boolean;
    BlockProfileRate: number;
    ListenAddress: string;
};

export type ExperimentalSettings = {
    ClientSideCertEnable: boolean;
    ClientSideCertCheck: string;
    EnableClickToReply: boolean;
    LinkMetadataTimeoutMilliseconds: number;
    RestrictSystemAdmin: boolean;
    UseNewSAMLLibrary: boolean;
    CloudBilling: boolean;
};

export type AnalyticsSettings = {
    MaxUsersForStatistics: number;
};

export type ElasticsearchSettings = {
    ConnectionURL: string;
    Username: string;
    Password: string;
    EnableIndexing: boolean;
    EnableSearching: boolean;
    EnableAutocomplete: boolean;
    Sniff: boolean;
    PostIndexReplicas: number;
    PostIndexShards: number;
    ChannelIndexReplicas: number;
    ChannelIndexShards: number;
    UserIndexReplicas: number;
    UserIndexShards: number;
    AggregatePostsAfterDays: number;
    PostsAggregatorJobStartTime: string;
    IndexPrefix: string;
    LiveIndexingBatchSize: number;
    BulkIndexingTimeWindowSeconds: number;
    RequestTimeoutSeconds: number;
    SkipTLSVerification: boolean;
    Trace: string;
};

export type BleveSettings = {
    IndexDir: string;
    EnableIndexing: boolean;
    EnableSearching: boolean;
    EnableAutocomplete: boolean;
    BulkIndexingTimeWindowSeconds: number;
};

export type DataRetentionSettings = {
    EnableMessageDeletion: boolean;
    EnableFileDeletion: boolean;
    MessageRetentionDays: number;
    FileRetentionDays: number;
    DeletionJobStartTime: string;
};

export type MessageExportSettings = {
    EnableExport: boolean;
    DownloadExportResults: boolean;
    ExportFormat: string;
    DailyRunTime: string;
    ExportFromTimestamp: number;
    BatchSize: number;
    GlobalRelaySettings: {
        CustomerType: string;
        SMTPUsername: string;
        SMTPPassword: string;
        EmailAddress: string;
    };
};

export type JobSettings = {
    RunJobs: boolean;
    RunScheduler: boolean;
};

export type PluginSettings = {
    Enable: boolean;
    EnableUploads: boolean;
    AllowInsecureDownloadURL: boolean;
    EnableHealthCheck: boolean;
    Directory: string;
    ClientDirectory: string;
    Plugins: Dictionary<any>;
    PluginStates: Dictionary<{Enable: boolean}>;
    EnableMarketplace: boolean;
    EnableRemoteMarketplace: boolean;
    AutomaticPrepackagedPlugins: boolean;
    RequirePluginSignature: boolean;
    MarketplaceURL: string;
    SignaturePublicKeyFiles: string[];
};

export type DisplaySettings = {
    CustomURLSchemes: string[];
    ExperimentalTimezone: boolean;
};

export type GuestAccountsSettings = {
    Enable: boolean;
    AllowEmailAccounts: boolean;
    EnforceMultifactorAuthentication: boolean;
    RestrictCreationToDomains: string;
};

export type ImageProxySettings = {
    Enable: boolean;
    ImageProxyType: string;
    RemoteImageProxyURL: string;
    RemoteImageProxyOptions: string;
};

export type FeatureFlags = Record<string, string>;

export type AdminConfig = {
    ServiceSettings: ServiceSettings;
    TeamSettings: TeamSettings;
    ClientRequirements: ClientRequirements;
    SqlSettings: SqlSettings;
    LogSettings: LogSettings;
    ExperimentalAuditSettings: ExperimentalAuditSettings;
    NotificationLogSettings: NotificationLogSettings;
    PasswordSettings: PasswordSettings;
    FileSettings: FileSettings;
    EmailSettings: EmailSettings;
    RateLimitSettings: RateLimitSettings;
    PrivacySettings: PrivacySettings;
    SupportSettings: SupportSettings;
    AnnouncementSettings: AnnouncementSettings;
    ThemeSettings: ThemeSettings;
    GitLabSettings: SSOSettings;
    GoogleSettings: SSOSettings;
    Office365Settings: Office365Settings;
    OpenIdSettings: SSOSettings;
    LdapSettings: LdapSettings;
    ComplianceSettings: ComplianceSettings;
    LocalizationSettings: LocalizationSettings;
    SamlSettings: SamlSettings;
    NativeAppSettings: NativeAppSettings;
    ClusterSettings: ClusterSettings;
    MetricsSettings: MetricsSettings;
    ExperimentalSettings: ExperimentalSettings;
    AnalyticsSettings: AnalyticsSettings;
    ElasticsearchSettings: ElasticsearchSettings;
    BleveSettings: BleveSettings;
    DataRetentionSettings: DataRetentionSettings;
    MessageExportSettings: MessageExportSettings;
    JobSettings: JobSettings;
    PluginSettings: PluginSettings;
    DisplaySettings: DisplaySettings;
    GuestAccountsSettings: GuestAccountsSettings;
    ImageProxySettings: ImageProxySettings;
    FeatureFlags: FeatureFlags;
};

export type EnvironmentConfigSettings<T> = {
    [P in keyof T]: boolean;
}

export type EnvironmentConfig = {
    [P in keyof AdminConfig]: EnvironmentConfigSettings<AdminConfig[P]>;
}

export type WarnMetricStatus = {
    id: string;
    limit: number;
    acked: boolean;
    store_status: string;
};
