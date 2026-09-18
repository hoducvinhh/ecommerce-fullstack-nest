
import { BadRequestException, NotFoundException } from "@nestjs/common";

const message: Record<string, string> = {
    'error.common.userNotFound': 'Không tìm thấy người dùng',
    'error.auth.verificationFailed': 'Token xác minh không hợp lệ',
    'error.auth.tokenExpired': 'Token xác minh đã hết hạn',
    'error.auth.emailMismatch': 'Email không khớp mới token xác minh',
};

export function translateApiMessage(key: string): string {
    return message[key] ?? key;
}

export function apiBadRequest(key: string): never {
    throw new BadRequestException(translateApiMessage(key));
}

export function apiNotFound(key: string): never {
    throw new NotFoundException(translateApiMessage(key));
}