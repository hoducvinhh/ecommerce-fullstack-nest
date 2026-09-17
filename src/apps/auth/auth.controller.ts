import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { SessionAuthService } from './session-auth/session-auth.service';
import { User } from '../user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { success } from 'zod';

@ApiTags('Xác thực (Auth)')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly sessionAuth: SessionAuthService,
    ) { }

    private mapUserResponse(user: User) {
        return plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues: true,
        });
    }
    private async sessionFromRequest(req: { headers: any }) {
        const ctx = await this.sessionAuth.resolveSessionContext(req.headers);

        if (!ctx)
            return null;

        return {
            user: this.mapUserResponse(ctx.user),
            session: {
                token: ctx.session.token,
                expiresAt: ctx.session.expiresAt,
            }
        }
    }


    @Get('verify-email')
    async verifyEmail(
        @Query('token') token: string,
        @Query("email") email: string,
    ) {
        return this.authService.verifyEmailCustom(token, email);
    }

    async getCurrentUser(req: any) {
        const session = await this.sessionFromRequest(req);

        if (!session?.user) {
            return {
                success: false,
                authenticated: false,
                message: 'Not authenticated',
                user: null,
            };
        }

        const fullUser = await this.userService.getUser(session.user.id);
    }


}
