package com.lchan.SistemaVentas.Repository;
import com.lchan.SistemaVentas.Entity.Ventas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

@Component
public interface VentaRepository extends JpaRepository<Ventas, Integer> {
}