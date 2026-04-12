export function buildShareUrl(shareBaseUrl: string, sharePath: string) {
  return new URL(sharePath, shareBaseUrl).toString();
}
