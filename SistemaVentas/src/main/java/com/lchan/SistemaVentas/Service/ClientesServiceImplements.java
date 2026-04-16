package com.lchan.SistemaVentas.Service;

import com.lchan.SistemaVentas.Entity.Clientes;
import com.lchan.SistemaVentas.Entity.Ventas;
import com.lchan.SistemaVentas.Repository.ClienteRepository;
import com.lchan.SistemaVentas.Repository.DetalleVentaRepository;
import com.lchan.SistemaVentas.Repository.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClientesServiceImplements implements ClientesService {

    private final ClienteRepository      clienteRepository;
    private final VentaRepository        ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;

    public ClientesServiceImplements(ClienteRepository clienteRepository,
                                     VentaRepository ventaRepository,
                                     DetalleVentaRepository detalleVentaRepository) {
        this.clienteRepository      = clienteRepository;
        this.ventaRepository        = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
    }

    @Override
    public List<Clientes> getAllClientes() {
        return clienteRepository.findAll();
    }

    @Override
    public Clientes getClientesById(Integer dpiCliente) {
        return clienteRepository.findById(dpiCliente).orElse(null);
    }

    @Override
    public Clientes saveClientes(Clientes clientes) throws RuntimeException {
        return clienteRepository.save(clientes);
    }

    @Override
    public Clientes updateClientes(Integer dpiCliente, Clientes clientes) {
        Clientes cliente1 = clienteRepository.findById(dpiCliente)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        cliente1.setNombreCliente(clientes.getNombreCliente());
        cliente1.setApellidoCliente(clientes.getApellidoCliente());
        cliente1.setDireccion(clientes.getDireccion());
        cliente1.setEstado(clientes.getEstado());

        return clienteRepository.save(cliente1);
    }

    @Override
    @Transactional
    public void deleteClientes(Integer dpiCliente) {
        Clientes cliente = clienteRepository.findById(dpiCliente)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        List<Ventas> ventas = ventaRepository.findAll().stream()
                .filter(v -> v.getCliente() != null
                        && dpiCliente.equals(v.getCliente().getDpiCliente()))
                .toList();

        for (Ventas venta : ventas) {
            detalleVentaRepository.findAll().stream()
                    .filter(d -> d.getVenta() != null
                            && venta.getCodigoVenta().equals(d.getVenta().getCodigoVenta()))
                    .forEach(detalleVentaRepository::delete);

            ventaRepository.delete(venta);
        }

        clienteRepository.delete(cliente);
    }
}