import { Body, Controller, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { SendAuthEmailDto } from './dto/send-auth-email.dto';


@ApiExcludeController()
@Controller('internal/email')
@UseGuards(InternalEmailController)
export class InternalEmailController {
  constructor(private readonly emailService: EmailService) {

    @Post('verification')
    @HttpCode(HttpStatus.OK)
    async sendVerification(@Body() body: SendAuthEmailDto){
      const sent = await this.emailService.sendVerificationEmail(
        body.to,
        body.name,
        body.url,
      );
      return { success: sent };
    }

  }

}