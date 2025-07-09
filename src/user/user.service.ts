import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const myHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
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

  constructor(private readonly httpService: HttpService) {}

  async signupUser(user: { email: string; password: string }) {
    const { email, password } = user;
    const data = {
      client_id: process.env.AUTH0_CLIENT_ID,
      email,
      password,
      connection: AUTH0_CONNECTION,
      username: email.split('@')[0],
    };
    this.logger.log(data);

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
      return { error: null, message: 'Signup successful' };
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

  async loginUser(user: { email: string; password: string }) {
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
          `https://${process.env.AUTH0_DOMAIN}/dbconnections/authorize`,
          data,
          { headers: myHeaders },
        ),
      );
      const res = response.data;
      this.logger.log(res);

      if (res.statusCode === 400) {
        return new HttpException(
          { error: res.description ?? 'Failed to login' },
          HttpStatus.BAD_REQUEST,
        );
      }
      return { error: null, message: 'Login successful' };
    } catch (error) {
      if (error?.response && error?.response?.data) {
        return new HttpException(
          error.response.data,
          error.response.status || 500,
        );
      }
      throw error;
    }
  }

  async resetPassword(user: { email: string }) {
    const { email } = user;
    const data = {
      client_id: process.env.AUTH0_CLIENT_ID,
      email: email,
      connection: AUTH0_CONNECTION,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
          data,
          { headers: myHeaders },
        ),
      );
      const res = response.data;
      console.log(res);

      if (res === 'Not found') {
        return new HttpException(
          {
            error: res,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return res;
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

  async updateUsername(email: string, newUsername: string) {
    // 1. Get Auth0 Management API token
    const tokenResponse = await firstValueFrom(
      this.httpService.post(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        {
          client_id: process.env.AUTH0_MGMT_CLIENT_ID,
          client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
          grant_type: 'client_credentials',
        },
        { headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const accessToken = tokenResponse.data.access_token;

    // 2. Get user by email
    const userResponse = await firstValueFrom(
      this.httpService.get(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email`,
        {
          params: { email },
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      ),
    );
    const user = userResponse.data[0];
    if (!user) {
      throw new HttpException(
        { error: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    // 3. Update username
    const updateResponse = await firstValueFrom(
      this.httpService.patch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(user.user_id)}`,
        { username: newUsername },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      ),
    );
    return { message: 'Username updated', user: updateResponse.data };
  }
}
