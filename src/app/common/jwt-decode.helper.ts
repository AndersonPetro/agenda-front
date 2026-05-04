import jwt_decode from "jwt-decode";
import {RealmAccess, UserJwt} from "src/app/common/user-jwt";

export class JwtDecodeHelper {

    public static getRoles(test: string): RealmAccess | undefined {
        try {
            return jwt_decode<UserJwt>(test).realm_access;
        } catch (Error) {
            return undefined;
        }
    }

    public static getUser(test: string): string | undefined {
        try {
            return jwt_decode<UserJwt>(test).name;
        } catch (Error) {
            return undefined;
        }
    }
}
