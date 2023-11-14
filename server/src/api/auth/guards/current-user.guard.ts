import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

export class CurrentUserGuard extends AuthGuard('jwt')  {
    handleRequest/*<TUser = any>*/(err: any, user: any)/*: TUser */{
        console.log("Current-user-guard user:", user)
        if (user) return user;
        return null
    }
}