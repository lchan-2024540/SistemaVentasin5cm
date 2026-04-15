package com.lchan.SistemaVentas.Service;

import com.lchan.SistemaVentas.Entity.Usuarios;
import java.util.List;

public interface UsuariosService {
    List<Usuarios> getAllUsuarios();
    Usuarios getUsuariosById(Integer codigoUsuario);
    Usuarios saveUsuarios(Usuarios usuarios) throws RuntimeException;
    Usuarios updateUsuarios(Integer codigoUsuario, Usuarios usuarios);
    void deleteUsuarios(Integer codigoUsuario);
    Usuarios login(String username, String password);
    Usuarios registrar(Usuarios usuarios) throws RuntimeException;
    Usuarios updateFoto(Integer codigoUsuario, byte[] foto);
    byte[] getFoto(Integer codigoUsuario);
}