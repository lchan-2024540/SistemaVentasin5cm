package com.lchan.SistemaVentas.Service;
import com.lchan.SistemaVentas.Entity.Ventas;
import com.lchan.SistemaVentas.Repository.VentaRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VentasServiceImplements implements VentasService {

    private final VentaRepository ventaRepository;

    public VentasServiceImplements(VentaRepository ventaRepository) {
        this.ventaRepository = ventaRepository;
    }

    @Override
    public List<Ventas> getAllVentas() {
        return ventaRepository.findAll();
    }

    @Override
    public Ventas getVentasById(Integer codigoVenta) {
        return ventaRepository.findById(codigoVenta).orElse(null);
    }

    @Override
    public Ventas saveVentas(Ventas ventas) throws RuntimeException {
        return ventaRepository.save(ventas);
    }

    @Override
    public Ventas updateVentas(Integer codigoVenta, Ventas ventas) {
        Ventas venta1 = ventaRepository.findById(codigoVenta).orElse(null);

        if (venta1 != null) {
            venta1.setFechaVenta(ventas.getFechaVenta());
            venta1.setTotal(ventas.getTotal());
            venta1.setEstado(ventas.getEstado());
            venta1.setCliente(ventas.getCliente());
            venta1.setUsuario(ventas.getUsuario());
        } else {
            throw new RuntimeException("Venta no encontrada");
        }

        return ventaRepository.save(venta1);
    }

    @Override
    public void deleteVentas(Integer codigoVenta) {
        Ventas venta = ventaRepository.findById(codigoVenta).orElse(null);

        if (venta == null) {
            throw new RuntimeException("Venta no encontrada");
        }

        ventaRepository.delete(venta);
    }
}