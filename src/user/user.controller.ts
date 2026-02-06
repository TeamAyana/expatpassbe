import { Body, Controller, Post, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import {
  GetUserInfoDto,
  CreateUserDto,
  ResetPasswordDto,
  UpdateUsernameDto,
} from './user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signin')
  async signinUser(@Body() user: CreateUserDto) {
    return await this.userService.signinUser(user);
  }

  @Post('signup')
  async signupUser(@Body() user: CreateUserDto) {
    return await this.userService.signupUser(user);
  }

  @Post('reset-password')
  async resetPassword(@Body() user: ResetPasswordDto) {
    return await this.userService.resetPassword(user);
  }

  @Patch('update-username')
  async updateUsername(@Body() user: UpdateUsernameDto) {
    return await this.userService.updateUsername(user.email, user.username);
  }

  @Post('user-info')
  async getUserInfo(@Body() user: GetUserInfoDto) {
    return await this.userService.getUserInfo(user.access_token);
  }
}
