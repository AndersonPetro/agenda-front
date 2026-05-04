import { Builder } from "builder-pattern";
import { AuthRequest } from "./auth.model";

export class LoginBuilder {

  static build(username: string, password: string): AuthRequest {
    return Builder<AuthRequest>()
      .username(username)
      .password(password)
      .build();
  };
}