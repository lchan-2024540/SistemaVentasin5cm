package com.lchan.SistemaVentas.Repository;
import com.lchan.SistemaVentas.Entity.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

@Component
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Integer> {
}