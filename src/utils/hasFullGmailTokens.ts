export function hasFullGmailTokens(tokens: any): tokens is {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
} {
  return (
    !!tokens.access_token && !!tokens.refresh_token && !!tokens.expiry_date
  );
}
