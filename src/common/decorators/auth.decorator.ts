import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { roleName, Roles } from "./role.decorator";
import { RoleEnum, TokenEnum } from "../enums";
import { token } from "./tokenType.decorator";
import { AuthenticationGuard } from "../guards/authentication/authentication.guard";
import { AuthorizationGuard } from "../guards/authorization/authorization.guard";


// export function Auth(role:RoleEnum[],type:TokenEnum=TokenEnum.access){
//     return applyDecorators(


//     )
// }


export function Auth(roles:RoleEnum[],type:TokenEnum=TokenEnum.access){
    return applyDecorators(
        token(type),
        Roles(roles),
        UseGuards(AuthenticationGuard,AuthorizationGuard),
    )
}





//role=>Role 

//type=>Token