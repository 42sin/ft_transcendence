export type UserDetails = {
    email: string;
    username: string;
};

//TODO  bit repetitive for now
export type JwtPayload = {
    sub: number,
    email: string,
    tfa: boolean
    // username: string;
    // userID: number;
}
export class TfaCodeDto {
    tfaCode: string
}
export class UpdateUserDto    {

}

