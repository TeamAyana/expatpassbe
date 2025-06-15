import { Body, Controller, Post, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './createUser.dto';
import { ResetPasswordDto } from './resetPassword.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('signup')
  async signupUser(@Body() user: CreateUserDto) {
    return this.userService.signupUser(user);
  }

  @Post('reset-password')
  async resetPassword(@Body() user: ResetPasswordDto) {
    return this.userService.resetPassword(user);
  }

  @Patch('update-username')
  async updateUsername(@Body() body: { email: string; newUsername: string }) {
    return this.userService.updateUsername(body.email, body.newUsername);
  }
}
