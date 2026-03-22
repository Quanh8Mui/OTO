package com.garage.oto.repository;

import com.garage.oto.domain.Role;
import com.garage.oto.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCase(String email);

  List<User> findByRole(Role role);
}
