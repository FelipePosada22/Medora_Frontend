import { LoginResponseDto } from '../api/auth.api';
import { AuthTokens, AuthUser } from '../models/auth.model';
import { SessionUser } from '../../../core/auth/services/auth-state.service';

/**
 * Auth mapper.
 * Transforms raw API DTOs into domain models.
 * Keeps the domain isolated from API contract changes.
 */
export class AuthMapper {

  static toTokens(dto: LoginResponseDto): AuthTokens {
    return {
      accessToken:  dto.token,
    };
  }

  static toAuthUser(dto: LoginResponseDto): AuthUser {
    return {
      id:       dto.user.id,
      name:     dto.user.name,
      email:    dto.user.email,
      role:     dto.user.role as AuthUser['role'],
      tenantId: dto.user.tenantId,
    };
  }

  static toSessionUser(dto: LoginResponseDto): SessionUser {
    return {
      id:       dto.user.id,
      name:     dto.user.name,
      email:    dto.user.email,
      role:     dto.user.role as SessionUser['role'],
      tenantId: dto.user.tenantId,
    };
  }
}
