package com.lchan.SistemaVentas.Service;
import com.lchan.SistemaVentas.Entity.DetalleVenta;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public interface DetalleVentaService {
    List<DetalleVenta> getAllDetalleVenta();
    DetalleVenta getDetalleVentaById(Integer codigoDetalleVenta);
    DetalleVenta saveDetalleVenta(DetalleVenta detalleVenta) throws RuntimeException;
    DetalleVenta updateDetalleVenta(Integer codigoDetalleVenta, DetalleVenta detalleVenta);
    void deleteDetalleVenta(Integer codigoDetalleVenta);
}