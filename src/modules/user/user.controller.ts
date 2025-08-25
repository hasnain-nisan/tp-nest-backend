import { Controller, Get } from '@nestjs/common';
import { ApiMessage } from 'src/common/decorators/api-message.decorator';

@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor() {}

  @Get()
  @ApiMessage('User controller route')
  helper() {
    return 'User controller is working!';
  }
}
