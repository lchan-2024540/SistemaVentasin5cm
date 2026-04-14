package com.lchan.SistemaVentas.Service;
import com.lchan.SistemaVentas.Entity.Clientes;
import com.lchan.SistemaVentas.Repository.ClienteRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClientesServiceImplements implements ClientesService {

    private final ClienteRepository clienteRepository;

    public ClientesServiceImplements(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
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
        Clientes cliente1 = clienteRepository.findById(dpiCliente).orElse(null);

        if (cliente1 != null) {
            cliente1.setNombreCliente(clientes.getNombreCliente());
            cliente1.setApellidoCliente(clientes.getApellidoCliente());
            cliente1.setDireccion(clientes.getDireccion());
            cliente1.setEstado(clientes.getEstado());
        } else {
            throw new RuntimeException("Cliente no encontrado");
        }

        return clienteRepository.save(cliente1);
    }

    @Override
    public void deleteClientes(Integer dpiCliente) {
        Clientes cliente = clienteRepository.findById(dpiCliente).orElse(null);

        if (cliente == null) {
            throw new RuntimeException("Cliente no encontrado");
        }

        clienteRepository.delete(cliente);
    }
}