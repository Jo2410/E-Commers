import { BadRequestException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export const PreAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!(req.headers.authorization?.split(' ')?.length == 2)) {
    throw new BadRequestException('Missing authorization key');
  }

  next();
};
