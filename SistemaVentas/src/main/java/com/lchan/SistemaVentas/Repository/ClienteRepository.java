package com.lchan.SistemaVentas.Repository;
import com.lchan.SistemaVentas.Entity.Clientes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

@Component
public interface ClienteRepository extends JpaRepository<Clientes, Integer> {
}