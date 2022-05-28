package br.com.guesthesong.guesthesong.repository;


import br.com.guesthesong.guesthesong.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
