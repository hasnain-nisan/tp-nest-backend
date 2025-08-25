import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiMessage('Login completed successfully')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
