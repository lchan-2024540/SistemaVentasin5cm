package com.lchan.SistemaVentas.Service;
import com.lchan.SistemaVentas.Entity.Clientes;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public interface ClientesService {
    List<Clientes> getAllClientes();
    Clientes getClientesById(Integer dpiCliente);
    Clientes saveClientes(Clientes clientes) throws RuntimeException;
    Clientes updateClientes(Integer dpiCliente, Clientes clientes);
    void deleteClientes(Integer dpiCliente);
}