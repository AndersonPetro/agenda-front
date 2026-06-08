import { Builder } from "builder-pattern";
import { AuthRequest } from "./auth.model";

export class LoginBuilder {

  static build(email: string, password: string): AuthRequest {
    return Builder<AuthRequest>()
      .email(email)
      .password(password)
      .build();
  };
}