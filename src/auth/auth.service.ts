import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async syncUser(auth0User: { userId: string; email: string; name: string }) {
    let user = await this.prisma.user.findUnique({
      where: { auth0Id: auth0User.userId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          auth0Id: auth0User.userId,
          email: auth0User.email,
          fullname: auth0User.name,
          username: this.generateUsername(auth0User.email),
        },
      });
    }

    return user;
  }

  private generateUsername(email: string) {
    return email.split('@')[0] + Math.floor(Math.random() * 10000);
  }
}
