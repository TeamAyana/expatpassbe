import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ResponseDto } from 'src/common/dto/response.dto';
import { PrismaService } from '@/prisma/prisma.service';

const myHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  authorization: `Bearer ${process.env.AUTH0_CLIENT_SECRET}`,
};

const AUTH0_CONNECTION = 'Username-Password-Authentication';

interface Auth0Response {
  code?: string;
  policy: string;
  message?: string;
  statusCode?: number;
  description?: string;
}

interface Auth0ErrorResponse {
  error: string;
  message: string;
  policy?: string[];
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async signinUser(user: {
    email: string;
    password: string;
  }): Promise<HttpException | ResponseDto> {
    const { email, password } = user;
    const data = {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.AUTH0_AUDIENCE,
      username: email,
      password,
      scope: 'openid profile email',
      connection: AUTH0_CONNECTION,
      grant_type: 'password',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<Auth0Response>(
          `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
          data,
          { headers: myHeaders },
        ),
      );
      const res = response.data;
      this.logger.log(res);

      if (res.statusCode === 400) {
        const errorMessage = res.description || 'An error occurred.';
        let errorPayload: Auth0ErrorResponse = {
          error: res.code ?? '',
          message: errorMessage,
        };

        if (res.code === 'invalid_password') {
          const policies = res.policy.split('\n').map((el: string) => {
            let cleanText = el.replace(/^\s*\*\s*/gm, '');
            cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
            return cleanText;
          });
          errorPayload = {
            error: 'password error',
            message: res.message ?? '',
            policy: policies,
          };
        } else if (res.code === 'invalid_signup') {
          errorPayload.message =
            'Invalid credentials, Please check and try again.';
        }

        return new HttpException(errorPayload, HttpStatus.BAD_REQUEST);
      }
      return {
        status: 'success',
        message: 'Signup successful',
        data: res,
      };
    } catch (error) {
      this.logger.log(error);
      this.logger.error(error?.response?.data);
      if (error?.response && error?.response?.data) {
        return new HttpException(
          error.response.data,
          error.response.status || 500,
        );
      }
      throw error;
    }
  }

  async signupUser(user: {
    email: string;
    password: string;
  }): Promise<HttpException | ResponseDto> {
    const { email, password } = user;
    const data = {
      client_id: process.env.AUTH0_CLIENT_ID,
      email,
      password,
      connection: AUTH0_CONNECTION,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<Auth0Response>(
          `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
          data,
          { headers: myHeaders },
        ),
      );
      const res = response.data;
      this.logger.log(res);

      if (res.statusCode === 400) {
        const errorMessage = res.description || 'An error occurred.';
        let errorPayload: Auth0ErrorResponse = {
          error: res.code ?? '',
          message: errorMessage,
        };

        if (res.code === 'invalid_password') {
          const policies = res.policy.split('\n').map((el: string) => {
            let cleanText = el.replace(/^\s*\*\s*/gm, '');
            cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
            return cleanText;
          });
          errorPayload = {
            error: 'password error',
            message: res.message ?? '',
            policy: policies,
          };
        } else if (res.code === 'invalid_signup') {
          errorPayload.message =
            'Invalid credentials, Please check and try again.';
        }

        return new HttpException(errorPayload, HttpStatus.BAD_REQUEST);
      }
      return {
        status: 'success',
        message: 'Signin successful',
        data: res,
      };
    } catch (error) {
      this.logger.error(error?.response?.data);
      if (error?.response && error?.response?.data) {
        return new HttpException(
          error.response.data,
          error.response.status || 500,
        );
      }
      throw error;
    }
  }

  async resetPassword(user: {
    email: string;
  }): Promise<HttpException | ResponseDto> {
    const { email } = user;
    try {
      const response = await firstValueFrom(
        this.httpService.post<Auth0Response>(
          `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
          {
            client_id: process.env.AUTH0_CLIENT_ID,
            email: email,
            connection: AUTH0_CONNECTION,
          },
          { headers: myHeaders },
        ),
      );
      const res = response.data;
      this.logger.log(res);

      if (res.statusCode === 400) {
        return new HttpException(
          {
            error: res.description ?? 'Failed to reset password',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        status: 'success',
        message: 'Password reset successful',
        data: res,
      };
    } catch (error) {
      if (error.response && error.response.data) {
        return new HttpException(
          error.response.data,
          error.response.status || 500,
        );
      }
      throw error;
    }
  }

  async updateUsername(
    email: string,
    username: string,
  ): Promise<HttpException | ResponseDto> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      return new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const updatedUser = await this.prisma.users.update({
      where: { id: user.id },
      data: { username },
    });
    return {
      status: 'success',
      message: 'Username updated',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    };
  }

  async getUserInfo(accessToken: string): Promise<HttpException | ResponseDto> {
    try {
      const userInfo = await firstValueFrom(
        this.httpService.get<{
          sub: string;
          nickname: string;
          name: string;
          picture: string;
          updated_at: string;
        }>(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
          headers: {
            Authorization: !accessToken.trim().startsWith('Bearer')
              ? `Bearer ${accessToken}`
              : accessToken,
          },
        }),
      );
      this.logger.log(userInfo.data);
      if (!userInfo.data.name) {
        return new HttpException('Unable to authenticate user', 401);
      }
      const user = await this.prisma.users.upsert({
        where: { email: userInfo.data.name },
        update: {},
        create: {
          email: userInfo.data.name,
          emailVerified: true,
        },
      });
      if (!user) {
        return new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return {
        status: 'success',
        message: 'User info fetched',
        data: user,
      };
    } catch (error) {
      this.logger.log(error);
      this.logger.error(error?.response?.data);
      if (error?.response && error?.response?.data) {
        return new HttpException(
          error.response.data,
          error.response.status || 500,
        );
      }
      throw error;
    }
  }
}
