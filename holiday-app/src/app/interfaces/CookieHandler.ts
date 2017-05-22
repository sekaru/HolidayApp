export interface CookieHandler {
    addCookie(key: string, val: string): void;
    getCookie(key: string): string;
    removeCookie(key: string): void;
    checkCookie(key: string): boolean;
}