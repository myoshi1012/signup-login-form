import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { hash } from 'bcrypt';
import { PrismaService } from '../prisma.service';

const saltRounds = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | undefined> {
    return this.prisma.user.findUnique({ where: userWhereUniqueInput });
  }

  async create(userCreateInput: Prisma.UserCreateInput): Promise<User> {
    try {
      const hashedPassword = await hash(userCreateInput.password, saltRounds);
      return await this.prisma.user.create({
        data: { ...userCreateInput, password: hashedPassword },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            'User already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      throw e;
    }
  }
}
