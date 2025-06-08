import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Auth0 authorization URL',
    example: 'https://your-tenant.auth0.com/authorize?response_type=code&client_id=...',
  })
  url: string;
}

export class CallbackResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User profile information',
    example: {
      id: 1,
      auth0Id: 'auth0|123',
      email: 'user@example.com',
      fullname: 'John Doe',
      username: 'johndoe1234',
    },
  })
  user: {
    id: number;
    auth0Id: string;
    email: string;
    fullname: string;
    username: string;
  };
}

export class ProfileResponseDto {
  @ApiProperty({
    description: 'User profile information',
    example: {
      id: 1,
      auth0Id: 'auth0|123',
      email: 'user@example.com',
      fullname: 'John Doe',
      username: 'johndoe1234',
    },
  })
  user: {
    id: number;
    auth0Id: string;
    email: string;
    fullname: string;
    username: string;
  };
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Authentication failed',
  })
  error: string;
} 