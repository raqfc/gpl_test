import { IAuth } from "../../src/middlewares/auth/IAuth";
import { AuthToken } from "../../src/middlewares/auth/AuthMidddlewareTypes";

class MockIAuth implements IAuth {
    async verifyIdToken(token: string): Promise<AuthToken | null> {

        return null;
    }
// {
//     "name": "Raquel Freire",
//     "jw": {
//         "c": {
//             "278526DF": [
//                 "a"
//             ],
//             "DDB8F77A": [
//                 "a",
//                 "b"
//             ],
//             "F0250101": [
//                 "a"
//             ],
//             "EB65A78E": [
//                 "a",
//                 "b"
//             ]
//         },
//         "type": {
//             "cli": true
//         }
//     },
//     "iss": "https://securetoken.google.com/volandevjw",
//     "aud": "volandevjw",
//     "auth_time": 1665508075,
//     "user_id": "oEW4b8T2qV4c4ZyrdHNr",
//     "sub": "oEW4b8T2qV4c4ZyrdHNr",
//     "iat": 1665508104,
//     "exp": 1665511704,
//     "email": "raqfreirec@gmail.com",
//     "email_verified": false,
//     "firebase": {
//         "identities": {
//             "email": [
//                 "raqfreirec@gmail.com"
//             ]
//         },
//         "sign_in_provider": "password"
//     },
//     "uid": "oEW4b8T2qV4c4ZyrdHNr"
// }
}