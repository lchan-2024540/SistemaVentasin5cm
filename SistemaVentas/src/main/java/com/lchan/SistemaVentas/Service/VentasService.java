package com.lchan.SistemaVentas.Service;
import com.lchan.SistemaVentas.Entity.Ventas;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public interface VentasService {
    List<Ventas> getAllVentas();
    Ventas getVentasById(Integer codigoVenta);
    Ventas saveVentas(Ventas ventas) throws RuntimeException;
    Ventas updateVentas(Integer codigoVenta, Ventas ventas);
    void deleteVentas(Integer codigoVenta);
}