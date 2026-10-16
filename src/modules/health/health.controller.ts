import { Controller, Get, Logger } from '@nestjs/common';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import * as path from 'path';
import * as fs from 'fs';

/**
 * GET /health — returns app version from package.json.
 * Used for deployment verification and monitoring.
 */
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly version: string;

  constructor() {
    this.version = this.findVersion();
  }

  /** Walks up directory tree to find and read version from package.json */
  private findVersion(): string {
    try {
      let dir = __dirname;
      while (dir !== path.dirname(dir)) {
        const pkgPath = path.join(dir, 'package.json');
        if (fs.existsSync(pkgPath)) {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
            version?: string;
          };
          return pkg.version || 'unknown';
        }
        dir = path.dirname(dir);
      }
    } catch (error) {
      this.logger.error('Failed to read package.json version', error);
    }
    return 'unknown';
  }

  /** GET /health — returns { version } in standard ApiResponse format */
  @Get('')
  getVersion(): ApiResponseDto<{ version: string }> {
    return ApiResponseDto.success({ version: this.version });
  }
}
