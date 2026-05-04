export interface UserJwt {
    exp: number;
    iat: number;
    jti: string;
    iss: string;
    aud: string;
    sub: string;
    typ: string;
    azp: string;
    session_state: string;
    acr: string;
    realm_access: RealmAccess;
    resource_access: ResourceAccess;
    scope: string;
    email_verified: boolean;
    name: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
    email: string;
}

export interface RealmAccess {
    roles: string[];
}

export interface Account {
    roles: string[];
}

export interface ResourceAccess {
    account: Account;
}
