export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  accessScopes: Record<string, boolean>;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
