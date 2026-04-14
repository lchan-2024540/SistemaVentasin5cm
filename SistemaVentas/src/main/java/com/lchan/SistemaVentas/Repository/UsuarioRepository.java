package com.lchan.SistemaVentas.Repository;
import com.lchan.SistemaVentas.Entity.Usuarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

@Component
public interface UsuarioRepository extends JpaRepository<Usuarios, Integer> {
}