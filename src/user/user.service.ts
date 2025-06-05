import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
myHeaders.append('Accept', 'application/json');

interface Auth0Response {
  code?: string;
  policy: string;
  message?: string;
  statusCode?: number;
  description?: string;
}

@Injectable()
export class UserService {
  async signupUser(user: { email: string; password: string }) {
    const { email, password } = user;
    const raw = JSON.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      email: email,
      password: password,
      connection: 'Username-Password-Authentication',
      username: 'Henry',
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    const response: Auth0Response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
      requestOptions,
    ).then((response: Response) => response.json() as Promise<Auth0Response>);
    console.log(response);

    if (response.statusCode === 400) {
      if (response.code === 'invalid_password') {
        // return weak/invalid pass error
        const { policy, message } = response;
        const policies = policy.split('\n').map((el: string) => {
          let cleanText = el.replace(/^\s*\*\s*/gm, '');
          cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
          return cleanText;
        });
        return new HttpException(
          {
            error: 'password error',
            message: message,
            policy: policies,
          },
          HttpStatus.BAD_REQUEST,
        );
      } else if (response.code === 'invalid_signup') {
        return new HttpException(
          {
            error: response.code,
            message: 'Invalid credentials, Please check and try again.',
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        return new HttpException(
          {
            error: response.code,
            message: response.description,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return { error: null, message: 'Signup successful' };
  }

  async resetPassword(user: { email: string }) {
    const { email } = user;
    const raw = JSON.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      email: email,
      connection: 'Username-Password-Authentication',
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password"`,
      requestOptions,
    ).then((response: Response) => response.text());
    console.log(response);

    if (response === 'Not found') {
      return new HttpException(
        {
          error: response,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
