package com.lchan.SistemaVentas.Service;
import com.lchan.SistemaVentas.Entity.Usuarios;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public interface UsuariosService {
    List<Usuarios> getAllUsuarios();
    Usuarios getUsuariosById(Integer codigoUsuario);
    Usuarios saveUsuarios(Usuarios usuarios) throws RuntimeException;
    Usuarios updateUsuarios(Integer codigoUsuario, Usuarios usuarios);
    void deleteUsuarios(Integer codigoUsuario);
}