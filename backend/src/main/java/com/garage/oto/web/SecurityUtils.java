package com.garage.oto.web;

import com.garage.oto.domain.Role;
import com.garage.oto.domain.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

  private SecurityUtils() {}

  public static User requireUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !(auth.getPrincipal() instanceof User u)) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
    return u;
  }

  public static void requireRole(Role... roles) {
    User u = requireUser();
    for (Role r : roles) {
      if (u.getRole() == r) {
        return;
      }
    }
    throw new ApiException(HttpStatus.FORBIDDEN, "Insufficient role");
  }
}
