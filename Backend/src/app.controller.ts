import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Health check endpoint (Public - No authentication required)' })
  @ApiResponse({ status: 200, description: 'Returns a welcome message confirming the API is running' })
  getHello(): string {
    return this.appService.getHello();
  }
}
