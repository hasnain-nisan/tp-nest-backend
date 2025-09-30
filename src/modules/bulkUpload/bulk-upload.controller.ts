import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import type { JwtPayload } from 'src/common/interfaces/types.interface';
import { BulkUploadService } from './bulk-upload.service';

@Controller({
  path: 'bulk-upload',
  version: '1',
})
export class BulkUploadController {
  constructor(private readonly bulkUploadService: BulkUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @AuthUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body('uploadType') uploadType: string,
    @Body('clientId') clientId?: string,
    @Body('projectId') projectId?: string,
  ) {
    const result = await this.bulkUploadService.processFile(
      user,
      file,
      uploadType,
      clientId,
      projectId,
    );
    return { success: true, result };
  }
}
