import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Auth0Service } from '../auth0/auth0.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from "argon2";
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly auth0Service: Auth0Service,
    private prisma: PrismaService,
  ) { }

  private readonly auth0Domain = process.env.AUTH0_DOMAIN;
  private readonly auth0ClientId = process.env.AUTH0_CLIENT_ID;
  private readonly auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET;

  async signup(email: string, password: string, username: string) {
    const url = `https://${this.auth0Domain}/dbconnections/signup`;
    const data = {
      client_id: this.auth0ClientId,
      email,
      username,
      password,
      connection: 'Username-Password-Authentication',
    };

    try {
      const response = await axios.post(url, data);
      // hash password
      const hashPassword = await argon2.hash(password);
      // Store user details in PostgreSQL
      await this.prisma.user.create({
        data: {
          email,
          username,
          password: hashPassword,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message || 'Sign up failed');
    }
  }

  async validateUser(token: string): Promise<any> {
    const user = await this.auth0Service.verifyToken(token);
    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.sub };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async handleSocialLogin(profile: any) {
    const { email, name } = profile; // Extract user details from the profile

    // Check if the user already exists in the database
    let user = await this.prisma.user.findUnique({ where: { email } });

    // If the user does not exist, create a new user
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          username: name,
        },
      });
    }

    return user;
  }
}
