package br.com.guesthesong.guesthesong.repository;

import br.com.guesthesong.guesthesong.model.Any;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnyRepository extends JpaRepository<Any, Long> {
}
