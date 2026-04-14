package com.lchan.SistemaVentas.Repository;
import com.lchan.SistemaVentas.Entity.Productos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

@Component
public interface ProductoRepository extends JpaRepository<Productos, Integer> {
}