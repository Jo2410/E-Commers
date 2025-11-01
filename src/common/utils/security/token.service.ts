import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { RoleEnum, signatureLevelEnum, TokenEnum } from 'src/common/enums';
import {
  TokenDocument,
  TokenRepository,
  UserDocument,
  UserRepository,
} from 'src/DB';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { parseObjectId } from '../objectId';
import { LoginCredentialsResponse } from 'src/common/entities';


@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}

  generateToken = async ({
    payload,
    options = {
      secret: process.env.ACCESS_USER_SIGNATURE,
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
    },
  }: {
    payload: object;
    options?: JwtSignOptions;
  }): Promise<string> => {
    return await this.jwtService.signAsync(payload, options);
  };

  verifyToken = async ({
    token,
    options = { secret: process.env.ACCESS_USER_SIGNATURE as string },
  }: {
    token: string;
    options?: JwtVerifyOptions;
  }): Promise<JwtPayload> => {
    return this.jwtService.verifyAsync(token, options) as unknown as JwtPayload;
  };

  detectSignatureLevel = async (
    role: RoleEnum = RoleEnum.user,
  ): Promise<signatureLevelEnum> => {
    let signatureLevel: signatureLevelEnum = signatureLevelEnum.Bearer;
    switch (role) {
      case RoleEnum.admin:
        signatureLevel = signatureLevelEnum.System;
        break;

      default:
        signatureLevel = signatureLevelEnum.Bearer;
        break;
    }
    return signatureLevel;
  };

  getSignatures = async (
    signatureLevel: signatureLevelEnum = signatureLevelEnum.Bearer,
  ): Promise<{ access_signature: string; refresh_signature: string }> => {
    let signatures: { access_signature: string; refresh_signature: string } = {
      access_signature: '',
      refresh_signature: '',
    };
    switch (signatureLevel) {
      case signatureLevelEnum.System:
        signatures.access_signature = process.env
          .ACCESS_SYSTEM_TOKEN_SIGNATURE as string;
        signatures.refresh_signature = process.env
          .REFRESH_SYSTEM_TOKEN_SIGNATURE as string;
        break;

      default:
        signatures.access_signature = process.env
          .ACCESS_USER_TOKEN_SIGNATURE as string;
        signatures.refresh_signature = process.env
          .REFRESH_USER_TOKEN_SIGNATURE as string;
        break;
    }
    return signatures;
  };

  createLoginCredentials = async (user: UserDocument):Promise<LoginCredentialsResponse> => {
    const signatureLevel = await this.detectSignatureLevel(user.role);
    const signatures = await this.getSignatures(signatureLevel);
    console.log({ signatures });
    const jwtid = randomUUID();

    const access_token = await this.generateToken({
      payload: { sub: user._id },
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
        jwtid,
        secret: signatures.access_signature,
      },
    });

    const refresh_token = await this.generateToken({
      payload: { sub: user._id },
      options: {
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        jwtid,
        secret: signatures.refresh_signature,
      },
    });

    return { access_token, refresh_token };
  };

  decodeToken = async ({
    authorization,
    tokenType = TokenEnum.access,
  }: {
    authorization: string;
    tokenType?: TokenEnum;
  }) => {
    try {
      const [bearerKey, token] = authorization.split(' ');

      if (!bearerKey || !token) {
        throw new UnauthorizedException('missing token parts ');
      }

      const signatures = await this.getSignatures(
        bearerKey as signatureLevelEnum,
      );

      const decoded = await this.verifyToken({
        token,
        options: {
          secret:
            tokenType === TokenEnum.refresh
              ? signatures.refresh_signature
              : signatures.access_signature,
        },
      });

      if (!decoded?.sub || !decoded?.iat) {
        throw new BadRequestException('in-valid token payload');
      }
      if (
        await this.tokenRepository.findOne({ filter: { jti: decoded.jti } })
      ) {
        throw new UnauthorizedException('invalid or old login credentials');
      }

      const user = (await this.userRepository.findOne({
        filter: { _id: decoded.sub },
      })) as UserDocument;
      if (!user) {
        throw new NotFoundException('not register account');
      }

      if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
        throw new NotFoundException('invalid or old login credentials');
      }

      return { user, decoded };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'something went wrong !!!',
      );
    }
  };

  createRevokeToken = async (decoded: JwtPayload): Promise<TokenDocument> => {
    const [result] =
      (await this.tokenRepository.create({
        data: [
          {
            jti: decoded.jti as string,
            expiresAt: new Date(
              (decoded.iat as number) +
                Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
            ),

            createdBy: parseObjectId(decoded.sub as string),
          },
        ],
      })) || [];

    if (!result) {
      throw new BadRequestException('Fail to generate revoke this token');
    }
    return result;
  };
}
