import { Body, Controller, Post, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './createUser.dto';
import { ResetPasswordDto } from './resetPassword.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('signup')
  async signupUser(@Body() user: CreateUserDto) {
    return await this.userService.signupUser(user);
  }

  @Post('login')
  async loginUser(@Body() user: { email: string; password: string }) {
    return await this.userService.loginUser(user);
  }

  @Post('reset-password')
  async resetPassword(@Body() user: ResetPasswordDto) {
    return await this.userService.resetPassword(user);
  }

  @Patch('update-username')
  async updateUsername(@Body() body: { email: string; newUsername: string }) {
    return await this.userService.updateUsername(body.email, body.newUsername);
  }
}
