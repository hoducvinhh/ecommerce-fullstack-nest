import { timingSafeEqual } from "crypto";

export function verifyInternalSecret(
    provided: string | undefined | null,
    expected: string | undefined | null,
): boolean {
    const received = provided?.trim();
    const configured = expected?.trim();

    if (!received || !configured) {
        return false;
    }

    const receivedBuf = Buffer.from(received, 'utf8');
    const configureBuf = Buffer.from(configured, 'utf8');

    if (receivedBuf.length != configureBuf.length)
        return false;
    return timingSafeEqual(receivedBuf, configureBuf);
}