package com.lchan.SistemaVentas.Service;

import com.lchan.SistemaVentas.Entity.Ventas;
import com.lchan.SistemaVentas.Repository.DetalleVentaRepository;
import com.lchan.SistemaVentas.Repository.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VentasServiceImplements implements VentasService {

    private final VentaRepository        ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;

    public VentasServiceImplements(VentaRepository ventaRepository,
                                   DetalleVentaRepository detalleVentaRepository) {
        this.ventaRepository        = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
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
        Ventas venta1 = ventaRepository.findById(codigoVenta)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        venta1.setFechaVenta(ventas.getFechaVenta());
        venta1.setTotal(ventas.getTotal());
        venta1.setEstado(ventas.getEstado());
        venta1.setCliente(ventas.getCliente());
        venta1.setUsuario(ventas.getUsuario());

        return ventaRepository.save(venta1);
    }

    @Override
    @Transactional
    public void deleteVentas(Integer codigoVenta) {
        Ventas venta = ventaRepository.findById(codigoVenta)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));

        detalleVentaRepository.findAll().stream()
                .filter(d -> d.getVenta() != null
                        && codigoVenta.equals(d.getVenta().getCodigoVenta()))
                .forEach(detalleVentaRepository::delete);

        ventaRepository.delete(venta);
    }
}